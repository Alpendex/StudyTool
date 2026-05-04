// Timer helper — plain JS functions, caller manages reactive state
export function createTimer() {
  let timerStart = null
  let interval = null

  function start(onTick) {
    timerStart = Date.now()
    onTick(0)
    interval = setInterval(() => {
      onTick(Math.floor((Date.now() - timerStart) / 1000))
    }, 200)
  }

  function stop() {
    if (interval) { clearInterval(interval); interval = null }
    return Math.floor((Date.now() - timerStart) / 1000)
  }

  function dispose() {
    if (interval) clearInterval(interval)
    interval = null
    timerStart = null
  }

  return { start, stop, dispose }
}

export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
}
