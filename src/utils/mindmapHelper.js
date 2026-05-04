// Mindmap tree operations — find, traverse, merge, transform
import { uid, deepClone } from './helpers.js'

// Find a node by ID
export function findNode(tree, id) {
  if (!tree) return null
  if (tree.id === id) return tree
  if (tree.children) {
    for (const c of tree.children) {
      const found = findNode(c, id)
      if (found) return found
    }
  }
  return null
}

// Find parent of a node
export function findParent(tree, id, parent = null) {
  if (!tree) return null
  if (tree.children) {
    for (const c of tree.children) {
      if (c.id === id) return tree
      const f = findParent(c, id, c)
      if (f) return f
    }
  }
  return null
}

// Count total nodes
export function countAllNodes(node) {
  if (!node) return 0
  let n = 1
  if (node.children) node.children.forEach(c => n += countAllNodes(c))
  return n
}

// Collect all node IDs in a subtree
export function collectNodeIds(node, set = new Set()) {
  set.add(node.id)
  if (node.children) node.children.forEach(c => collectNodeIds(c, set))
  return set
}

// Add IDs recursively to a tree
export function addIds(node) {
  node.id = uid()
  if (node.children) node.children.forEach(addIds)
}

// Ensure IDs exist (don't overwrite)
export function ensureIds(node) {
  if (!node.id) node.id = uid()
  if (node.children) node.children.forEach(ensureIds)
}

// Transform tree for ECharts
export function toEChartsTree(node, depth = 0) {
  const r = { name: node.name, id: node.id, value: node.name }
  if (node.children && node.children.length > 0) {
    r.children = node.children.map(c => toEChartsTree(c, depth + 1))
  }
  if (depth >= 2) r.collapsed = true
  return r
}

// Merge two mind maps
export function mergeMindMaps(existing, incoming) {
  if (!incoming?.children) return existing || incoming
  const merged = existing ? deepClone(existing) : { name: incoming.name || '导入', children: [], id: incoming.id || uid() }
  ensureIds(merged)
  if (!merged.children) merged.children = []
  const nameMap = new Map()
  merged.children.forEach(c => nameMap.set(c.name, c))
  for (const inc of incoming.children) {
    if (nameMap.has(inc.name)) {
      const exist = nameMap.get(inc.name)
      if (inc.children && exist.children) {
        const subNames = new Set(exist.children.map(c => c.name))
        for (const s of inc.children) {
          if (!subNames.has(s.name)) exist.children.push(s)
        }
      }
    } else {
      merged.children.push(inc)
    }
  }
  return merged
}
