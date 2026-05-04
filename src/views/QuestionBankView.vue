<script setup>
import QuestionBank from '../components/question/QuestionBank.vue'

defineProps({
  sections: Array,
  currentSectionId: String
})

const emit = defineEmits(['switchSection', 'practiceSingle'])
</script>

<template>
  <QuestionBank
    :sections="sections"
    :current-section-id="currentSectionId"
    @switch-section="emit('switchSection', $event)"
    @practice-single="emit('practiceSingle', $event)"
  />
</template>
