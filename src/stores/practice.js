import { defineStore } from 'pinia'
import localforage from 'localforage'

export const usePracticeStore = defineStore('practice', () => {
  const records = ref({})   // { [sectionId]: { [nodeId]: [{date,correct,total}] } }

  async function load(sectionId) {
    if (records.value[sectionId]) return
    const data = await localforage.getItem('pr_' + sectionId)
    records.value[sectionId] = data || {}
  }

  async function save(sectionId) {
    if (records.value[sectionId]) {
      await localforage.setItem('pr_' + sectionId, JSON.parse(JSON.stringify(records.value[sectionId])))
    }
  }

  async function record(sectionId, nodeId, correct, total) {
    if (!records.value[sectionId]) records.value[sectionId] = {}
    if (!records.value[sectionId][nodeId]) records.value[sectionId][nodeId] = []
    records.value[sectionId][nodeId].push({
      date: new Date().toISOString(), correct, total
    })
    await save(sectionId)
  }

  function getPracticedNodes(sectionId) {
    return Object.keys(records.value[sectionId] || {}).length
  }

  function getNodeRecords(sectionId, nodeId) {
    return records.value[sectionId]?.[nodeId] || []
  }

  return { records, load, save, record, getPracticedNodes, getNodeRecords }
})
