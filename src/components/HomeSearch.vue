<script setup lang="ts">
import { t } from '../i18n'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCatalog } from '../api/catalog'
const catalog = useCatalog()
const areas = computed(() => catalog.areaOptions.value)
const router = useRouter(), area = ref(''), keyword = ref('')
function search() { router.push({ path: '/shops', query: { area: area.value, ...(keyword.value.trim() ? { q: keyword.value.trim() } : {}) } }) }
</script>
<template><form class="home-search" role="search" @submit.prevent="search"><label><span>{{ t('エリア') }}</span><select v-model="area" :aria-label="t('エリア')"><option value="">{{ t('すべてのエリア') }}</option><option v-for="item in areas" :key="item.id" :value="String(item.id)">{{ item.label }}</option></select></label><label><span>{{ t('キーワード') }}</span><input v-model="keyword" :aria-label="t('キーワード')" :placeholder="t('店名・エリアを入力')" /></label><button class="primary-button" type="submit">{{ t('お店を探す') }}</button></form></template>
