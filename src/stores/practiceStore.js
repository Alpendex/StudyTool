import { defineStore } from 'pinia'
import localforage from 'localforage'

export const usePracticeStore = defineStore('practice', () => {
  const records = ref({})   // { [sectionId]: { [nodeId]: { correct, total, lastAt } } }

  async function load(sectionId) {
    if (records.value[sectionId]) return records.value[sectionId]
    const data = await localforage.getItem('pr_' + sectionId)
    records.value[sectionId] = data || {}
    return records.value[sectionId]
  }

  async function save(sectionId) {
    await localforage.setItem('pr_' + sectionId, JSON.parse(JSON.stringify(records.value[sectionId] || {})))
  }

  async function record(sectionId, nodeId, correct, total) {
    if (!records.value[sectionId]) records.value[sectionId] = {}
    records.value[sectionId][nodeId] = { correct, total, lastAt: new Date().toISOString() }
    await save(sectionId)
  }

  function getPracticedNodes(sectionId) {
    const recs = records.value[sectionId] || {}
    return Object.keys(recs).length
  }

  function getNodeRecord(sectionId, nodeId) {
    return (records.value[sectionId] || {})[nodeId] || null
  }

  return { records, load, save, record, getPracticedNodes, getNodeRecord }
})
