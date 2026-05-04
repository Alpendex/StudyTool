<script setup>
import localforage from 'localforage'
import { createDiscreteApi, darkTheme } from 'naive-ui'
const { message } = createDiscreteApi(['message'])
import { useBlockStore } from './stores/blockStore.js'
import { useMindmapStore } from './stores/mindmapStore.js'
import { useQuestionStore } from './stores/questionStore.js'
import { usePracticeStore } from './stores/practiceStore.js'
import { useUiStore } from './stores/uiStore.js'
import { usePdfParser } from './composables/usePdfParser.js'
import { findNode, countAllNodes } from './utils/mindmapHelper.js'
import AppHeader from './components/common/AppHeader.vue'
import UploadPdfModal from './components/common/UploadPdfModal.vue'
import InstallBanner from './components/common/InstallBanner.vue'
import MindMapView from './views/MindMapView.vue'
import QuestionBankView from './views/QuestionBankView.vue'
import PracticeView from './views/PracticeView.vue'

const blockStore = useBlockStore()
const mindmapStore = useMindmapStore()
const questionStore = useQuestionStore()
const practiceStore = usePracticeStore()
const uiStore = useUiStore()

const currentNodeId = ref(null)
const showUpload = ref(false)
const practiceQuestion = ref(null)
const detailPanelOpen = ref(false)
const undoSnapshot = ref(null)
const highlightedNodeIds = ref([])

// ─── Ambient glow mouse tracking ───
const mouseX = ref(0)
const mouseY = ref(0)
let glowRaf = null
function onMouseMove(e) {
  if (!glowRaf) {
    glowRaf = requestAnimationFrame(() => {
      mouseX.value = (e.clientX / window.innerWidth) * 100
      mouseY.value = (e.clientY / window.innerHeight) * 100
      glowRaf = null
    })
  }
}
function openDetailPanel(nodeId) { currentNodeId.value = nodeId; detailPanelOpen.value = true }
function closeDetailPanel() { detailPanelOpen.value = false; currentNodeId.value = null }

// ─── Dark mode ───
function toggleTheme() { uiStore.toggleTheme() }

// ─── Naive UI theme overrides (theme-aware) ───
const themeOverrides = computed(() => {
  const isDark = uiStore.theme === 'dark'
  return {
    common: {
      primaryColor: '#3B82F6',
      primaryColorHover: '#60A5FA',
      primaryColorPressed: '#2563EB',
      primaryColorSuppl: isDark ? '#A855F7' : '#8B5CF6',
      bodyColor: isDark ? '#0A0C12' : '#f8f9fb',
      cardColor: isDark ? '#141824' : '#ffffff',
      modalColor: isDark ? '#141824' : '#ffffff',
      popoverColor: isDark ? '#181C28' : '#ffffff',
      tableColor: isDark ? '#141824' : '#ffffff',
      inputColor: isDark ? '#141824' : '#ffffff',
      borderColor: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(0,0,0,0.08)',
      dividerColor: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(0,0,0,0.06)',
      borderRadius: '14px',
      fontSize: '0.875rem',
      fontFamily: 'var(--font-body)',
      textColorBase: isDark ? '#EDEFF5' : '#18181b',
    },
    Button: {
      borderRadiusSmall: '16px', borderRadiusMedium: '20px', borderRadiusLarge: '24px',
      fontSizeSmall: '0.75rem', fontSizeMedium: '0.8125rem', fontSizeLarge: '0.9375rem',
      paddingSmall: '6px 14px', paddingMedium: '8px 20px', paddingLarge: '12px 28px',
      fontWeight: '500',
      heightSmall: '30px', heightMedium: '38px', heightLarge: '48px',
      textHover: 'rgba(59,130,246,0.08)',
      textPressed: 'rgba(59,130,246,0.15)',
      borderHover: isDark ? 'rgba(59,130,246,0.35)' : 'rgba(59,130,246,0.4)',
      borderFocus: isDark ? 'rgba(59,130,246,0.6)' : 'rgba(59,130,246,0.5)',
      rippleColor: isDark ? '#A855F7' : '#8B5CF6',
    },
    Card: { borderRadius: '24px', paddingMedium: '24px', paddingLarge: '32px' },
    Input: {
      borderRadius: '14px', heightLarge: '48px', heightMedium: '40px',
      color: isDark ? '#141824' : '#ffffff',
      colorFocus: isDark ? '#1C2030' : '#ffffff',
      border: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(0,0,0,0.12)',
      borderHover: isDark ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.3)',
      borderFocus: '#3B82F6',
      boxShadowFocus: isDark
        ? '0 0 0 3px rgba(59,130,246,0.15), 0 0 20px rgba(168,85,247,0.08)'
        : '0 0 0 3px rgba(59,130,246,0.1)',
      placeholderColor: isDark ? '#5A6080' : '#9ca3af',
    },
    Modal: { borderRadius: '24px' },
    Select: { borderRadius: '14px' },
    Tag: { borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600' },
    Progress: {
      fillColor: 'linear-gradient(90deg, #3B82F6, #A855F7)',
      railColor: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(0,0,0,0.06)',
    },
  }
})

