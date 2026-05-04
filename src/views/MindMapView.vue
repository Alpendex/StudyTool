<script setup>
import { useBlockStore } from '../stores/blockStore.js'
import { useMindmapStore } from '../stores/mindmapStore.js'
import { useQuestionStore } from '../stores/questionStore.js'
import { usePracticeStore } from '../stores/practiceStore.js'
import { useUiStore } from '../stores/uiStore.js'
import { useECharts } from '../composables/useECharts.js'
import { findNode, countAllNodes } from '../utils/mindmapHelper.js'
import NodeDetail from '../components/mindmap/NodeDetail.vue'

const blockStore = useBlockStore()
const mindmapStore = useMindmapStore()
const questionStore = useQuestionStore()
const practiceStore = usePracticeStore()
const uiStore = useUiStore()

const isDark = computed(() => uiStore.theme === 'dark')

defineProps({ detailPanelOpen: Boolean })

const emit = defineEmits([
  'switchSection', 'createSection', 'deleteSection',
  'addChild', 'rename', 'deleteNode',
  'updateExamPoints', 'addQuestion', 'startPractice',
  'contextAction', 'nodeClick', 'closeDetail'
])

const currentNodeId = ref(null)
const chartRef = ref(null)
const sectionColors = {
  math: '#0052FF', english: '#10B981', politics: '#EF4444', cs: '#8B5CF6', bagu: '#F59E0B', custom: '#0052FF'
}

const { initChart, renderTree, resize, dispose, contextMenu, hideContextMenu } = useECharts((event, data) => {
  if (event === 'nodeClick') { currentNodeId.value = data; emit('nodeClick', data) }
})

const currentTree = computed(() => mindmapStore.getTree(blockStore.currentId))
const currentNode = computed(() => currentTree.value ? findNode(currentTree.value, currentNodeId.value) : null)
const questionCount = computed(() => questionStore.getAll(blockStore.currentId).length)
const nodeCount = computed(() => countAllNodes(currentTree.value))
const practicedCount = computed(() => practiceStore.getPracticedNodes(blockStore.currentId))

// Init chart
watch([currentTree, isDark], ([tree, dark]) => { if (tree) renderTree(tree, dark) }, { deep: true })

onMounted(async () => {
  await nextTick()
  if (chartRef.value) {
    initChart(chartRef.value)
    renderTree(currentTree.value, isDark.value)
  }
  window.addEventListener('resize', resize)
})

onUnmounted(() => { window.removeEventListener('resize', resize); dispose() })

// Context menu click-outside
watch(() => contextMenu.value.show, (v) => {
  if (!v) return
  const handler = () => { hideContextMenu(); document.removeEventListener('click', handler, true) }
  setTimeout(() => document.addEventListener('click', handler, true), 0)
})

function onSwitchSection(id) {
  emit('switchSection', id)
  currentNodeId.value = null
}

function onContextAction(action) {
  const nodeId = contextMenu.value.nodeId
  hideContextMenu()
  if (!nodeId) return
  emit('contextAction', { action, nodeId })
}
</script>

<template>
  <div style="flex:1;display:flex;flex-direction:column;min-height:0">
    <div class="app-body">
      <aside class="app-sidebar" v-show="uiStore.sidebarOpen">
        <div style="font-size:var(--font-xs);color:var(--text-secondary);padding:var(--spacing-xs) 6px;text-transform:uppercase;letter-spacing:.5px">板块列表</div>
        <div
          v-for="s in blockStore.list" :key="s.id"
          class="section-item"
          :class="{ active: s.id === blockStore.currentId }"
          :style="s.id === blockStore.currentId ? { borderLeftColor: sectionColors[s.color] || sectionColors.custom } : {}"
          @click="onSwitchSection(s.id)"
        >
          <span style="font-size:1rem">📘</span>
          <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ s.name }}</span>
          <span v-if="!s.isDefault" class="del" style="opacity:0;font-size:.8rem;cursor:pointer"
            @click.stop="emit('deleteSection', s.id)" title="删除板块">×</span>
        </div>
        <button class="section-item" style="border:1px dashed var(--border);color:var(--text-secondary);margin-top:4px" @click="emit('createSection')">
          <span>＋</span><span>新建板块</span>
        </button>
      </aside>

      <div class="mm-panel">
        <div ref="chartRef" class="chart"></div>
        <div v-if="contextMenu.show" class="ctx-menu" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }">
          <div class="item" @click="onContextAction('addChild')">➕ 添加子节点</div>
          <div class="item" @click="onContextAction('edit')">✏️ 编辑名称</div>
          <div class="item danger" @click="onContextAction('delete')">🗑️ 删除节点</div>
        </div>
      </div>

      <NodeDetail
        :class="{ closed: !detailPanelOpen }"
        :node="currentNode"
        :section-id="blockStore.currentId"
        @rename="(name) => emit('rename', { nodeId: currentNodeId, name })"
        @add-child="(name) => emit('addChild', { nodeId: currentNodeId, name })"
        @delete="() => emit('deleteNode', currentNodeId)"
        @update-exam-points="(pts) => emit('updateExamPoints', { nodeId: currentNodeId, points: pts })"
        @add-question="(nodeId) => emit('addQuestion', nodeId)"
        @start-practice="(nodeId) => emit('startPractice', nodeId)"
        @close="emit('closeDetail')"
      />
    </div>
  </div>
</template>
