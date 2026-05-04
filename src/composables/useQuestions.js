// Shared question CRUD logic — used by QuestionBank and QuestionBankModal
import { useQuestionStore } from '../stores/questionStore.js'
import { useMindmapStore } from '../stores/mindmapStore.js'

export function useQuestions() {
  const questionStore = useQuestionStore()
  const mindmapStore = useMindmapStore()

  const editing = ref(false)
  const form = ref({ id: null, nodeId: '', type: '简答', question: '', answer: '' })
  const searchText = ref('')
  const filterNodeId = ref('')
  const filterType = ref('')

  function startAdd(presetNodeId) {
    editing.value = true
    form.value = { id: null, nodeId: presetNodeId || '', type: '简答', question: '', answer: '' }
  }

  function startEdit(q) {
    editing.value = true
    form.value = { ...q }
  }

  function cancelEdit() {
    editing.value = false
  }

  async function saveEdit(sectionId) {
    if (!form.value.question.trim() || !form.value.answer.trim()) return
    if (form.value.id) {
      await questionStore.update(sectionId, form.value.id, form.value)
    } else {
      await questionStore.add(sectionId, { ...form.value, nodeId: form.value.nodeId || '' })
    }
    editing.value = false
  }

  async function delQuestion(sectionId, id) {
    if (!window.confirm('确定删除该题目？')) return
    await questionStore.remove(sectionId, id)
  }

  function buildNodeOptions(tree) {
    const opts = []
    function walk(n, d = 0) {
      opts.push({ label: '  '.repeat(d) + n.name, value: n.id })
      n.children?.forEach(c => walk(c, d + 1))
    }
    if (tree) walk(tree)
    return opts
  }

  return {
    editing, form, searchText, filterNodeId, filterType,
    startAdd, startEdit, cancelEdit, saveEdit, delQuestion, buildNodeOptions
  }
}
