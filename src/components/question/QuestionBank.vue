<script setup>
import { useQuestionStore } from '../../stores/questionStore.js'
import { useMindmapStore } from '../../stores/mindmapStore.js'
import { QUESTION_TYPES } from '../../data/mockQuestions.js'
import QuestionFilters from './QuestionFilters.vue'
import QuestionForm from './QuestionForm.vue'
import QuestionList from './QuestionList.vue'

const props = defineProps({
  sections: Array,
  currentSectionId: String
})
const emit = defineEmits(['switchSection', 'practiceSingle'])

const qbStore = useQuestionStore()
const mindmapStore = useMindmapStore()

const activeSection = ref(props.currentSectionId)
const sidebarCollapsed = ref(false)
const searchText = ref('')
const filterNodeId = ref('')
const filterType = ref('')
const checkedIds = ref(new Set())
const editing = ref(false)
const form = ref({ id: null, nodeId: '', type: '简答', question: '', answer: '' })

const message = useMessage()

// Preload all section data on mount
const loading = ref(false)
onMounted(async () => {
  loading.value = true
  for (const s of props.sections) {
    if (!mindmapStore.getTree(s.id)) await mindmapStore.load(s.id)
    await qbStore.load(s.id)
  }
  loading.value = false
})

// Section question counts
const sectionCounts = computed(() => {
  const map = {}
  props.sections.forEach(s => { map[s.id] = qbStore.getAll(s.id).length })
  return map
})

// Node hierarchy for the current section
const tree = computed(() => mindmapStore.getTree(activeSection.value))

const nodeOptions = computed(() => {
  const opts = []
  function walk(n, d = 0) {
    opts.push({ label: '  '.repeat(d) + n.name, value: n.id })
    n.children?.forEach(c => walk(c, d + 1))
  }
  if (tree.value) walk(tree.value)
  return opts
})

const questions = computed(() => {
  let qs = qbStore.getAll(activeSection.value)
  if (searchText.value) {
    const s = searchText.value.toLowerCase()
    qs = qs.filter(q => q.question.toLowerCase().includes(s) || q.answer.toLowerCase().includes(s))
  }
  if (filterNodeId.value) qs = qs.filter(q => q.nodeId === filterNodeId.value)
  if (filterType.value) qs = qs.filter(q => q.type === filterType.value)
  return qs
})

function getNodePath(nodeId) {
  const parts = []
  function walk(n, path) {
    if (n.id === nodeId) { parts.push(...path, n.name); return true }
    if (n.children?.some(c => walk(c, [...path, n.name]))) return true
    return false
  }
  if (tree.value) walk(tree.value, [])
  return parts.length ? parts.join(' › ') : '(未关联)'
}

// ── Selection ──
const allChecked = computed({
  get: () => questions.value.length > 0 && questions.value.every(q => checkedIds.value.has(q.id)),
  set: (v) => {
    if (v) questions.value.forEach(q => checkedIds.value.add(q.id))
    else questions.value.forEach(q => checkedIds.value.delete(q.id))
    checkedIds.value = new Set(checkedIds.value)
  }
})
function toggleCheck(id) {
  const next = new Set(checkedIds.value)
  next.has(id) ? next.delete(id) : next.add(id)
  checkedIds.value = next
}
const checkedCount = computed(() => checkedIds.value.size)

async function batchDelete() {
  if (checkedCount.value === 0) return
  if (!window.confirm(`确定删除选中的 ${checkedCount.value} 道题目？`)) return
  for (const id of checkedIds.value) {
    await qbStore.remove(activeSection.value, id)
  }
  checkedIds.value = new Set()
  message.success(`已删除 ${checkedCount.value} 道题目`)
}

