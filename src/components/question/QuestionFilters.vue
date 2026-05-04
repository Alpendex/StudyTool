<script setup>
import { QUESTION_TYPES } from '../../data/mockQuestions.js'

defineProps({
  searchText: String,
  filterNodeId: String,
  filterType: String,
  nodeOptions: Array
})

const emit = defineEmits([
  'update:searchText',
  'update:filterNodeId',
  'update:filterType',
  'add',
  'export'
])
</script>

<template>
  <div class="qbov-toolbar">
    <n-input
      :value="searchText"
      @update:value="emit('update:searchText', $event)"
      placeholder="搜索题干或答案..." size="small" style="width:220px" clearable
    />
    <n-select
      :value="filterNodeId"
      @update:value="emit('update:filterNodeId', $event)"
      :options="[{label:'全部节点',value:''}, ...(nodeOptions||[])]"
      placeholder="按节点筛选" size="small" style="width:180px" clearable
    />
    <n-select
      :value="filterType"
      @update:value="emit('update:filterType', $event)"
      :options="[{label:'全部题型',value:''}, ...QUESTION_TYPES.map(t=>({label:t,value:t}))]"
      placeholder="按题型筛选" size="small" style="width:120px" clearable
    />
    <n-button size="small" type="primary" @click="emit('add')">＋ 添加题目</n-button>
    <n-button size="small" @click="emit('export')" style="margin-left:auto">📥 导出</n-button>
  </div>
</template>
