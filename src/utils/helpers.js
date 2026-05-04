export function uid() {
  return 'n' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

export function qid() {
  return 'q' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

// Deep clone via JSON (sufficient for tree data)
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}
