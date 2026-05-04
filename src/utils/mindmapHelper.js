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

// Mount a subtree under a specific parent node. Returns merged tree + new node IDs.
export function mountSubtree(tree, parentId, subtree) {
  const merged = deepClone(tree)
  const parent = findNode(merged, parentId)
  if (!parent) return { mergedTree: tree, newIds: [] }
  if (!parent.children) parent.children = []
  const newIds = []
  const incoming = subtree.children || []
  for (const child of incoming) {
    parent.children.push(child)
    newIds.push(child.id)
  }
  return { mergedTree: merged, newIds }
}

// Detect name conflicts between incoming children and existing children of a parent
export function findConflicts(tree, parentId, incomingNames) {
  const parent = findNode(tree, parentId)
  if (!parent?.children) return []
  const existingNames = new Set(parent.children.map(c => c.name))
  return incomingNames.filter(n => existingNames.has(n))
}

// Levenshtein distance for string similarity
export function levenshteinDistance(a, b) {
  const m = a.length; const n = b.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

// Find nodes with similar names (returns array of {existingName, incomingName, similarity})
export function findSimilarNodes(tree, incomingNames, threshold = 0.8) {
  const existingNames = []
  function collect(n) {
    existingNames.push(n.name)
    n.children?.forEach(collect)
  }
  if (tree) collect(tree)
  const results = []
  for (const inc of incomingNames) {
    for (const exist of existingNames) {
      const maxLen = Math.max(inc.length, exist.length)
      if (maxLen === 0) continue
      const sim = 1 - levenshteinDistance(inc.toLowerCase(), exist.toLowerCase()) / maxLen
      if (sim >= threshold) results.push({ existingName: exist, incomingName: inc, similarity: Math.round(sim * 100) / 100 })
    }
  }
  return results
}

// Build human-readable path from root to a node (e.g. "高等数学 > 函数与极限")
export function getNodePath(tree, nodeId) {
  const parts = []
  function walk(n, path) {
    if (n.id === nodeId) { parts.push(...path, n.name); return true }
    if (n.children?.some(c => walk(c, [...path, n.name]))) return true
    return false
  }
  if (tree) walk(tree, [])
  return parts.length ? parts.join(' > ') : ''
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