// ─── PDF ───
const naiveTheme = computed(() => uiStore.theme === 'dark' ? darkTheme : null)

// ─── PDF ───
const { loading: pdfLoading, progress: pdfProgress, parseAndGenerate } = usePdfParser()

// ─── Computed ───
const currentTree = computed(() => mindmapStore.getTree(blockStore.currentId))
const questionCount = computed(() => questionStore.getAll(blockStore.currentId).length)
const nodeCount = computed(() => countAllNodes(currentTree.value))
const practicedCount = computed(() => practiceStore.getPracticedNodes(blockStore.currentId))

// ─── Init ───
onMounted(async () => {
  try {
    await blockStore.load()
    await mindmapStore.load(blockStore.currentId)
    await questionStore.load(blockStore.currentId)
    await practiceStore.load(blockStore.currentId)
    const loading = document.getElementById('app-loading')
    if (loading) loading.style.display = 'none'
    console.log('[App] Ready — section:', blockStore.currentId, 'theme:', uiStore.theme)
  } catch (e) {
    console.error('[App] Init error:', e)
    uiStore.initError = e.message || String(e)
    const loading = document.getElementById('app-loading')
    if (loading) loading.style.display = 'none'
    const errDiv = document.getElementById('app-error')
    if (errDiv) { errDiv.style.display = 'flex'; document.getElementById('app-error-msg').textContent = e.stack || e.message }
  }
})

// ─── Section switching ───
async function onSwitchSection(id) {
  await blockStore.switchTo(id)
  currentNodeId.value = null
  await mindmapStore.load(id)
  await questionStore.load(id)
  await practiceStore.load(id)
}

async function onCreateSection() {
  const name = window.prompt('输入新板块名称:')
  if (!name) return
  const sec = await blockStore.create(name)
  if (sec) await mindmapStore.load(sec.id)
}

async function onDeleteSection(id) {
  const sec = blockStore.getById(id)
  if (!sec) return
  if (sec.isDefault) { message.warning('默认板块不可删除'); return }
  const qs = questionStore.getAll(id)
  if (qs.length > 0 && !window.confirm(`板块「${sec.name}」包含 ${qs.length} 道题目，确定删除？`)) return
  await blockStore.remove(id)
  await mindmapStore.load(blockStore.currentId)
}

// ─── Mindmap ops ───
async function onAddChild({ nodeId, name }) {
  if (!name) return
  await mindmapStore.addChild(blockStore.currentId, nodeId, name)
}

async function onRename({ nodeId, name }) {
  await mindmapStore.rename(blockStore.currentId, nodeId, name)
}

async function onDeleteNode(nodeId) {
  await mindmapStore.removeNode(blockStore.currentId, nodeId)
  const ids = new Set(); ids.add(nodeId)
  await questionStore.removeByNodeIds(blockStore.currentId, ids)
  if (currentNodeId.value === nodeId) currentNodeId.value = null
}

async function onUpdateExamPoints({ nodeId, points }) {
  await mindmapStore.updateExamPoints(blockStore.currentId, nodeId, points)
}

