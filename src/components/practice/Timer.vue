<script setup>
import { formatDuration } from '../../utils/timerHelper.js'

const props = defineProps({
  elapsed: { type: Number, default: 0 },
  running: { type: Boolean, default: false }
})

const display = computed(() => formatDuration(props.elapsed))
</script>

<template>
  <span class="pp-timer" :class="{ running }">
    ⏱ {{ display }}
  </span>
</template>

<style scoped>
.pp-timer {
  font-size: var(--font-base); font-weight: 600;
  color: var(--text-secondary); font-variant-numeric: tabular-nums;
  min-width: 60px; text-align: right;
}
.pp-timer.running { color: var(--accent); }
</style>
