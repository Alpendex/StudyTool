<script setup>
import { useQuestionBankStore } from '../stores/questionBank.js'
import { usePracticeStore } from '../stores/practice.js'
import { findNode } from '../utils/helpers.js'
import { useMindmapStore } from '../stores/mindmap.js'
import { MOCK_QUESTIONS } from '../data/mockQuestions.js'

const props = defineProps({ sectionId: String, nodeId: String })
const emit = defineEmits(['close'])

const qbStore = useQuestionBankStore()
const mindmapStore = useMindmapStore()
const practiceStore = usePracticeStore()

const step = ref(0)       // 0..2 questions, 3=results
const questions = ref([])
const results = ref([])   // 'correct'|'incorrect'[3]
const answerRevealed = ref(false)
const nodeName = ref('')

const currentQuestion = computed(() => questions.value[step.value])

onMounted(() => {
  const tree = mindmapStore.getTree(props.sectionId)
  const node = findNode(tree, props.nodeId)
  nodeName.value = node?.name || '练习'

  let qs = qbStore.getByNode(props.sectionId, props.nodeId)
  if (qs.length < 3) {
    const rest = qbStore.getAll(props.sectionId).filter(q => q.nodeId !== props.nodeId)
    qs = [...qs, ...rest]
  }
  if (qs.length < 3) {
    const mock = MOCK_QUESTIONS[props.sectionId] || MOCK_QUESTIONS.math
    qs = [...qs, ...mock]
  }
  questions.value = qs.slice(0, 3)
  results.value = new Array(questions.value.length).fill(undefined)
})

async function finish() {
  const correct = results.value.filter(r => r === 'correct').length
  await practiceStore.record(props.sectionId, props.nodeId, correct, questions.value.length)
  step.value = questions.value.length
}
</script>

<template>
  <n-modal :show="true" preset="card" :title="'🎯 练习 — ' + nodeName" style="max-width:520px;width:95%"
    :on-close="emit('close')" :mask-closable="false">
    <!-- Step -->
    <div v-if="step < questions.length">
      <div style="text-align:center;color:#6b7280;font-size:.8rem;margin-bottom:10px">
        第 {{ step + 1 }} / {{ questions.length }} 题
        <span v-if="currentQuestion" :class="'q-type-tag q-type-'+(currentQuestion.type||'简答')">{{ currentQuestion.type || '简答' }}</span>
      </div>

      <!-- Question -->
      <n-card size="small" style="margin-bottom:12px;background:#f3f4f6">
        {{ currentQuestion?.question }}
      </n-card>

      <!-- Answer -->
      <div v-if="answerRevealed" class="practice-answer-text" style="margin-bottom:12px">
        💡 {{ currentQuestion?.answer }}
      </div>

      <!-- Actions -->
      <div v-if="!answerRevealed" style="display:flex;justify-content:center;margin-bottom:12px">
        <n-button type="primary" @click="answerRevealed = true">显示答案</n-button>
      </div>

      <div v-else-if="results[step] === undefined" style="text-align:center;margin-bottom:12px">
        <p style="font-size:.85rem;font-weight:500;margin-bottom:8px">这道题你做对了吗？</p>
        <n-button-group>
          <n-button type="success" @click="results[step]='correct';answerRevealed=false">✅ 正确</n-button>
          <n-button type="error" @click="results[step]='incorrect';answerRevealed=false">❌ 错误</n-button>
        </n-button-group>
      </div>

      <div v-else style="text-align:center;margin-bottom:12px">
        <p style="margin-bottom:6px;font-weight:500;font-size:.85rem"
           :style="{color:results[step]==='correct'?'#10b981':'#ef4444'}">
          你标记为: {{ results[step] === 'correct' ? '✅ 正确' : '❌ 错误' }}
        </p>
        <n-button-group>
          <n-button size="small" @click="results[step]=undefined;answerRevealed=true" v-if="step < questions.length">重新自评</n-button>
          <n-button size="small" type="primary" @click="step++;answerRevealed=false" v-if="step < questions.length">
            {{ step < questions.length - 1 ? '下一题 →' : '查看结果' }}
          </n-button>
        </n-button-group>
      </div>
    </div>

    <!-- Result -->
    <div v-else style="text-align:center;padding:20px">
      <div class="practice-result-score">{{ results.filter(r=>r==='correct').length }}/{{ results.length }}</div>
      <p style="color:#6b7280;margin:6px 0 16px">
        正确率 {{ Math.round(results.filter(r=>r==='correct').length / results.length * 100) }}%
        <template v-if="results.every(r=>r==='correct')">🎉 太棒了！</template>
        <template v-else-if="results.filter(r=>r==='correct').length >= results.length/2">💪 继续加油！</template>
        <template v-else>📚 还需多练！</template>
      </p>
      <n-button @click="emit('close')">关闭</n-button>
    </div>
  </n-modal>
</template>