// ── CRUD ──
function startAdd() {
  editing.value = true
  form.value = { id: null, nodeId: filterNodeId.value || '', type: '简答', question: '', answer: '' }
}
function startEdit(q) {
  editing.value = true
  form.value = { ...q }
}
function cancelEdit() { editing.value = false }
async function saveEdit() {
  if (!form.value.question.trim() || !form.value.answer.trim()) return
  if (form.value.id) {
    await qbStore.update(activeSection.value, form.value.id, form.value)
  } else {
    await qbStore.add(activeSection.value, { ...form.value, nodeId: form.value.nodeId || '' })
  }
  editing.value = false
}
async function delQuestion(id) {
  if (!window.confirm('确定删除该题目？')) return
  await qbStore.remove(activeSection.value, id)
}

// ── Export ──
async function onExport() {
  const data = qbStore.getAll(activeSection.value)
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'questions_' + activeSection.value + '.json'; a.click()
  URL.revokeObjectURL(url); message.success('题库已导出')
}

// ── Section switch ──
async function onSelectSection(id) {
  activeSection.value = id
  checkedIds.value = new Set()
  filterNodeId.value = ''
  if (!mindmapStore.getTree(id)) await mindmapStore.load(id)
  await qbStore.load(id)
  emit('switchSection', id)
}
</script>

<template>
  <div class="qb-overview">
    <!-- Left: section list -->
    <aside class="qbov-sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="qbov-sidebar-header">
        <span v-if="!sidebarCollapsed" class="qbov-sidebar-title">📋 板块题库</span>
        <button class="qbov-sidebar-toggle" @click="sidebarCollapsed = !sidebarCollapsed" :title="sidebarCollapsed ? '展开侧栏' : '收起侧栏'">
          {{ sidebarCollapsed ? '▶' : '◀' }}
        </button>
      </div>
      <div
        v-for="s in sections" :key="s.id"
        class="qbov-section-item"
        :class="{ active: s.id === activeSection }"
        @click="onSelectSection(s.id)"
      >
        <span class="qbov-section-name">{{ sidebarCollapsed ? s.name.charAt(0) : s.name }}</span>
        <span v-if="!sidebarCollapsed" class="qbov-section-count">{{ sectionCounts[s.id] || 0 }} 题</span>
      </div>
    </aside>

    <!-- Right: question list -->
    <div class="qbov-main">
      <QuestionFilters
        :search-text="searchText"
        :filter-node-id="filterNodeId"
        :filter-type="filterType"
        :node-options="nodeOptions"
        @update:search-text="searchText = $event"
        @update:filter-node-id="filterNodeId = $event"
        @update:filter-type="filterType = $event"
        @add="startAdd"
        @export="onExport"
      />

      <QuestionForm
        v-if="editing"
        :form="form"
        :node-options="nodeOptions"
        @save="saveEdit"
        @cancel="cancelEdit"
      />

      <QuestionList
        :questions="questions"
        :checked-ids="checkedIds"
        :all-checked="allChecked"
        :checked-count="checkedCount"
        :node-path-fn="getNodePath"
        @update:all-checked="allChecked = $event"
        @toggle-check="toggleCheck"
        @clear-selection="checkedIds = new Set()"
        @batch-delete="batchDelete"
        @practice="emit('practiceSingle', $event)"
        @edit="startEdit"
        @delete="delQuestion"
      />
    </div>
  </div>
</template>

<style scoped>
.qb-overview {
  display: flex; flex: 1; overflow: hidden; min-height: 0;
}

