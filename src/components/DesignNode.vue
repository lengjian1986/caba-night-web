<script setup lang="ts">
import { computed, inject } from 'vue'
import { RouterLink } from 'vue-router'
import { t } from '../i18n'
import { actionFor } from '../actions'
import { fieldOptions, isButton, isCard, isField, isLine, nodeStyle, type DesignNode } from '../design'
import type { PageController } from '../pageController'
import SiteIcon from './SiteIcon.vue'
import photoMap from '../photo-map.json'
const photos = photoMap as Record<string, string>
import HomeSearch from './HomeSearch.vue'
const props = defineProps<{ node: DesignNode; context?: string[]; inFlex?: boolean; top?: boolean }>()
const ctl = inject<PageController>('page')!
const context = computed(() => props.context || [])
const action = computed(() => actionFor(props.node, context.value, ctl.page.value))
const button = computed(() => isButton(props.node))
const field = computed(() => isField(props.node))
const options = computed(() => (ctl.options || fieldOptions)(props.node.name || ''))
const current = computed(() => ctl.fields[props.node.id] ?? props.node.children?.find(c => c.name?.endsWith('内容'))?.content ?? '')
const tag = computed(() => action.value?.to ? RouterLink : action.value ? 'button' : button.value ? 'span' : props.node.name === '页面标题' || props.node.name === '主标题' || props.top && ['店名', '展示名', '方案标题', '错误标题'].includes(props.node.name || '') ? 'h1' : props.node.name?.startsWith('分区 ') ? 'h2' : isCard(props.node) ? 'article' : 'div')
const isImage = computed(() => props.node.type === 'rectangle' && typeof props.node.fill === 'object' && props.node.fill.type === 'image')
const flow = computed(() => props.node.type === 'frame' && !button.value && !field.value && !isCard(props.node) && !isLine(props.node) && /筛选|搜索|概要|条件明细|活动信息|反馈模板|FAQ 分类|目录|步骤|联系卡片|所属店铺信息|保障|说明|联系分类|指南|商家流程|提示|引导|优惠首屏|地区切换|纠错对象/.test(props.node.name || ''))
const style = computed(() => ({ ...nodeStyle(props.node, props.inFlex), '--node-w': `${props.node.width || 0}px`, '--node-h': `${props.node.height || 0}px`, '--node-left': `${props.node.x || 0}px`, '--node-ratio': String((Number(props.node.width) || 1) / (Number(props.node.height) || 1)), '--node-font': `${props.node.fontSize || 16}px` }))
const children = computed(() => (props.node.children || []).filter(c => c.enabled !== false))
const childContext = computed(() => [...context.value, props.node.name || ''])
function activate() { if (action.value && !action.value.to && !action.value.disabled) ctl.act(action.value, childContext.value) }
function change(event: Event) { ctl.fields[props.node.id] = (event.target as HTMLInputElement).value }
function keydown(event: KeyboardEvent) { if (field.value && event.key === 'Enter') ctl.act({ kind: 'search' }, context.value) }
</script>
<template>
  <component :is="tag" v-if="node.enabled !== false" :to="action?.to" :type="action && !action.to ? 'button' : undefined" :disabled="action?.disabled" :data-design-id="node.id" :data-name="node.name" :class="['design-node', { 'design-text': node.type === 'text', 'design-frame': node.type === 'frame', 'design-image': isImage, 'design-card': isCard(node), 'design-button': button, 'design-field': field, 'design-line': isLine(node), 'mobile-flow': flow, 'top-node': top, 'action-node': action }]" :style="style" :aria-label="node.type === 'rectangle' && action ? context.at(-1) : node.type === 'icon' && action ? node.name : undefined" @click="activate">
    <HomeSearch v-if="node.name === '首页搜索'" />
    <template v-else-if="field">
      <input v-if="/キーワード/.test(node.name || '')" :aria-label="t(node.name)" :placeholder="t(node.children?.find(c => c.name?.endsWith('内容'))?.content || current)" :value="ctl.fields[node.id] || ''" @input="change" @keydown="keydown" />
      <select v-else :aria-label="t(node.name)" :value="options.includes(current) ? current : options[0]" @change="change"><option v-for="o in options" :key="o" :value="o">{{ t(o) }}</option></select>
      <SiteIcon v-if="!/キーワード/.test(node.name || '')" class="field-chevron" name="chevron-down" :size="18" />
    </template>
    <template v-else-if="isImage"><img v-if="node.imageSrc || !node.live && photos[node.id]" :src="node.imageSrc || photos[node.id]" alt="" :loading="top ? 'eager' : 'lazy'" decoding="async" /><span v-else class="image-placeholder">{{ t('写真準備中') }}</span></template>
    <SiteIcon v-else-if="node.type === 'icon'" :name="node.icon" :size="typeof node.width === 'number' ? node.width : 22" />
    <template v-else-if="node.type === 'text'">{{ t(node.content) }}</template>
    <template v-else><DesignNode v-for="child in children" :key="child.id" :node="child" :context="childContext" :in-flex="!!node.justifyContent" /></template>
  </component>
</template>
