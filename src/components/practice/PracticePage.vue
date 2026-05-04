<script setup>
import { usePractice } from '../../composables/usePractice.js'
import { createTimer, formatDuration } from '../../utils/timerHelper.js'
import Timer from './Timer.vue'
import AnswerCard from './AnswerCard.vue'

const props = defineProps({ sectionId: String, nodeId: String, singleQuestion: Object })
const emit = defineEmits(['back', 'done'])

const {
  step, questions, results, answerRevealed, nodeName, currentQuestion,
  initQuestions, revealAnswer, selfEvaluate, advanceStep, finish: finishPractice
} = usePractice()

const timer = createTimer()
const elapsed = ref(0)
const durations = ref([])
const isRunning = computed(() => !answerRevealed.value && results.value[step.value] === undefined)

const currentDuration = computed(() => formatDuration(elapsed.value))

function startTimer() {
  timer.start((secs) => { elapsed.value = secs })
}

function stopAndRecord() {
  durations.value[step.value] = timer.stop()
}

function init() {
  timer.dispose()
  elapsed.value = 0
  initQuestions(props.sectionId, props.nodeId, props.singleQuestion)
  durations.value = new Array(questions.value.length).fill(0)
  startTimer()
}

onMounted(() => { init() })
watch(() => [props.singleQuestion, props.nodeId], () => { init() })
onUnmounted(() => { timer.dispose() })

function onRevealAnswer() {
  stopAndRecord()
  revealAnswer()
}

function onSelfEvaluate(result) {
  selfEvaluate(result)
  if (advanceStep()) {
    startTimer()
  } else {
    finish()
  }
}

async function finish() {
  const nodeId = props.singleQuestion?.nodeId || props.nodeId
  await finishPractice(props.sectionId, nodeId)
  emit('done')
}

function goBack() {
  timer.dispose()
  emit('back')
}
</script>

<template>
  <div class="pp-root">
    <!-- Header -->
    <header class="pp-header">
      <button class="pp-back" @click="goBack">← 返回</button>
      <span class="pp-title">🎯 {{ nodeName }}</span>
      <Timer :elapsed="elapsed" :running="isRunning" />
    </header>

    <!-- Question / Answer -->
    <AnswerCard
      v-if="step < questions.length"
      :question="currentQuestion"
      :step="step"
      :total="questions.length"
      :answer-revealed="answerRevealed"
      :result="results[step]"
      :duration="currentDuration"
      :is-last="step === questions.length - 1"
      @reveal="onRevealAnswer"
      @evaluate="onSelfEvaluate"
      @next="advanceStep(); startTimer()"
      @finish="finish"
    />

    <!-- Results -->
    <div v-else class="pp-results">
      <div class="practice-score">{{ results.filter(r => r === 'correct').length }}<span style="font-size:1.5rem;color:var(--text-secondary)">/{{ results.length }}</span></div>
      <p class="pp-result-msg">
        正确率 {{ Math.round(results.filter(r => r === 'correct').length / results.length * 100) }}%
        <template v-if="results.every(r => r === 'correct')">🎉 太棒了！</template>
        <template v-else-if="results.filter(r => r === 'correct').length >= results.length / 2">💪 继续加油！</template>
        <template v-else>📚 还需多练！</template>
      </p>
      <div v-if="durations.some(d => d > 0)" class="pp-duration-list">
        各题耗时：
        <span v-for="(d, i) in durations" :key="i" class="pp-dur-item">
          题{{ i + 1 }}: {{ d }}s
        </span>
      </div>
      <n-button @click="goBack" size="large">返回</n-button>
    </div>
  </div>
</template>

<style scoped>
.pp-root {
  flex: 1; display: flex; flex-direction: column; min-height: 0;
  background: var(--bg);
}
.pp-header {
  display: flex; align-items: center; gap: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-bottom: 1px solid var(--glass-border);
  flex-shrink: 0;
}
.pp-back {
  padding: 6px 14px; border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface); cursor: pointer;
  font-size: var(--font-sm); font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}
.pp-back:hover { background: var(--surface); color: var(--text-primary); transform: translateY(-1px); }
.pp-title { flex: 1; font-weight: var(--font-weight-semibold); font-size: var(--font-base); color: var(--text-primary); }
.pp-results {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  text-align: center; padding: 40px 20px;
}
.pp-result-msg {
  color: var(--text-secondary);
  margin: 6px 0 20px;
  font-size: var(--font-base);
}
.pp-duration-list {
  display: flex; gap: 8px; flex-wrap: wrap;
  font-size: var(--font-xs); color: var(--text-secondary);
  margin-bottom: 20px;
}
.pp-dur-item {
  background: var(--surface); padding: 2px 8px;
  border-radius: var(--radius-sm); border: 1px solid var(--border);
}
</style>