// ─── Context menu actions ───
function onContextAction({ action, nodeId }) {
  if (action === 'addChild') {
    const name = window.prompt('输入新节点名称:')
    if (name) onAddChild({ nodeId, name })
  } else if (action === 'edit') {
    currentNodeId.value = nodeId
  } else if (action === 'delete') {
    const tree = mindmapStore.getTree(blockStore.currentId)
    const node = findNode(tree, nodeId)
    if (node && window.confirm(`确定删除节点「${node.name}」？`)) onDeleteNode(nodeId)
  }
}

// ─── PDF upload ───
async function onUploadPdf(file, sectionId, mode = 'new', targetNodeId = null) {
  try {
    const { tree, pdfRoot } = await parseAndGenerate(file, sectionId)
    // Ensure target section's tree is loaded before merging
    if (!mindmapStore.getTree(sectionId)) {
      await mindmapStore.load(sectionId)
    }
    // Save snapshot for undo
    undoSnapshot.value = {
      sectionId,
      tree: JSON.parse(JSON.stringify(mindmapStore.getTree(sectionId)))
    }

    let result
    if (mode === 'merge' && targetNodeId) {
      result = await mindmapStore.mountUnder(sectionId, targetNodeId, pdfRoot)
    } else {
      result = await mindmapStore.mergeImport(sectionId, tree)
    }

    if (blockStore.currentId !== sectionId) {
      await onSwitchSection(sectionId)
    }

    showUpload.value = false
    const count = result.newIds?.length || 0
    highlightedNodeIds.value = result.newIds || []
    // Clear highlight IDs after animation completes
    setTimeout(() => { highlightedNodeIds.value = [] }, 3000)

    const msgRef = message.success(
      mode === 'merge'
        ? `PDF 已合并到节点下，新增 ${count} 个节点`
        : `PDF 导入完成，新增 ${count} 个节点`,
      { duration: 5000 }
    )
    // Also show an undo button via a separate message
    if (count > 0) {
      setTimeout(() => {
        message.info('如需撤销，请刷新页面恢复之前的数据（或重新导入覆盖）', { duration: 4000 })
      }, 500)
    }
  } catch (e) {
    console.error('[PDF Upload]', e)
    message.error('PDF 解析失败：' + (e.message || '未知错误'))
    showUpload.value = false
    undoSnapshot.value = null
  }
}

// ─── Practice ───
function onStartPractice(nodeId) {
  currentNodeId.value = nodeId
  practiceQuestion.value = null
  uiStore.previousView = uiStore.currentView
  uiStore.currentView = 'practice'
}

function onPracticeSingle(question) {
  practiceQuestion.value = question
  uiStore.previousView = uiStore.currentView
  uiStore.currentView = 'practice'
}

function onPracticeBack() {
  uiStore.currentView = uiStore.previousView
  practiceQuestion.value = null
}

function onPracticeDone() {
  uiStore.currentView = uiStore.previousView
  practiceQuestion.value = null
}

// ─── Export/Import ───
function exportData() {
  const data = { sections: blockStore.list, mindmaps: {}, questionBanks: {} }
  blockStore.list.forEach(s => {
    data.mindmaps[s.id] = mindmapStore.getTree(s.id)
    data.questionBanks[s.id] = questionStore.getAll(s.id)
  })
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url
  a.download = 'study_tool_backup_' + new Date().toISOString().slice(0,10) + '.json'
  a.click(); URL.revokeObjectURL(url)
  message.success('数据已导出')
}

function triggerImport() {
  const input = document.createElement('input')
  input.type = 'file'; input.accept = '.json'
  input.onchange = async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    const text = await file.text()
    try {
      const data = JSON.parse(text)
      if (data.sections) { blockStore.list = data.sections; await blockStore.save() }
      if (data.mindmaps) for (const [id, mm] of Object.entries(data.mindmaps)) {
        await localforage.setItem('mm_' + id, mm); mindmapStore.trees[id] = mm
      }
      if (data.questionBanks) for (const [id, qb] of Object.entries(data.questionBanks)) {
        await localforage.setItem('qb_' + id, qb); questionStore.banks[id] = qb
      }
      message.success('数据导入成功')
      await onSwitchSection(blockStore.currentId)
    } catch { message.error('文件格式错误') }
  }
  input.click()
}
</script>

