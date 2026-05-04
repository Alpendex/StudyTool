// Storage key constants — single source of truth for localForage keys
export const STORAGE_KEYS = {
  sections: 'sections',
  currentSection: 'currentSection',
  mindmap: (id) => 'mm_' + id,
  questionBank: (id) => 'qb_' + id,
  practice: (id) => 'pr_' + id,
}
