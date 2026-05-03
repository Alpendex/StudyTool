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

// Drag & drop
const dragOver = ref(false)
function onDrop(e) {
  e.preventDefault(); dragOver.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f?.type === 'application/pdf' || f?.name?.endsWith('.pdf')) file.value = f
}
</script>

<template>
  <n-modal :show="true" preset="card" title="📄 上传PDF" style="max-width:500px;width:95%"
    :on-close="emit('close')" :mask-closable="!loading">
    <template v-if="!loading">
      <!-- Upload zone -->
      <div style="border:2px dashed #e5e7eb;border-radius:10px;padding:32px;text-align:center;cursor:pointer;transition:.2s"
           :style="dragOver ? 'border-color:#4f46e5;background:#eef2ff' : ''"
           @click="triggerFile" @dragover.prevent="dragOver=true" @dragleave="dragOver=false" @drop="onDrop">
        <template v-if="!file">
          <div style="font-size:2.5rem;margin-bottom:6px">📁</div>
          <p style="color:#6b7280;font-size:.85rem">点击选择或拖拽PDF文件到此处</p>
          <p style="color:#9ca3af;font-size:.75rem;margin-top:4px">单文件 ≤ 100 页</p>
        </template>
        <template v-else>
          <p style="font-weight:500">{{ file.name }}</p>
          <p style="color:#6b7280;font-size:.8rem">{{ formatSize(file.size) }}</p>
          <n-button size="small" @click.stop="file=null" style="margin-top:6px">重新选择</n-button>
        </template>
        <input ref="fileInput" type="file" accept=".pdf" style="display:none" @change="onFileChange">
      </div>

      <!-- Section selector -->
      <div style="margin-top:12px">
        <n-select v-model:value="targetSection"
          :options="sections.map(s=>({label:s.name,value:s.id}))"
          placeholder="选择目标板块" />
      </div>

      <div style="display:flex;justify-content:flex-end;gap:6px;margin-top:12px">
        <n-button @click="emit('close')">取消</n-button>
        <n-button type="primary" @click="startUpload" :disabled="!file">开始分析</n-button>
      </div>
    </template>

    <template v-else>
      <div style="text-align:center;padding:30px">
        <n-spin size="medium" />
        <p style="margin-top:12px;color:#6b7280">{{ progress || '处理中...' }}</p>
      </div>
    </template>
  </n-modal>
</template>