<template>
  <n-config-provider :theme="naiveTheme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <!-- Ambient glow -->
      <div class="ambient-glow" :style="{
        background: uiStore.theme === 'dark'
          ? `radial-gradient(600px circle at ${mouseX}% ${mouseY}%, rgba(59,130,246,0.04), transparent 60%), radial-gradient(500px circle at ${80 - mouseX * 0.3}% ${60 - mouseY * 0.2}%, rgba(168,85,247,0.03), transparent 50%)`
          : `radial-gradient(600px circle at ${mouseX}% ${mouseY}%, rgba(59,130,246,0.03), transparent 60%), radial-gradient(500px circle at ${80 - mouseX * 0.3}% ${60 - mouseY * 0.2}%, rgba(139,92,246,0.02), transparent 50%)`
      }"></div>

      <!-- Error -->
      <div v-if="uiStore.initError" class="detail-empty" style="height:100vh;position:relative;z-index:2">
        <h2 style="color:var(--danger);margin-bottom:12px">启动失败</h2>
        <pre style="background:var(--danger-bg);padding:16px;border-radius:8px;max-width:600px;font-size:.8rem;white-space:pre-wrap">{{ uiStore.initError }}</pre>
      </div>

      <!-- App -->
      <div v-else class="app-layout" @mousemove="onMouseMove">
        <AppHeader
          :section-name="blockStore.current?.name || '—'"
          :node-count="nodeCount"
          :question-count="questionCount"
          :practiced-count="practicedCount"
          :theme="uiStore.theme"
          :current-view="uiStore.currentView"
          @toggle-theme="toggleTheme"
          @upload="showUpload = true"
          @export="exportData"
          @import="triggerImport"
          @toggle-sidebar="uiStore.sidebarOpen = !uiStore.sidebarOpen"
          @open-qbank="uiStore.currentView = 'questionBank'"
          @back-mindmap="uiStore.currentView = 'mindmap'"
        />

        <MindMapView
          v-show="uiStore.currentView === 'mindmap'"
          :detail-panel-open="detailPanelOpen"
          :highlight-node-ids="highlightedNodeIds"
          @switch-section="onSwitchSection"
          @create-section="onCreateSection"
          @delete-section="onDeleteSection"
          @add-child="onAddChild"
          @rename="onRename"
          @delete-node="onDeleteNode"
          @update-exam-points="onUpdateExamPoints"
          @add-question="openDetailPanel"
          @start-practice="onStartPractice"
          @context-action="onContextAction"
          @node-click="openDetailPanel"
          @close-detail="closeDetailPanel"
        />

        <QuestionBankView
          v-show="uiStore.currentView === 'questionBank'"
          :sections="blockStore.list"
          :current-section-id="blockStore.currentId"
          @switch-section="onSwitchSection"
          @practice-single="onPracticeSingle"
        />

        <PracticeView
          v-show="uiStore.currentView === 'practice'"
          :section-id="blockStore.currentId"
          :node-id="currentNodeId"
          :single-question="practiceQuestion"
          @back="onPracticeBack"
          @done="onPracticeDone"
        />

        <!-- Mobile bottom nav -->
        <nav class="bottom-nav">
          <button class="nav-item" :class="{ active: uiStore.sidebarOpen }" @click="uiStore.sidebarOpen = !uiStore.sidebarOpen">📋<span>板块</span></button>
          <button class="nav-item" :class="{ active: uiStore.currentView === 'mindmap' }" @click="uiStore.currentView = 'mindmap'">🗺️<span>导图</span></button>
          <button class="nav-item" :class="{ active: uiStore.currentView === 'questionBank' }" @click="uiStore.currentView = 'questionBank'">📝<span>题库</span></button>
          <button class="nav-item" @click="showUpload = true">📄<span>导入</span></button>
          <button class="nav-item" @click="toggleTheme">{{ uiStore.theme === 'light' ? '🌙' : '☀️' }}<span>主题</span></button>
        </nav>
      </div>

      <UploadPdfModal v-if="showUpload" :sections="blockStore.list" :current-section-id="blockStore.currentId"
        :loading="pdfLoading" :progress="pdfProgress" :tree="currentTree"
        @close="showUpload = false" @upload="onUploadPdf" />
      <InstallBanner />
    </n-message-provider>
  </n-config-provider>
</template>
