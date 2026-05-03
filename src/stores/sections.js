import { defineStore } from 'pinia'
import localforage from 'localforage'
import { DEFAULT_SECTIONS } from '../data/templates.js'
import { uid } from '../utils/helpers.js'

export const useSectionsStore = defineStore('sections', () => {
  const list = ref([])
  const currentId = ref('math')
  const loaded = ref(false)

  async function load() {
    let data = await localforage.getItem('sections')
    if (!data || !Array.isArray(data)) data = JSON.parse(JSON.stringify(DEFAULT_SECTIONS))
    // Ensure defaults exist
    DEFAULT_SECTIONS.forEach(ds => {
      if (!data.find(s => s.id === ds.id)) data.unshift({ ...ds })
    })
    list.value = data
    const saved = await localforage.getItem('currentSection')
    if (saved && data.find(s => s.id === saved)) currentId.value = saved
    loaded.value = true
  }

  async function save() {
    await localforage.setItem('sections', JSON.parse(JSON.stringify(list.value)))
  }

  async function create(name) {
    if (!name?.trim()) return null
    if (list.value.find(s => s.name === name.trim())) return null
    const sec = { id: uid(), name: name.trim(), color: 'custom', isDefault: false }
    list.value.push(sec)
    await save()
    return sec
  }

  async function remove(id) {
    const sec = list.value.find(s => s.id === id)
    if (!sec || sec.isDefault) return false
    list.value = list.value.filter(s => s.id !== id)
    await save()
    // Clean data
    await localforage.removeItem('mm_' + id)
    await localforage.removeItem('qb_' + id)
    await localforage.removeItem('pr_' + id)
    if (currentId.value === id) switchTo('math')
    return true
  }

  async function switchTo(id) {
    currentId.value = id
    await localforage.setItem('currentSection', id)
  }

  function getById(id) { return list.value.find(s => s.id === id) }
  const current = computed(() => getById(currentId.value))

  return { list, currentId, current, loaded, load, save, create, remove, switchTo, getById }
})
