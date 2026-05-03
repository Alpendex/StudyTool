import { defineStore } from 'pinia'
import localforage from 'localforage'
import { MINDMAP_TEMPLATES } from '../data/templates.js'
import { uid, addIds, ensureIds, findNode, findParent,
         collectNodeIds, deepClone, mergeMindMaps } from '../utils/helpers.js'

export const useMindmapStore = defineStore('mindmap', () => {
  const trees = ref({})

  async function load(sectionId) {
    if (trees.value[sectionId]) return trees.value[sectionId]
    let data = await localforage.getItem('mm_' + sectionId)
    if (!data) {
      const tpl = MINDMAP_TEMPLATES[sectionId]
      if (tpl) { data = deepClone(tpl); addIds(data) }
      else { data = { name: sectionId, children: [], id: uid() } }
      await localforage.setItem('mm_' + sectionId, data)
    }
    trees.value[sectionId] = data
    return data
  }

  async function save(sectionId) {
    if (trees.value[sectionId]) {
      await localforage.setItem('mm_' + sectionId, deepClone(trees.value[sectionId]))
    }
  }

  function getTree(sectionId) { return trees.value[sectionId] || null }

  async function addChild(sectionId, parentId, name) {
    if (!name?.trim()) return null
    const tree = trees.value[sectionId]
    if (!tree) return null
    const parent = parentId ? findNode(tree, parentId) : tree
    if (!parent) return null
    if (!parent.children) parent.children = []
    const child = { name: name.trim(), id: uid(), examPoints: [], children: [] }
    parent.children.push(child)
    await save(sectionId)
    return child
  }

  async function rename(sectionId, nodeId, newName) {
    if (!newName?.trim()) return
    const node = findNode(trees.value[sectionId], nodeId)
    if (!node) return
    node.name = newName.trim()
    await save(sectionId)
  }

  async function removeNode(sectionId, nodeId) {
    const tree = trees.value[sectionId]
    if (!tree || tree.id === nodeId) return 0
    const node = findNode(tree, nodeId)
    if (!node) return 0
    const ids = collectNodeIds(node)
    const parent = findParent(tree, nodeId)
    if (!parent) return 0
    parent.children = parent.children.filter(c => c.id !== nodeId)
    await save(sectionId)
    return ids.size
  }

  async function mergeImport(sectionId, incoming) {
    const existing = trees.value[sectionId]
    const merged = mergeMindMaps(existing, incoming)
    trees.value[sectionId] = merged
    await save(sectionId)
    return merged
  }

  async function updateExamPoints(sectionId, nodeId, points) {
    const node = findNode(trees.value[sectionId], nodeId)
    if (!node) return
    node.examPoints = points
    await save(sectionId)
  }

  return { trees, load, save, getTree, addChild, rename, removeNode, mergeImport, updateExamPoints }
})
