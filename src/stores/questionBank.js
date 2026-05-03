import { defineStore } from 'pinia'
import localforage from 'localforage'
import { MOCK_QUESTIONS } from '../data/mockQuestions.js'
import { qid } from '../utils/helpers.js'

export const useQuestionBankStore = defineStore('questionBank', () => {
  const banks = ref({})   // { [sectionId]: Question[] }

  async function load(sectionId) {
    if (banks.value[sectionId]) return banks.value[sectionId]
    let data = await localforage.getItem('qb_' + sectionId)
    if (!data) {
      const mock = MOCK_QUESTIONS[sectionId] || []
      data = mock.map(m => ({ ...m, id: qid(), nodeId: '', createdAt: new Date().toISOString() }))
      await localforage.setItem('qb_' + sectionId, data)
    }
    banks.value[sectionId] = data
    return data
  }

  async function save(sectionId) {
    if (banks.value[sectionId]) {
      await localforage.setItem('qb_' + sectionId, JSON.parse(JSON.stringify(banks.value[sectionId])))
    }
  }

  async function add(sectionId, question) {
    if (!question.question?.trim() || !question.answer?.trim()) return null
    const bank = banks.value[sectionId]
    if (!bank) return null
    const entry = {
      id: qid(), nodeId: question.nodeId || '',
      type: question.type || '简答',
      question: question.question.trim(),
      answer: question.answer.trim(),
      createdAt: new Date().toISOString()
    }
    bank.push(entry)
    await save(sectionId)
    return entry
  }

  async function update(sectionId, questionId, data) {
    const bank = banks.value[sectionId]
    if (!bank) return
    const idx = bank.findIndex(q => q.id === questionId)
    if (idx < 0) return
    Object.assign(bank[idx], {
      nodeId: data.nodeId ?? bank[idx].nodeId,
      type: data.type ?? bank[idx].type,
      question: data.question?.trim() ?? bank[idx].question,
      answer: data.answer?.trim() ?? bank[idx].answer
    })
    await save(sectionId)
  }

  async function remove(sectionId, questionId) {
    const bank = banks.value[sectionId]
    if (!bank) return
    banks.value[sectionId] = bank.filter(q => q.id !== questionId)
    await save(sectionId)
  }

  // Remove all questions for a set of node IDs (cascade)
  async function removeByNodeIds(sectionId, nodeIds) {
    const bank = banks.value[sectionId]
    if (!bank) return 0
    const before = bank.length
    banks.value[sectionId] = bank.filter(q => !nodeIds.has(q.nodeId))
    await save(sectionId)
    return before - banks.value[sectionId].length
  }

  function getByNode(sectionId, nodeId) {
    return (banks.value[sectionId] || []).filter(q => q.nodeId === nodeId)
  }

  function getAll(sectionId) {
    return banks.value[sectionId] || []
  }

  return { banks, load, save, add, update, remove, removeByNodeIds, getByNode, getAll }
})
