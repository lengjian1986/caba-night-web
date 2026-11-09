<script setup lang="ts">
import { computed } from 'vue'
import data from '../icons.json'
const props = defineProps<{ name?: string; size?: number }>()
const icons = data as Record<string, { size: number; paths: string[] }>
const icon = computed(() => icons[props.name || ''])
const extras: Record<string, string> = { menu: 'M4 6h16M4 12h16M4 18h16', x: 'm6 6 12 12M18 6 6 18', phone: 'M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a14 14 0 0 1-7-7l2-2-2-5', 'chevron-right': 'm9 5 7 7-7 7', copy: 'M9 9h12v12H9zM3 15V3h12', 'external-link': 'M14 3h7v7M10 14 21 3M21 14v7H3V3h7' }
</script>
<template><svg :width="size || 22" :height="size || 22" :viewBox="icon ? `0 0 ${icon.size} ${icon.size}` : '0 0 24 24'" aria-hidden="true" focusable="false"><template v-if="icon"><path v-for="(d,i) in icon.paths" :key="i" :d="d" fill="currentColor" /></template><path v-else :d="extras[name || ''] || extras['external-link']" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg></template>