/* ── Sidebar ── */
.qbov-sidebar {
  width: 200px; flex-shrink: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-right: 1px solid var(--border);
  overflow-y: auto; padding: var(--spacing-sm);
  display: flex; flex-direction: column; gap: 2px;
  transition: width 0.25s ease;
}
.qbov-sidebar.collapsed {
  width: 52px; padding: var(--spacing-xs);
}
.qbov-sidebar-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 6px;
}
.qbov-sidebar-title {
  font-size: var(--font-xs); color: var(--text-secondary);
  padding: var(--spacing-xs) 6px;
  text-transform: uppercase; letter-spacing: .05em;
  margin-bottom: 4px; font-weight: var(--font-weight-semibold);
}
.qbov-sidebar-toggle {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-sm); cursor: pointer;
  font-size: 0.65rem; padding: 2px 6px; color: var(--text-secondary);
  line-height: 1.4;
  transition: all var(--transition-fast);
}
.qbov-sidebar-toggle:hover { background: var(--surface); color: var(--text-primary); }
.qbov-sidebar.collapsed .qbov-sidebar-title { display: none; }
.qbov-section-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: var(--spacing-sm) 10px; border-radius: var(--radius-sm);
  cursor: pointer; transition: var(--transition-fast);
  font-size: var(--font-sm); color: var(--text-secondary);
  min-height: 44px; position: relative; z-index: 1;
  user-select: none; font-weight: var(--font-weight-medium);
}
.qbov-section-item:hover { background: var(--surface); color: var(--text-primary); }
.qbov-section-item.active {
  background: var(--accent-glow); color: var(--accent);
  font-weight: var(--font-weight-semibold);
}
.qbov-section-count {
  font-size: var(--font-xs); color: var(--text-secondary);
  background: var(--surface); padding: 2px 8px;
  border-radius: var(--radius-full); font-weight: var(--font-weight-medium);
}
.qbov-section-item.active .qbov-section-count { background: var(--accent-glow); color: var(--accent); }

/* ── Main ── */
.qbov-main {
  flex: 1; min-width: 0; display: flex; flex-direction: column;
  overflow: hidden; padding: var(--spacing-md);
}
.qbov-toolbar {
  display: flex; gap: 8px; margin-bottom: 12px;
  flex-wrap: wrap; align-items: center;
}

/* Batch bar */
.qbov-batch-bar {
  display: flex; align-items: center; gap: 10px;
  padding: var(--spacing-sm) 12px; margin-bottom: 8px;
  background: var(--accent-glow); border-radius: var(--radius-sm);
  font-size: var(--font-sm); font-weight: var(--font-weight-medium);
}

/* Edit card */
.qbov-edit-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-md); padding: var(--spacing-md);
  margin-bottom: 12px; box-shadow: var(--shadow-md);
}
.qbov-edit-row { display: flex; gap: 8px; margin-bottom: 8px; }
.qbov-edit-actions { display: flex; gap: 6px; justify-content: flex-end; }

/* ── List ── */
.qbov-list {
  flex: 1; overflow-y: auto; min-height: 0;
}
.qbov-empty {
  text-align: center; padding: 60px 20px;
  color: var(--text-secondary);
}
.qbov-row {
  display: flex; align-items: flex-start; gap: 10px;
  padding: 10px 12px; margin-bottom: 4px;
  border-radius: var(--radius-md); border: 1px solid transparent;
  transition: var(--transition-fast);
}
.qbov-row:hover { background: var(--surface); border-color: var(--border); }
.qbov-row.checked { background: var(--accent-glow); border-color: var(--accent-glow); }
.qbov-row-main { flex: 1; min-width: 0; }
.qbov-row-top {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 4px;
}
.qbov-row-node {
  font-size: var(--font-xs); color: var(--text-secondary);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.qbov-row-question {
  font-size: var(--font-sm); line-height: var(--line-height);
  color: var(--text-primary);
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
  overflow: hidden;
}
.qbov-row-actions {
  display: flex; gap: 4px; flex-shrink: 0; align-items: center;
}
.qbov-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 10px; border-top: 1px solid var(--border);
  margin-top: 8px; font-size: var(--font-xs); color: var(--text-secondary);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .qbov-sidebar { display: none; }
  .qbov-main { padding: var(--spacing-sm); }
  .qbov-toolbar { gap: 6px; }
  .qbov-row-actions { flex-direction: column; gap: 2px; }
}
</style>
