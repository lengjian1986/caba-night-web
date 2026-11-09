<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { nav } from '../design'
import { languages, locale, t } from '../i18n'
import SiteIcon from './SiteIcon.vue'
const route = useRoute()
const open = ref(false)
watch(() => route.fullPath, () => open.value = false)
</script>
<template>
  <header class="site-header">
    <RouterLink to="/" class="brand" :aria-label="t('CABA NIGHT ホーム')"><SiteIcon name="crown" :size="32" /><span>CABA NIGHT</span></RouterLink>
    <nav class="pc-nav" :aria-label="t('メインナビゲーション')"><RouterLink v-for="[text, href] in nav" :key="href" :to="href">{{ t(text) }}</RouterLink></nav>
    <RouterLink to="/favorites" class="header-favorite"><SiteIcon name="heart" :size="22" /><span>{{ t('お気に入り') }}</span></RouterLink>
    <label class="language-switch"><span class="sr-only">{{ t('言語') }}</span><select v-model="locale" :aria-label="t('言語')"><option v-for="language in languages" :key="language.value" :value="language.value">{{ language.label }}</option></select><SiteIcon name="chevron-down" :size="12" /></label>
    <button class="menu-toggle" :aria-expanded="open" aria-controls="mobile-menu" :aria-label="t(open ? 'メニューを閉じる' : 'メニューを開く')" @click="open = !open"><SiteIcon :name="open ? 'x' : 'menu'" :size="26" /></button>
    <nav v-if="open" id="mobile-menu" class="mobile-menu" :aria-label="t('モバイルナビゲーション')"><RouterLink v-for="[text, href] in [...nav, ['お気に入り', '/favorites'], ['イベント', '/events'], ['店舗のご案内', '/offers']]" :key="href" :to="href">{{ t(text) }}<span>→</span></RouterLink></nav>
  </header>
</template>
