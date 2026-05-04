<script setup>
import { QUESTION_TYPES } from '../../data/mockQuestions.js'

const props = defineProps({
  form: Object,
  nodeOptions: Array
})

const emit = defineEmits(['save', 'cancel'])

const saveLabel = computed(() => props.form?.id ? '保存修改' : '添加题目')
</script>

<template>
  <div class="qbov-edit-card">
    <div class="qbov-edit-row">
      <n-select
        :value="form.nodeId"
        @update:value="form.nodeId = $event"
        :options="nodeOptions"
        placeholder="选择关联节点" style="flex:1" size="small"
      />
      <n-select
        :value="form.type"
        @update:value="form.type = $event"
        :options="QUESTION_TYPES.map(t=>({label:t,value:t}))"
        style="width:100px" size="small"
      />
    </div>
    <n-input
      :value="form.question"
      @update:value="form.question = $event"
      type="textarea" placeholder="输入题干..." size="small" :rows="2"
      style="margin-bottom:6px"
    />
    <n-input
      :value="form.answer"
      @update:value="form.answer = $event"
      type="textarea" placeholder="输入答案要点..." size="small" :rows="2"
      style="margin-bottom:8px"
    />
    <div class="qbov-edit-actions">
      <n-button size="small" @click="emit('cancel')">取消</n-button>
      <n-button size="small" type="primary" @click="emit('save')">{{ saveLabel }}</n-button>
    </div>
  </div>
</template>
