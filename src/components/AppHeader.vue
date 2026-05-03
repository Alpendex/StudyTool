<script setup>
import { SECTION_COLORS } from '../data/templates.js'

const props = defineProps({
  sections: Array, currentId: String,
  nodeCount: Number, questionCount: Number, practicedCount: Number
})

const emit = defineEmits(['switch', 'create', 'delete', 'openQbank', 'upload', 'export', 'import'])

const currentSection = computed(() => props.sections.find(s => s.id === props.currentId))

function getColor(sec) {
  return (sec.color && SECTION_COLORS[sec.color]) ? `background:${SECTION_COLORS[sec.color]}` : ''
}

function onDelete(e, sec) {
  e.stopPropagation()
  if (window.confirm(`确定删除板块「${sec.name}」？`)) emit('delete', sec.id)
}
</script>

<template>
  <div style="background:#fff;border-bottom:1px solid #e5e7eb;flex-shrink:0;z-index:20;box-shadow:0 1px 3px rgba(0,0,0,.06)">
    <!-- Top bar -->
    <div style="display:flex;align-items:center;padding:6px 14px;gap:8px;flex-wrap:wrap">
      <strong style="font-size:1rem;background:linear-gradient(135deg,#4f46e5,#7c3aed);-webkit-background-clip:text;-webkit-text-fill-color:transparent;white-space:nowrap">考研学习工具</strong>

      <n-button-group size="tiny">
        <n-button v-for="s in sections" :key="s.id"
          :type="s.id === currentId ? 'primary' : 'default'"
          :secondary="s.id !== currentId"
          @click="emit('switch', s.id)"
          style="font-size:.78rem;text-transform:none">
          {{ s.name }}
        </n-button>
      </n-button-group>

      <n-button size="tiny" secondary dashed @click="emit('create', window.prompt('输入新板块名称:'))">＋</n-button>

      <div style="margin-left:auto;display:flex;gap:6px;flex-wrap:wrap">
        <n-button size="tiny" @click="emit('openQbank')">📋 题库</n-button>
        <n-button size="tiny" @click="emit('export')">📥 导出</n-button>
        <n-button size="tiny" @click="emit('import')">📤 导入</n-button>
        <n-button size="tiny" type="primary" @click="emit('upload')">📄 上传PDF</n-button>
      </div>
    </div>

    <!-- Stats -->
    <div style="display:flex;gap:20px;padding:4px 16px 6px;font-size:.73rem;color:#6b7280;border-top:1px solid #f3f4f6">
      <span>节点: <strong style="color:#1f2937">{{ nodeCount }}</strong></span>
      <span>题库: <strong style="color:#1f2937">{{ questionCount }}</strong></span>
      <span>已练习: <strong style="color:#1f2937">{{ practicedCount }}节点</strong></span>
      <span>板块: <strong style="color:#1f2937">{{ currentSection?.name || '—' }}</strong></span>
    </div>
  </div>
</template>
