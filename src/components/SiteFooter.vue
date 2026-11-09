<script setup lang="ts">
import { t } from '../i18n'
import { footerLinks } from '../design'
</script>
<template><footer class="site-footer"><RouterLink class="footer-brand" to="/">CABA NIGHT</RouterLink><p class="footer-tagline">{{ t('お店と、人と、特別な夜に出会う。') }}</p><nav aria-label="フッターナビゲーション"><RouterLink v-for="[text, href] in footerLinks" :key="href" :to="href">{{ t(text) }}</RouterLink></nav><small>© CABA NIGHT</small><p class="footer-note">{{ t('料金・掲載情報は店舗へご確認ください。') }}</p></footer></template>
