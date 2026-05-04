import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const theme = ref(localStorage.getItem('theme') || 'dark')
  const currentView = ref('mindmap') // 'mindmap' | 'questionBank' | 'practice'
  const previousView = ref('mindmap')
  const sidebarOpen = ref(window.innerWidth > 1100)
  const initError = ref(null)

  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', theme.value)
  }

  watch(theme, (v) => {
    document.documentElement.setAttribute('data-theme', v)
  }, { immediate: true })

  return { theme, currentView, previousView, sidebarOpen, initError, toggleTheme }
})
