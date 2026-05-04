<script setup>
import { useQuestionStore } from '../../stores/questionStore.js'

const props = defineProps({ node: Object, sectionId: String })
const emit = defineEmits(['rename', 'addChild', 'delete', 'updateExamPoints', 'addQuestion', 'startPractice', 'close'])

const qbStore = useQuestionStore()

const editingName = ref(false)
const editName = ref('')
const showAddEp = ref(false)
const newEp = ref('')

const relatedQuestions = computed(() => {
  if (!props.node) return []
  return qbStore.getByNode(props.sectionId, props.node.id)
})

function startEditName() { editName.value = props.node?.name || ''; editingName.value = true; nextTick(() => document.getElementById('editNameInput')?.focus()) }
function saveName() { if (editName.value.trim()) emit('rename', editName.value.trim()); editingName.value = false }
function cancelEditName() { editingName.value = false }

function delExamPoint(idx) {
  if (!props.node?.examPoints) return
  const pts = [...props.node.examPoints]
  pts.splice(idx, 1)
  emit('updateExamPoints', pts)
}
function addExamPoint() {
  if (!newEp.value.trim()) return
  const pts = [...(props.node?.examPoints || []), newEp.value.trim()]
  emit('updateExamPoints', pts)
  newEp.value = ''; showAddEp.value = false
}

function formatDate(iso) { return iso ? new Date(iso).toLocaleString('zh-CN') : '' }
</script>

<template>
  <div class="detail-panel">
    <button class="detail-close" @click="emit('close')" title="关闭面板">✕</button>
    <!-- Empty -->
    <div v-if="!node" class="detail-empty">
      <div class="empty-icon">👆</div>
      <p>点击思维导图节点查看详情</p>
      <p class="empty-sub">右键节点可快速编辑</p>
    </div>

    <!-- Content -->
    <div v-else class="detail-content">
      <!-- Name row -->
      <div class="detail-name-row">
        <div class="detail-name-wrap">
          <strong v-if="!editingName" class="detail-name">{{ node.name }}</strong>
          <input v-else id="editNameInput" v-model="editName" @keydown.enter="saveName" @keydown.escape="cancelEditName"
            @blur="saveName" class="detail-name-input">
        </div>
        <span v-if="!editingName" class="name-actions">
          <n-button size="tiny" @click="startEditName" title="编辑名称">✏️</n-button>
          <n-button size="tiny" @click="emit('addChild', window.prompt('输入子节点名称:'))" title="添加子节点">➕</n-button>
          <n-button size="tiny" type="error" @click="emit('delete')" title="删除节点">🗑️</n-button>
        </span>
      </div>

      <!-- Metadata -->
      <div class="detail-meta" v-if="node.sourceFile || node.createdAt">
        <span v-if="node.sourceFile">📄 来源: {{ node.sourceFile }}</span>
        <span v-if="node.createdAt">🕒 {{ formatDate(node.createdAt) }}</span>
      </div>

      <!-- Exam Points -->
      <div class="detail-section">
        <div class="detail-section-header">
          <strong>📌 高频考点</strong>
          <n-button size="tiny" secondary @click="showAddEp = !showAddEp">＋ 添加</n-button>
        </div>
        <div v-if="node.examPoints?.length">
          <div v-for="(ep, i) in node.examPoints" :key="i" class="exam-point-item">
            <span class="ep-text">{{ ep }}</span>
            <span class="ep-del" @click="delExamPoint(i)" title="删除">×</span>
          </div>
        </div>
        <div v-else class="detail-empty-text">暂无考点</div>
        <div v-if="showAddEp" class="add-ep-row">
          <input v-model="newEp" @keydown.enter="addExamPoint" @keydown.escape="showAddEp=false" placeholder="输入新考点..."
            class="detail-input">
          <n-button size="tiny" type="primary" @click="addExamPoint">保存</n-button>
          <n-button size="tiny" @click="showAddEp=false">取消</n-button>
        </div>
      </div>

      <!-- Related Questions -->
      <div class="detail-section">
        <strong class="detail-section-title">📝 关联题目 ({{ relatedQuestions.length }}道)</strong>
        <div v-if="relatedQuestions.length === 0" class="detail-empty-text" style="margin-top:4px">暂无关联题目</div>
        <div v-for="q in relatedQuestions.slice(0,10)" :key="q.id" class="q-rel-item">
          <span :class="'q-badge ' + (q.type||'简答')">{{ q.type||'简答' }}</span>
          <div class="q-text">{{ q.question }}</div>
          <n-collapse>
            <n-collapse-item title="查看答案" name="a"><p class="q-answer">{{ q.answer }}</p></n-collapse-item>
          </n-collapse>
        </div>
      </div>

      <!-- Action buttons -->
      <n-button type="primary" block @click="emit('startPractice')" style="margin-bottom:6px">🎯 开始练习（3道题）</n-button>
      <n-button block secondary @click="emit('addQuestion')">＋ 为该节点添加题目</n-button>
    </div>
  </div>
</template>

<style scoped>
.detail-close {
  position: absolute; top: 12px; right: 12px; z-index: 5;
  width: 32px; height: 32px; border-radius: var(--radius-full);
  border: 1px solid var(--border); background: var(--surface);
  color: var(--text-secondary); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.9rem; transition: all var(--transition-fast);
}
.detail-close:hover {
  background: var(--surface-hover); color: var(--text-primary);
  border-color: var(--border-hover); box-shadow: var(--glow-sm);
}
.detail-content {
  padding: var(--spacing-lg);
}
.detail-name-row {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px; gap: 8px;
}
.detail-name-wrap { flex: 1; min-width: 0; }
.detail-name {
  font-size: var(--font-xl); font-family: var(--font-display);
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  word-break: break-all;
}
.detail-name-input {
  width: 100%; font-size: var(--font-xl); font-weight: var(--font-weight-semibold);
  border: 1px solid var(--border-active);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  background: var(--surface);
  color: var(--text-primary);
  outline: none;
  box-shadow: var(--glow-sm);
}
.name-actions { display: flex; gap: 4px; flex-shrink: 0; }
.detail-section {
  margin-bottom: var(--spacing-lg);
}
.detail-section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 10px;
  color: var(--text-primary);
}
.detail-section-title {
  font-size: var(--font-sm); font-weight: var(--font-weight-semibold);
  margin-bottom: 8px; display: block; color: var(--text-primary);
}
.detail-empty-text {
  color: var(--text-tertiary);
  font-size: var(--font-xs);
}
.add-ep-row {
  display: flex; gap: 6px; margin-top: 8px;
}
.detail-input {
  flex: 1; padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: var(--font-sm);
  background: var(--surface);
  color: var(--text-primary);
  outline: none;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.detail-input:focus {
  border-color: var(--accent);
  box-shadow: var(--glow-sm);
}
.ep-text { flex: 1; color: var(--text-primary); }
.ep-del {
  cursor: pointer; opacity: 0; transition: var(--transition-fast);
  color: var(--danger); font-weight: var(--font-weight-bold);
}
.q-text { margin: 4px 0; line-height: var(--line-height); font-size: var(--font-sm); color: var(--text-primary); }
.q-answer { color: var(--text-secondary); font-size: var(--font-xs); }
.empty-icon { font-size: 2.5rem; opacity: .15; margin-bottom: 4px; }
.empty-sub { font-size: var(--font-xs); color: var(--text-tertiary); }
</style>
