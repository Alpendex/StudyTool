import * as echarts from 'echarts'
import { findNode, toEChartsTree } from '../utils/helpers.js'

export function useECharts(emit) {
  let chartInstance = null
  const contextMenu = ref({ show: false, x: 0, y: 0, nodeId: null })

  function initChart(dom) {
    if (!dom) return
    if (chartInstance) chartInstance.dispose()
    chartInstance = echarts.init(dom)
    chartInstance.on('click', (params) => {
      if (params.data?.id) emit('nodeClick', params.data.id)
    })
    chartInstance.on('contextmenu', (params) => {
      params.event.event.preventDefault()
      if (params.data?.id) {
        contextMenu.value = { show: true,
          x: params.event.event.offsetX + 5,
          y: params.event.event.offsetY - 10,
          nodeId: params.data.id }
      }
    })
    // Touch support for context menu (long press)
    let longPressTimer = null
    dom.addEventListener('touchstart', (e) => { longPressTimer = setTimeout(() => {
      const touch = e.touches[0]
      const rect = dom.getBoundingClientRect()
      contextMenu.value = { show: true,
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top - 20,
        nodeId: null }
      clearTimeout(longPressTimer)
    }, 600) }, { passive: true })
    dom.addEventListener('touchend', () => clearTimeout(longPressTimer))
    dom.addEventListener('touchmove', () => clearTimeout(longPressTimer))
  }

  function renderTree(tree) {
    if (!chartInstance) return
    const option = {
      tooltip: { trigger: 'item', triggerOn: 'mousemove', formatter: p => p.name },
      series: [{
        type: 'tree', data: [toEChartsTree(tree)],
        top: '5%', left: '6%', bottom: '5%', right: '18%',
        symbolSize: 9, orient: 'LR',
        label: { position: 'left', verticalAlign: 'middle', align: 'right',
                 fontSize: 12, fontWeight: 500, color: '#1f2937' },
        leaves: { label: { position: 'right', verticalAlign: 'middle', align: 'left' } },
        emphasis: { focus: 'descendant', itemStyle: { color: '#4f46e5', borderWidth: 2 } },
        expandAndCollapse: true,
        animationDuration: 350, animationDurationUpdate: 250,
        lineStyle: { color: '#cbd5e1', width: 1.3, curveness: 0.5 },
        roam: 'move'
      }]
    }
    chartInstance.setOption(option, true)
  }

  function resize() { chartInstance?.resize() }
  function dispose() { chartInstance?.dispose(); chartInstance = null }
  function hideContextMenu() { contextMenu.value.show = false }

  return { initChart, renderTree, resize, dispose, contextMenu, hideContextMenu, getInstance: () => chartInstance }
}
