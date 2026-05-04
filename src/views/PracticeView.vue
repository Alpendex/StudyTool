<script setup>
import PracticePage from '../components/practice/PracticePage.vue'

defineProps({
  sectionId: String,
  nodeId: String,
  singleQuestion: Object
})

const emit = defineEmits(['back', 'done'])
</script>

<template>
  <PracticePage
    :section-id="sectionId"
    :node-id="nodeId"
    :single-question="singleQuestion"
    @back="emit('back')"
    @done="emit('done')"
  />
</template>
