<script setup>
defineProps({
  sectionName: String,
  nodeCount: Number,
  questionCount: Number,
  practicedCount: Number,
  theme: String,
  currentView: String
})

defineEmits(['toggleTheme', 'upload', 'export', 'import', 'toggleSidebar', 'openQbank', 'backMindmap'])
</script>

<template>
  <header class="app-header">
    <button class="theme-toggle" @click="$emit('toggleSidebar')" title="切换侧栏" style="font-size:1.2rem">☰</button>

    <strong class="app-title">考研学习工具</strong>

    <div class="header-stats">
      <span class="stat">节点 <b>{{ nodeCount }}</b></span>
      <span class="stat">题库 <b>{{ questionCount }}</b></span>
      <span class="stat">已练 <b>{{ practicedCount }}</b></span>
      <span class="stat-badge">{{ sectionName }}</span>
    </div>

    <div class="header-actions">
      <button v-if="currentView === 'mindmap'" class="header-btn header-btn-accent" @click="$emit('openQbank')">📋<span class="btn-label">题库总览</span></button>
      <button v-else-if="currentView === 'questionBank'" class="header-btn header-btn-accent" @click="$emit('backMindmap')">🗺️<span class="btn-label">返回导图</span></button>
      <button type="button" class="header-btn" @click="$emit('upload')" title="上传PDF">📄<span class="btn-label">导入PDF</span></button>
      <button class="header-btn" @click="$emit('export')" title="导出数据">📥<span class="btn-label">导出</span></button>
      <button class="header-btn" @click="$emit('import')" title="导入数据">📤<span class="btn-label">导入</span></button>
      <button class="theme-toggle" @click="$emit('toggleTheme')" :title="theme === 'light' ? '暗色模式' : '亮色模式'">
        {{ theme === 'light' ? '🌙' : '☀️' }}
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-title {
  font-size: var(--font-xl);
  font-family: var(--font-display);
  background: var(--gradient-accent);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: -0.02em;
}
.header-stats {
  display: flex; gap: 14px; align-items: center;
  font-size: var(--font-xs); color: var(--text-secondary);
  margin-left: var(--spacing-md);
  font-weight: var(--font-weight-medium);
}
.header-stats .stat b {
  color: var(--text-primary); font-weight: var(--font-weight-semibold);
}
.stat-badge {
  background: var(--accent-glow);
  color: var(--accent);
  padding: 3px 12px;
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-xs);
  letter-spacing: 0.01em;
}
.header-actions {
  margin-left: auto;
  display: flex; gap: 6px; align-items: center;
}
.header-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 12px; min-width: 44px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  font-size: var(--font-xs); font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  white-space: nowrap;
  position: relative; z-index: 1;
}
.header-btn:hover {
  background: var(--surface);
  color: var(--text-primary);
  border-color: var(--border);
  transform: translateY(-1px);
  box-shadow: var(--shadow-xs);
}
.header-btn-accent {
  background: var(--accent-glow);
  color: var(--accent);
  border-color: transparent;
}
.header-btn-accent:hover {
  background: var(--accent-glow);
  color: var(--accent-purple);
  border-color: transparent;
}
.btn-label { display: inline; }
@media (max-width: 640px) {
  .header-stats { display: none; }
  .btn-label { display: none; }
}
</style>
