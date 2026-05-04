<script setup>
const props = defineProps({
  sections: Array, currentSectionId: String, loading: Boolean, progress: String
})
const emit = defineEmits(['close', 'upload'])

const file = ref(null)
const targetSection = ref(props.currentSectionId)
const fileInput = ref(null)

function onFileChange(e) {
  const f = e.target.files?.[0]
  if (f) file.value = f
}

function triggerFile() { fileInput.value?.click() }

function startUpload() {
  if (!file.value) return
  emit('upload', file.value, targetSection.value)
}

function formatSize(bytes) { return (bytes / 1024 / 1024).toFixed(2) + ' MB' }

const dragOver = ref(false)
function onDrop(e) {
  e.preventDefault(); dragOver.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f?.type === 'application/pdf' || f?.name?.endsWith('.pdf')) file.value = f
}
</script>

<template>
  <n-modal :show="true" preset="card" title="📄 上传 PDF 导入" style="max-width:500px;width:95%"
    @close="emit('close')" :mask-closable="!loading">
    <template v-if="!loading">
      <!-- Upload zone -->
      <div class="upload-zone" :class="{ 'upload-active': dragOver }"
           @click="triggerFile" @dragover.prevent="dragOver=true" @dragleave="dragOver=false" @drop="onDrop">
        <template v-if="!file">
          <div class="upload-icon">📁</div>
          <p class="upload-hint">点击选择或拖拽 PDF 文件到此处</p>
          <p class="upload-sub">支持 PDF 格式，文件超过200页时解析可能较慢，建议拆分使用</p>
        </template>
        <template v-else>
          <div class="upload-icon">📄</div>
          <p class="upload-name">{{ file.name }}</p>
          <p class="upload-size">{{ formatSize(file.size) }}</p>
          <n-button size="small" @click.stop="file=null" style="margin-top:8px">重新选择</n-button>
        </template>
        <input ref="fileInput" type="file" accept=".pdf" style="display:none" @change="onFileChange">
      </div>

      <!-- Section selector -->
      <div style="margin-top:14px">
        <n-select v-model:value="targetSection"
          :options="sections.map(s=>({label:s.name,value:s.id}))"
          placeholder="选择目标板块" />
      </div>

      <!-- Actions -->
      <div class="upload-actions">
        <n-button @click="emit('close')">取消</n-button>
        <n-button type="primary" @click="startUpload" :disabled="!file">🚀 开始 AI 分析</n-button>
      </div>
    </template>

    <template v-else>
      <div class="upload-loading">
        <n-spin size="medium" />
        <p class="upload-progress">{{ progress || '准备中...' }}</p>
        <p class="upload-sub" style="margin-top:0">正在解析 PDF 并生成思维导图</p>
        <div class="loading-bar"><div class="loading-bar-fill"></div></div>
      </div>
    </template>
  </n-modal>
</template>

<style scoped>
.upload-active {
  border-color: var(--accent) !important;
  background: var(--accent-glow) !important;
}
.upload-icon { font-size: 2.5rem; margin-bottom: 6px; }
.upload-hint { color: var(--text-secondary); font-size: var(--font-sm); }
.upload-sub { color: var(--text-secondary); font-size: var(--font-xs); margin-top: 4px; }
.upload-name { font-weight: 600; color: var(--text-primary); }
.upload-size { color: var(--text-secondary); font-size: var(--font-xs); }
.upload-actions {
  display: flex; justify-content: flex-end; gap: 8px;
  margin-top: 14px;
}
.upload-loading {
  text-align: center; padding: 40px 20px;
}
.upload-progress {
  margin-top: 14px; color: var(--text-secondary);
  font-size: var(--font-base); font-weight: 500;
}
.loading-bar {
  width: 100%; height: 4px; margin-top: 16px;
  background: var(--border);
  border-radius: 2px; overflow: hidden;
}
.loading-bar-fill {
  width: 30%; height: 100%;
  background: var(--accent-gradient);
  border-radius: 2px;
  animation: loading-slide 1.4s ease-in-out infinite;
}
@keyframes loading-slide {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(430%); }
}
</style>
