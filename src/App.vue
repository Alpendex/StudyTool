<script setup>
import localforage from 'localforage'
import { useSectionsStore } from './stores/sections.js'
import { useMindmapStore } from './stores/mindmap.js'
import { useQuestionBankStore } from './stores/questionBank.js'
import { usePracticeStore } from './stores/practice.js'
import { useECharts } from './composables/useECharts.js'
import { usePdfParser } from './composables/usePdfParser.js'
import { findNode, countAllNodes } from './utils/helpers.js'
import AppHeader from './components/AppHeader.vue'
import DetailPanel from './components/DetailPanel.vue'
import QuestionBankModal from './components/QuestionBankModal.vue'
import PracticeModal from './components/PracticeModal.vue'
import UploadPdfModal from './components/UploadPdfModal.vue'
import InstallBanner from './components/InstallBanner.vue'

const sectionsStore = useSectionsStore()
const mindmapStore = useMindmapStore()
const qbStore = useQuestionBankStore()
const practiceStore = usePracticeStore()

const currentNodeId = ref(null)
const showQBank = ref(false)
const showPractice = ref(false)
const showUpload = ref(false)
const chartRef = ref(null)
const initError = ref(null)

// ECharts
const { initChart, renderTree, resize, dispose, contextMenu, hideContextMenu } = useECharts((event, data) => {
  if (event === 'nodeClick') currentNodeId.value = data
})

// PDF parser
const { loading: pdfLoading, progress: pdfProgress, parseAndGenerate } = usePdfParser()

// Current data
const currentTree = computed(() => mindmapStore.getTree(sectionsStore.currentId))
const currentNode = computed(() => currentTree.value ? findNode(currentTree.value, currentNodeId.value) : null)
const questionCount = computed(() => qbStore.getAll(sectionsStore.currentId).length)
const nodeCount = computed(() => countAllNodes(currentTree.value))
const practicedCount = computed(() => practiceStore.getPracticedNodes(sectionsStore.currentId))

// Initialize
onMounted(async () => {
  try {
    await sectionsStore.load()
    await mindmapStore.load(sectionsStore.currentId)
    await qbStore.load(sectionsStore.currentId)
    await practiceStore.load(sectionsStore.currentId)
    await nextTick()
    if (chartRef.value) initChart(chartRef.value)
    renderTree(currentTree.value)
    window.addEventListener('resize', resize)
    // Hide loading
    const loading = document.getElementById('app-loading')
    if (loading) loading.style.display = 'none'
    console.log('[App] Initialized successfully, section:', sectionsStore.currentId, 'nodes:', nodeCount.value)
  } catch (e) {
    console.error('[App] Init error:', e)
    initError.value = e.message || String(e)
    const loading = document.getElementById('app-loading')
    if (loading) loading.style.display = 'none'
    const errDiv = document.getElementById('app-error')
    if (errDiv) { errDiv.style.display = 'flex'; document.getElementById('app-error-msg').textContent = e.stack || e.message }
  }
})

onUnmounted(() => { window.removeEventListener('resize', resize); dispose() })

// Section switching
async function onSwitchSection(id) {
  await sectionsStore.switchTo(id)
  currentNodeId.value = null
  await mindmapStore.load(id)
  await qbStore.load(id)
  await practiceStore.load(id)
  renderTree(currentTree.value)
}

async function onCreateSection(name) {
  const sec = await sectionsStore.create(name)
  if (sec) await mindmapStore.load(sec.id)
}
async function onDeleteSection(id) {
  await sectionsStore.remove(id)
  await mindmapStore.load(sectionsStore.currentId)
  renderTree(currentTree.value)
}

// Mindmap ops
async function onAddChild(parentId, name) {
  await mindmapStore.addChild(sectionsStore.currentId, parentId, name)
  renderTree(currentTree.value)
}
async function onRename(nodeId, name) {
  await mindmapStore.rename(sectionsStore.currentId, nodeId, name)
  renderTree(currentTree.value)
}
async function onDeleteNode(nodeId) {
  const count = await mindmapStore.removeNode(sectionsStore.currentId, nodeId)
  const ids = new Set(); ids.add(nodeId)
  await qbStore.removeByNodeIds(sectionsStore.currentId, ids)
  if (currentNodeId.value === nodeId) currentNodeId.value = null
  renderTree(currentTree.value)
  return count
}

// PDF upload
async function onUploadPdf(file, sectionId) {
  showUpload.value = false
  const { tree } = await parseAndGenerate(file, sectionId)
  await mindmapStore.mergeImport(sectionId, tree)
  if (sectionsStore.currentId !== sectionId) {
    await onSwitchSection(sectionId)
  } else {
    renderTree(currentTree.value)
  }
}

// Question bank
function onOpenQBank(nodeId) {
  showQBank.value = true
  if (nodeId) currentNodeId.value = nodeId
}

