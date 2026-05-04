import * as echarts from 'echarts'
import { findNode, toEChartsTree } from '../utils/mindmapHelper.js'

export function useECharts(emit) {
  let chartInstance = null
  let resizeObserver = null
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
    // Auto-resize when container size changes (sidebar toggle, window resize, etc.)
    resizeObserver = new ResizeObserver(() => chartInstance?.resize())
    resizeObserver.observe(dom)
  }

  function renderTree(tree, isDark = true) {
    if (!chartInstance) return
    const primary = '#3B82F6'
    const purple = isDark ? '#A855F7' : '#8B5CF6'
    const fg = isDark ? '#EDEFF5' : '#18181b'
    const cardBg = isDark ? '#141824' : '#ffffff'
    const borderCol = isDark ? 'rgba(59,130,246,0.2)' : 'rgba(0,0,0,0.1)'
    const option = {
      tooltip: {
        trigger: 'item', triggerOn: 'mousemove',
        formatter: p => p.name,
        backgroundColor: isDark ? '#181C28' : '#ffffff',
        borderColor: isDark ? 'rgba(59,130,246,0.3)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        borderRadius: 10,
        padding: [10, 14],
        textStyle: { color: fg, fontSize: 13, fontWeight: 500 },
        extraCssText: isDark
          ? 'box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 16px rgba(59,130,246,0.1);'
          : 'box-shadow: 0 8px 24px rgba(0,0,0,0.1);'
      },
      series: [{
        type: 'tree', data: [toEChartsTree(tree)],
        top: '5%', left: '6%', bottom: '5%', right: '18%',
        symbol: 'roundRect',
        symbolSize: [130, 38],
        orient: 'LR',
        roam: 'move',
        scaleLimit: { min: 0.3, max: 3 },
        expandAndCollapse: true,
        animationDuration: 400,
        animationDurationUpdate: 300,
        animationEasingUpdate: 'cubicInOut',
        itemStyle: {
          color: cardBg,
          borderColor: borderCol,
          borderWidth: 1,
          borderRadius: 12,
          shadowBlur: isDark ? 8 : 4,
          shadowColor: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.08)',
          shadowOffsetY: isDark ? 2 : 1
        },
        label: {
          position: 'inside',
          verticalAlign: 'middle',
          align: 'center',
          fontSize: 13,
          fontWeight: 600,
          fontFamily: '"Inter", "PingFang SC", sans-serif',
          color: fg,
          overflow: 'truncate',
          width: 116,
          ellipsis: '…'
        },
        leaves: {
          label: {
            position: 'inside',
            verticalAlign: 'middle',
            align: 'center'
          }
        },
        emphasis: {
          focus: 'descendant',
          scale: 1.03,
          itemStyle: {
            color: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)',
            borderColor: '#3B82F6',
            borderWidth: 2,
            shadowBlur: isDark ? 24 : 12,
            shadowColor: isDark ? 'rgba(59,130,246,0.35)' : 'rgba(59,130,246,0.15)',
            shadowOffsetY: isDark ? 3 : 1
          },
          label: { color: isDark ? '#fff' : '#18181b', fontWeight: 700 },
          lineStyle: { color: primary, width: 2, shadowBlur: isDark ? 8 : 4, shadowColor: isDark ? 'rgba(59,130,246,0.4)' : 'rgba(59,130,246,0.15)' }
        },
        lineStyle: {
          color: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(0,0,0,0.12)',
          width: 1.2,
          curveness: 0.5
        }
      }]
    }
    chartInstance.setOption(option, true)
  }

  function resize() { chartInstance?.resize() }
  function dispose() { resizeObserver?.disconnect(); resizeObserver = null; chartInstance?.dispose(); chartInstance = null }
  function hideContextMenu() { contextMenu.value.show = false }

  return { initChart, renderTree, resize, dispose, contextMenu, hideContextMenu, getInstance: () => chartInstance }
}
