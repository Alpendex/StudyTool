// Shared practice flow logic — used by PracticePage and (legacy) PracticeModal
import { useQuestionStore } from '../stores/questionStore.js'
import { useMindmapStore } from '../stores/mindmapStore.js'
import { usePracticeStore } from '../stores/practiceStore.js'
import { findNode } from '../utils/mindmapHelper.js'
import { MOCK_QUESTIONS } from '../data/mockQuestions.js'

export function usePractice() {
  const questionStore = useQuestionStore()
  const mindmapStore = useMindmapStore()
  const practiceStore = usePracticeStore()

  const step = ref(0)
  const questions = ref([])
  const results = ref([])
  const answerRevealed = ref(false)
  const nodeName = ref('练习')

  const currentQuestion = computed(() => questions.value[step.value])

  function initQuestions(sectionId, nodeId, singleQuestion) {
    step.value = 0
    answerRevealed.value = false
    if (singleQuestion) {
      const tree = mindmapStore.getTree(sectionId)
      const node = findNode(tree, singleQuestion.nodeId || nodeId)
      nodeName.value = node?.name || '练习'
      questions.value = [singleQuestion]
    } else {
      const tree = mindmapStore.getTree(sectionId)
      const node = findNode(tree, nodeId)
      nodeName.value = node?.name || '练习'
      let qs = questionStore.getByNode(sectionId, nodeId)
      if (qs.length < 3) {
        const rest = questionStore.getAll(sectionId).filter(q => q.nodeId !== nodeId)
        qs = [...qs, ...rest]
      }
      if (qs.length < 3) {
        const mock = MOCK_QUESTIONS[sectionId] || MOCK_QUESTIONS.math
        qs = [...qs, ...mock]
      }
      questions.value = qs.slice(0, 3)
    }
    results.value = new Array(questions.value.length).fill(undefined)
  }

  function revealAnswer() {
    answerRevealed.value = true
  }

  function selfEvaluate(result) {
    results.value[step.value] = result
    answerRevealed.value = false
  }

  function nextQuestion() {
    return step.value < questions.value.length - 1
  }

  function advanceStep() {
    if (step.value < questions.value.length - 1) {
      step.value++
      answerRevealed.value = false
      return true
    }
    return false
  }

  async function finish(sectionId, nodeId) {
    const correct = results.value.filter(r => r === 'correct').length
    await practiceStore.record(sectionId, nodeId, correct, questions.value.length)
  }

  return {
    step, questions, results, answerRevealed, nodeName, currentQuestion,
    initQuestions, revealAnswer, selfEvaluate, nextQuestion, advanceStep, finish
  }
}
