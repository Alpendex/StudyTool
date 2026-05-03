<script setup>
import { h } from 'vue'
import { useQuestionBankStore } from '../stores/questionBank.js'
import { useMindmapStore } from '../stores/mindmap.js'
import { findNode } from '../utils/helpers.js'
import { QUESTION_TYPES } from '../data/mockQuestions.js'

const props = defineProps({ sectionId: String, presetNodeId: String })
const emit = defineEmits(['close'])

const qbStore = useQuestionBankStore()
const mindmapStore = useMindmapStore()

const filterNodeId = ref(props.presetNodeId || '')
const searchText = ref('')
const editing = ref(false)
const form = ref({ id: null, nodeId: props.presetNodeId || '', type: '简答', question: '', answer: '' })

const tree = computed(() => mindmapStore.getTree(props.sectionId))

// Build node name map
const nodeNames = computed(() => {
  const map = {}
  function walk(n, d = 0) { map[n.id] = '  '.repeat(d) + n.name; n.children?.forEach(c => walk(c, d + 1)) }
  if (tree.value) walk(tree.value)
  return map
})

const filteredQuestions = computed(() => {
  let qs = qbStore.getAll(props.sectionId)
  if (filterNodeId.value) qs = qs.filter(q => q.nodeId === filterNodeId.value)
  if (searchText.value) {
    const s = searchText.value.toLowerCase()
    qs = qs.filter(q => q.question.toLowerCase().includes(s) || q.answer.toLowerCase().includes(s))
  }
  return qs
})

function getNodeName(id) { return nodeNames.value[id] || '(未关联节点)' }

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
    await qbStore.update(props.sectionId, form.value.id, form.value)
  } else {
    await qbStore.add(props.sectionId, form.value)
  }
  editing.value = false
}

async function delQuestion(id) {
  await qbStore.remove(props.sectionId, id)
}

const message = useMessage()
async function onExport() {
  const data = qbStore.getAll(props.sectionId)
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = 'questions_export.json'; a.click()
  URL.revokeObjectURL(url); message.success('题库已导出')
}
</script>

<template>
  <n-modal :show="true" preset="card" title="📋 题库管理" style="max-width:820px;width:95%" :on-close="emit('close')">
    <!-- Filters -->
    <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:center">
      <n-select v-model:value="filterNodeId" :options="[{label:'全部节点',value:''},...Object.entries(nodeNames).map(([id,n]) => ({label:n,value:id}))]"
        placeholder="筛选节点" style="width:180px" size="small" clearable />
      <n-input v-model:value="searchText" placeholder="搜索题目..." size="small" style="width:160px" clearable />
      <n-button size="small" type="primary" @click="startAdd">＋ 添加题目</n-button>
      <n-button size="small" @click="onExport" style="margin-left:auto">导出题库</n-button>
    </div>

    <!-- Edit form -->
    <n-card v-if="editing" size="small" style="margin-bottom:12px;background:#f8fafc">
      <div style="display:flex;gap:8px;margin-bottom:8px">
        <n-select v-model:value="form.nodeId" :options="Object.entries(nodeNames).map(([id,n]) => ({label:n,value:id}))"
          placeholder="选择节点" style="flex:1" size="small" />
        <n-select v-model:value="form.type" :options="QUESTION_TYPES.map(t=>({label:t,value:t}))"
          style="width:100px" size="small" />
      </div>
      <n-input v-model:value="form.question" type="textarea" placeholder="输入题干..." size="small" :rows="2" style="margin-bottom:6px" />
      <n-input v-model:value="form.answer" type="textarea" placeholder="输入答案要点..." size="small" :rows="2" style="margin-bottom:8px" />
      <div style="display:flex;gap:6px;justify-content:flex-end">
        <n-button size="small" @click="cancelEdit">取消</n-button>
        <n-button size="small" type="primary" @click="saveEdit">{{ form.id ? '保存' : '添加' }}</n-button>
      </div>
    </n-card>

    <!-- Table -->
    <n-data-table :data="filteredQuestions" :columns="[
      { title:'题干', key:'question', ellipsis:{tooltip:true}, width:300 },
      { title:'题型', key:'type', width:70, render:(row) => h('span',{class:'q-type-tag q-type-'+row.type},row.type) },
      { title:'节点', key:'nodeId', width:120, render:(row) => h('span',{style:'font-size:.75rem'},getNodeName(row.nodeId)) },
      { title:'操作', key:'actions', width:110, render:(row) => [
        h('n-button',{size:'tiny',onClick:()=>startEdit(row),style:'margin-right:4px'},'编辑'),
        h('n-button',{size:'tiny',type:'error',onClick:()=>delQuestion(row.id)},'删除')
      ]}
    ]" :pagination="{pageSize:15}" size="small" :row-key="(r)=>r.id"
      :empty-text="'暂无题目'" />

    <template #footer><n-button @click="emit('close')">关闭</n-button></template>
  </n-modal>
</template>
