<script setup>
const props = defineProps({
  question: Object,
  step: Number,
  total: Number,
  answerRevealed: Boolean,
  result: [String, undefined], // 'correct' | 'incorrect' | undefined
  duration: String,
  isLast: Boolean
})

const emit = defineEmits(['reveal', 'evaluate', 'next', 'finish'])
</script>

<template>
  <div class="pp-body">
    <div class="pp-step-info">
      第 {{ step + 1 }} / {{ total }} 题
      <span v-if="question" :class="'q-badge ' + (question.type||'简答')">{{ question.type || '简答' }}</span>
    </div>

    <div class="pp-question-card">
      {{ question?.question }}
    </div>

    <!-- Answer -->
    <Transition name="fade">
      <div v-if="answerRevealed" class="pp-answer-box">
        <div class="pp-answer-label">💡 答案要点</div>
        <div class="pp-answer-text">{{ question?.answer }}</div>
        <div class="pp-answer-duration">耗时: {{ duration }}</div>
      </div>
    </Transition>

    <!-- Actions: show answer -->
    <div v-if="!answerRevealed && result === undefined" class="pp-actions">
      <n-button type="primary" size="large" @click="emit('reveal')">💡 查看答案</n-button>
    </div>

    <!-- Actions: self evaluate -->
    <div v-else-if="answerRevealed && result === undefined" class="pp-actions">
      <p class="pp-eval-label">这道题你做对了吗？</p>
      <div class="pp-eval-btns">
        <n-button type="success" size="large" @click="emit('evaluate', 'correct')">✅ 正确</n-button>
        <n-button type="error" size="large" @click="emit('evaluate', 'incorrect')">❌ 错误</n-button>
      </div>
    </div>

    <!-- After evaluation: advance -->
    <div v-else-if="result !== undefined" class="pp-actions">
      <p class="pp-eval-label">
        <span :class="result === 'correct' ? 'tag-correct' : 'tag-incorrect'" style="padding:2px 10px;border-radius:9999px;font-weight:600">
          {{ result === 'correct' ? '✅ 正确' : '❌ 错误' }}
        </span>
      </p>
      <div class="pp-eval-btns">
        <n-button v-if="!isLast" type="primary" size="large" @click="emit('next')">下一题 →</n-button>
        <n-button v-else type="primary" size="large" @click="emit('finish')">查看结果</n-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pp-body {
  flex: 1; overflow-y: auto; padding: var(--spacing-xl);
  max-width: 720px; margin: 0 auto; width: 100%;
}
.pp-step-info {
  text-align: center; color: var(--text-secondary);
  font-size: var(--font-sm); margin-bottom: 20px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-weight: var(--font-weight-medium);
}
.pp-question-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  margin-bottom: 20px;
  font-size: var(--font-lg);
  line-height: 1.7;
  color: var(--text-primary);
  box-shadow: var(--shadow-md);
}
.pp-answer-box {
  padding: var(--spacing-lg); margin-bottom: 20px;
  background: var(--success-bg);
  border-left: 4px solid var(--success);
  border-radius: 0 var(--radius-md) var(--radius-md) 0;
}
.pp-answer-label {
  font-weight: var(--font-weight-semibold); margin-bottom: 8px;
  color: var(--success); font-size: var(--font-sm);
}
.pp-answer-text {
  line-height: 1.7; color: var(--text-primary);
  margin-bottom: 10px;
}
.pp-answer-duration {
  font-size: var(--font-xs); color: var(--text-secondary);
}
.pp-actions {
  display: flex; flex-direction: column; align-items: center;
  margin-bottom: 20px;
}
.pp-eval-label {
  font-size: var(--font-base); font-weight: var(--font-weight-medium);
  margin-bottom: 14px; color: var(--text-primary);
}
.pp-eval-btns { display: flex; gap: 12px; }
.tag-correct { color: var(--success); background: var(--success-bg); }
.tag-incorrect { color: var(--danger); background: var(--danger-bg); }

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0; transform: translateY(-6px);
}

@media (max-width: 768px) {
  .pp-body { padding: var(--spacing-md); }
  .pp-question-card { padding: var(--spacing-md); font-size: var(--font-base); }
  .pp-eval-btns { flex-direction: column; width: 100%; }
}
</style>
