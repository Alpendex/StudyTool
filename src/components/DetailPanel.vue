<script setup>
import { useQuestionBankStore } from '../stores/questionBank.js'

const props = defineProps({ node: Object, sectionId: String })
const emit = defineEmits(['rename', 'addChild', 'delete', 'updateExamPoints', 'addQuestion', 'startPractice'])

const qbStore = useQuestionBankStore()

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
    <!-- Empty -->
    <div v-if="!node" class="detail-empty">
      <div style="font-size:2rem;opacity:.3">👆</div>
      <p>点击思维导图节点查看详情</p>
      <p style="font-size:.75rem;color:#cbd5e1">右键节点可快速编辑</p>
    </div>

    <!-- Content -->
    <div v-else class="detail-content">
      <!-- Header with name -->
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;gap:6px">
        <div style="flex:1;min-width:0">
          <strong v-if="!editingName" style="font-size:1rem;color:#4f46e5;word-break:break-all">{{ node.name }}</strong>
          <input v-else id="editNameInput" v-model="editName" @keydown.enter="saveName" @keydown.escape="cancelEditName"
            @blur="saveName" style="width:100%;font-size:1rem;border:1px solid #4f46e5;border-radius:6px;padding:4px 8px">
        </div>
        <n-button-group size="tiny" v-if="!editingName">
          <n-button size="tiny" @click="startEditName" title="编辑名称">✏️</n-button>
          <n-button size="tiny" @click="emit('addChild', window.prompt('输入子节点名称:'))" title="添加子节点">➕</n-button>
          <n-button size="tiny" type="error" @click="emit('delete')" title="删除节点">🗑️</n-button>
        </n-button-group>
      </div>

      <!-- Metadata -->
      <div class="detail-meta" v-if="node.sourceFile || node.createdAt">
        <span v-if="node.sourceFile">📄 来源: {{ node.sourceFile }}</span>
        <span v-if="node.createdAt" style="margin-left:10px">🕒 {{ formatDate(node.createdAt) }}</span>
      </div>

      <!-- Exam Points -->
      <div style="margin-bottom:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
          <strong style="font-size:.85rem">📌 高频考点</strong>
          <n-button size="tiny" secondary @click="showAddEp = !showAddEp">＋ 添加</n-button>
        </div>
        <div v-if="node.examPoints?.length">
          <div v-for="(ep, i) in node.examPoints" :key="i" class="exam-point-item">
            <span style="flex:1">{{ ep }}</span>
            <span @click="delExamPoint(i)" style="cursor:pointer;opacity:.4;transition:.15s" title="删除">×</span>
          </div>
        </div>
        <div v-else style="color:#9ca3af;font-size:.78rem">暂无考点</div>
        <div v-if="showAddEp" style="display:flex;gap:4px;margin-top:6px">
          <input v-model="newEp" @keydown.enter="addExamPoint" @keydown.escape="showAddEp=false" placeholder="输入新考点..."
            style="flex:1;padding:4px 8px;border:1px solid #e5e7eb;border-radius:4px;font-size:.8rem">
          <n-button size="tiny" type="primary" @click="addExamPoint">保存</n-button>
          <n-button size="tiny" @click="showAddEp=false">取消</n-button>
        </div>
      </div>

      <!-- Related Questions -->
      <div style="margin-bottom:16px">
        <strong style="font-size:.85rem">📝 关联题目 ({{ relatedQuestions.length }}道)</strong>
        <div v-if="relatedQuestions.length === 0" style="color:#9ca3af;font-size:.78rem;margin-top:4px">暂无关联题目</div>
        <div v-for="q in relatedQuestions.slice(0,10)" :key="q.id" class="question-rel-item">
          <span :class="'q-type-tag q-type-'+(q.type||'简答')">{{ q.type||'简答' }}</span>
          <div style="margin:4px 0;line-height:1.5">{{ q.question }}</div>
          <n-collapse>
            <n-collapse-item title="查看答案" name="a"><p style="color:#6b7280;font-size:.78rem">{{ q.answer }}</p></n-collapse-item>
          </n-collapse>
        </div>
      </div>

      <!-- Buttons -->
      <n-button type="primary" block @click="emit('startPractice')" style="margin-bottom:6px">🎯 开始练习（3道题）</n-button>
      <n-button block secondary @click="emit('addQuestion')">＋ 为该节点添加题目</n-button>
    </div>
  </div>
</template>