// Practice
function onStartPractice(nodeId) {
  currentNodeId.value = nodeId
  showPractice.value = true
}

// Export/Import
const message = useMessage()
function exportData() {
  const data = { sections: sectionsStore.list, mindmaps: {}, questionBanks: {}, practices: {} }
  sectionsStore.list.forEach(s => {
    data.mindmaps[s.id] = mindmapStore.getTree(s.id)
    data.questionBanks[s.id] = qbStore.getAll(s.id)
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
      if (data.sections) { sectionsStore.list = data.sections; await sectionsStore.save() }
      if (data.mindmaps) {
        for (const [id, mm] of Object.entries(data.mindmaps)) {
          await localforage.setItem('mm_' + id, mm)
          mindmapStore.trees[id] = mm
        }
      }
      if (data.questionBanks) {
        for (const [id, qb] of Object.entries(data.questionBanks)) {
          await localforage.setItem('qb_' + id, qb)
          qbStore.banks[id] = qb
        }
      }
      message.success('数据导入成功')
      await onSwitchSection(sectionsStore.currentId)
    } catch { message.error('文件格式错误') }
  }
  input.click()
}

// Watch for tree changes to re-render
watch(currentTree, (tree) => { if (tree) renderTree(tree) }, { deep: true })

// Context menu
watch(() => contextMenu.value.show, (v) => {
  if (!v) return
  const handler = () => { hideContextMenu(); document.removeEventListener('click', handler, true) }
  setTimeout(() => document.addEventListener('click', handler, true), 0)
})
function onContextAction(action) {
  const nodeId = contextMenu.value.nodeId
  hideContextMenu()
  if (!nodeId) return
  if (action === 'addChild') {
    const name = window.prompt('输入新节点名称:')
    if (name) onAddChild(nodeId, name)
  } else if (action === 'edit') {
    currentNodeId.value = nodeId
  } else if (action === 'delete') {
    const node = findNode(currentTree.value, nodeId)
    if (node && window.confirm(`确定删除节点「${node.name}」？`)) onDeleteNode(nodeId)
  }
}
</script>

<template>
  <n-config-provider>
    <n-message-provider>
      <!-- Error state -->
      <div v-if="initError" style="padding:40px;text-align:center">
        <h2 style="color:#ef4444;margin-bottom:12px">应用启动失败</h2>
        <pre style="background:#fef2f2;padding:16px;border-radius:8px;max-width:600px;margin:0 auto;font-size:.8rem;white-space:pre-wrap">{{ initError }}</pre>
      </div>

      <!-- Normal app -->
      <div v-else class="app-layout">
        <AppHeader
          :sections="sectionsStore.list"
          :current-id="sectionsStore.currentId"
          :node-count="nodeCount"
          :question-count="questionCount"
          :practiced-count="practicedCount"
          @switch="onSwitchSection"
          @create="onCreateSection"
          @delete="onDeleteSection"
          @open-qbank="onOpenQBank()"
          @upload="showUpload = true"
          @export="exportData"
          @import="triggerImport"
        />

        <div class="app-main">
          <div class="mm-panel">
            <div ref="chartRef" class="chart"></div>
            <div v-if="contextMenu.show" class="chart-context-menu"
                 :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }">
              <div class="menu-item" @click="onContextAction('addChild')">➕ 添加子节点</div>
              <div class="menu-item" @click="onContextAction('edit')">✏️ 编辑名称</div>
              <div class="menu-item" style="color:#ef4444" @click="onContextAction('delete')">🗑️ 删除节点</div>
            </div>
          </div>

          <DetailPanel
            :node="currentNode"
            :section-id="sectionsStore.currentId"
            @rename="(name) => onRename(currentNodeId, name)"
            @add-child="(name) => onAddChild(currentNodeId, name)"
            @delete="() => onDeleteNode(currentNodeId)"
            @update-exam-points="(pts) => mindmapStore.updateExamPoints(sectionsStore.currentId, currentNodeId, pts)"
            @add-question="onOpenQBank(currentNodeId)"
            @start-practice="onStartPractice(currentNodeId)"
          />
        </div>

        <QuestionBankModal v-if="showQBank" :section-id="sectionsStore.currentId" :preset-node-id="currentNodeId" @close="showQBank = false" />
        <PracticeModal v-if="showPractice" :section-id="sectionsStore.currentId" :node-id="currentNodeId" @close="showPractice = false" />
        <UploadPdfModal v-if="showUpload" :sections="sectionsStore.list" :current-section-id="sectionsStore.currentId"
          :loading="pdfLoading" :progress="pdfProgress" @close="showUpload = false" @upload="onUploadPdf" />
        <InstallBanner />
      </div>
    </n-message-provider>
  </n-config-provider>
</template>
