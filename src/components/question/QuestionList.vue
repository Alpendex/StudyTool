<script setup>
const props = defineProps({
  questions: Array,
  checkedIds: Set,
  allChecked: Boolean,
  checkedCount: Number,
  nodePathFn: Function // getNodePath function from parent
})

const emit = defineEmits([
  'update:allChecked',
  'toggleCheck',
  'clearSelection',
  'batchDelete',
  'practice',
  'edit',
  'delete'
])
</script>

<template>
  <!-- Batch bar -->
  <div v-if="checkedCount > 0" class="qbov-batch-bar">
    <span>已选 <b>{{ checkedCount }}</b> 题</span>
    <n-button size="tiny" @click="emit('clearSelection')">取消选择</n-button>
    <n-button size="tiny" type="error" @click="emit('batchDelete')">批量删除</n-button>
  </div>

  <!-- Question list -->
  <div class="qbov-list">
    <div v-if="questions.length === 0" class="qbov-empty">
      <p>暂无题目</p>
      <p style="font-size:var(--font-xs);color:var(--text-secondary)">点击「＋ 添加题目」创建第一道题</p>
    </div>

    <div v-for="q in questions" :key="q.id" class="qbov-row" :class="{ checked: checkedIds.has(q.id) }">
      <n-checkbox :checked="checkedIds.has(q.id)" @update:checked="emit('toggleCheck', q.id)" />

      <div class="qbov-row-main">
        <div class="qbov-row-top">
          <span :class="'q-badge ' + (q.type||'简答')">{{ q.type || '简答' }}</span>
          <span class="qbov-row-node">{{ nodePathFn(q.nodeId) }}</span>
        </div>
        <div class="qbov-row-question">{{ q.question }}</div>
      </div>

      <div class="qbov-row-actions">
        <n-button size="tiny" type="primary" secondary @click="emit('practice', q)">🎯 练习</n-button>
        <n-button size="tiny" @click="emit('edit', q)">编辑</n-button>
        <n-button size="tiny" type="error" secondary @click="emit('delete', q.id)">删除</n-button>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="qbov-footer">
    <span>{{ questions.length }} 道题目</span>
    <n-checkbox :checked="allChecked" @update:checked="emit('update:allChecked', $event)">全选</n-checkbox>
  </div>
</template>
