<script setup lang="ts">
import { t } from './i18n'
import { onMounted, onUnmounted, ref } from 'vue'
import ContactDialog from './components/ContactDialog.vue'
import { useSite } from './composables/useSite'
const width = ref(window.innerWidth)
const { toast, notice } = useSite()
function resize() { width.value = window.innerWidth }
onMounted(() => window.addEventListener('resize', resize))
onUnmounted(() => window.removeEventListener('resize', resize))
</script>
<template>
  <a class="skip-link" href="#main-content">{{ t('本文へスキップ') }}</a>
  <div class="app" :style="{ '--desktop-scale': String(Math.min(1, width / 1440)) }"><RouterView /></div>
  <ContactDialog />
  <Transition name="toast"><div v-if="toast" class="toast-message" role="status">{{ t(toast) }}</div></Transition>
  <aside v-if="notice" class="copy-fallback"><button :aria-label="t('閉じる')" @click="notice = ''">×</button><textarea readonly :value="notice" aria-label="コピーする内容" /></aside>
</template>
