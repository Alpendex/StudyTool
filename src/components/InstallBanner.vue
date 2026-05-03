<script setup>
const show = ref(false)
const deferredPrompt = ref(null)
const isIOS = ref(false)

onMounted(() => {
  // Android/Chrome install prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    const dismissed = localStorage.getItem('pwa_install_dismissed')
    if (!dismissed) show.value = true
  })

  // iOS detection
  isIOS.value = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase())
  const isStandalone = 'standalone' in navigator && navigator.standalone ||
    window.matchMedia('(display-mode: standalone)').matches
  if (isIOS.value && !isStandalone) {
    const dismissed = localStorage.getItem('pwa_install_dismissed')
    if (!dismissed) setTimeout(() => { show.value = true }, 3000)
  }
})

async function install() {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    await deferredPrompt.value.userChoice
    deferredPrompt.value = null
    show.value = false
    localStorage.setItem('pwa_install_dismissed', '1')
  } else if (isIOS.value) {
    show.value = false
    localStorage.setItem('pwa_install_dismissed', '1')
  }
}

function dismiss() {
  show.value = false
  localStorage.setItem('pwa_install_dismissed', '1')
}
</script>

<template>
  <div v-if="show" class="install-banner">
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,#4f46e5,#7c3aed);display:flex;align-items:center;justify-content:center;color:#fff;font-size:1.2rem">📚</div>
      <div style="font-size:.8rem">
        <strong style="font-size:.85rem;color:#1f2937">添加到主屏幕</strong>
        <span v-if="!isIOS" style="color:#6b7280;display:block">随时随地刷题学习</span>
        <span v-else style="color:#6b7280;display:block">点击分享按钮 → 「添加到主屏幕」</span>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:6px">
      <n-button size="small" type="primary" @click="install">{{ isIOS ? '知道了' : '安装应用' }}</n-button>
      <n-button size="small" quaternary @click="dismiss">✕</n-button>
    </div>
  </div>
</template>
