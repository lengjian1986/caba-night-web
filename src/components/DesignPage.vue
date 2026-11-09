<script setup lang="ts">
import { computed, provide, reactive, watch } from 'vue'
import { locale, t } from '../i18n'
import { useRoute, useRouter } from 'vue-router'
import { areaIds, areas, cardEntity, castIds, castNames, designs, entity, isCard, number, pageTitles, planIds, planNames, shopIds, shops, type DesignNode } from '../design'
import type { Action } from '../actions'
import { useSite } from '../composables/useSite'
import type { PageController } from '../pageController'
import DesignNodeView from './DesignNode.vue'
import SiteHeader from './SiteHeader.vue'
import SiteFooter from './SiteFooter.vue'
import SiteIcon from './SiteIcon.vue'
const route = useRoute(), router = useRouter(), site = useSite()
const page = computed(() => {
  const p = String(route.meta.page || 'notFound')
  if (route.params.shopId && !shopIds.includes(String(route.params.shopId))) return 'notFound'
  if (route.params.castId && !castIds.includes(String(route.params.castId))) return 'notFound'
  if (route.params.planId && !planIds.includes(String(route.params.planId))) return 'notFound'
  if (route.params.areaSlug && !areaIds.includes(String(route.params.areaSlug))) return 'notFound'
  if (route.params.slug && !['luxe-night', 'first-visit', 'first-visit-guide', 'vip', 'shinjuku', 'social'].includes(String(route.params.slug))) return 'notFound'
  return p
})
const fields = reactive<Record<string, string>>({})
const filterOpen = reactive({ value: false })
const tab = computed(() => String(route.query.tab || ''))
const currentShop = computed(() => shops[Math.max(0, shopIds.indexOf(String(route.params.shopId)))]!)
const currentCast = computed(() => castNames[Math.max(0, castIds.indexOf(String(route.params.castId)))]!)
const currentPlan = computed(() => planNames[Math.max(0, planIds.indexOf(String(route.params.planId)))]!)
function traverse(node: DesignNode, fn: (n: DesignNode) => void) { fn(node); node.children?.forEach(c => traverse(c, fn)) }
function clone<T>(value: T): T { return JSON.parse(JSON.stringify(value)) }
const base = computed(() => designs[page.value] || designs.notFound!)
watch(() => route.fullPath, () => {
  for (const key of Object.keys(fields)) delete fields[key]
  traverse(base.value!, n => { const key = n.name || ''; if (!n.children?.some(c => c.name === '展开')) return
    const q = /エリア/.test(key) ? 'area' : /キーワード/.test(key) ? 'q' : /料金/.test(key) ? 'price' : /タイプ/.test(key) ? 'category' : 'shop'
    const v = String(route.query[q] || '')
    if (v) fields[n.id] = q === 'area' ? areas[areaIds.indexOf(v)] || v : v
  })
  for (const label of String(route.query.facility || '').split(',').filter(Boolean)) fields['facility-' + label] = 'true'
  filterOpen.value = false
  document.title = `${t(pageTitles[page.value])}${page.value === 'home' ? '' : ' | CABA NIGHT'}`
}, { immediate: true })
watch(locale, () => { document.title = `${t(pageTitles[page.value])} | CABA NIGHT` })
const favoritesType = computed(() => ['cast', 'plan'].includes(tab.value) ? tab.value as 'cast' | 'plan' : 'shop')
const filteredOut = computed(() => {
  if (!['shops', 'casts', 'plans'].includes(page.value)) return false
  return !renderNodes.value.some(n => isCard(n))
})
const renderNodes = computed(() => {
  const root = clone(base.value!)
  let nodes = (root.children || []).filter(n => !n.ref && !/共用 PC 导航|共用页脚/.test(n.name || ''))
  const q = String(route.query.q || '').trim().toLocaleLowerCase().normalize('NFKC')
  const area = String(route.query.area || '')
  const shopFilter = String(route.query.shop || '')
  const price = String(route.query.price || '')
  const category = String(route.query.category || '')
  if (['shops', 'casts', 'plans'].includes(page.value)) {
    const cards = nodes.filter(isCard)
    const shown = cards.filter(n => {
      let txt = ''; traverse(n, c => txt += ' ' + (c.content || ''))
      if (q && !txt.toLocaleLowerCase().normalize('NFKC').includes(q)) return false
      if (area && area !== 'shinjuku' && area !== 'すべてのエリア') return false
      if (shopFilter && shopFilter !== 'すべての店舗' && !txt.includes(shopFilter)) return false
      if (price === '¥12,000以上' || category === 'ラウンジ' && page.value === 'shops') return false
      if (category && !/^すべて|キャバクラ|指定なし/.test(category)) {
        const categories: Record<string, string> = { '初回来店': '初めて', 'VIP・個室': 'VIP', 'グループ': 'グループ', 'スタンダード': 'スタンダード' }
        if (!txt.includes(categories[category] || category)) return false
      }
      if (/外国語対応|公式SNSあり/.test(String(route.query.facility || ''))) return false
      return true
    })
    const slots = cards.map(n => ({ x: n.x, y: n.y }))
    shown.forEach((n, i) => Object.assign(n, slots[i]))
    const keep = new Set(shown.map(n => n.id))
    nodes = nodes.filter(n => !isCard(n) || keep.has(n.id))
    if (route.query.sort === 'name') {
      shown.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
      shown.forEach((n, i) => Object.assign(n, slots[i]))
    }
  }
  if (page.value === 'favorites') {
    nodes = nodes.filter(n => !isCard(n) && n.name !== '保存を解除')
    const kind = favoritesType.value
    const samples = (designs[kind === 'shop' ? 'home' : kind === 'cast' ? 'casts' : 'plans']!.children || []).filter(n => cardEntity(n)?.type === kind)
    const list = site.saved.value.filter(s => s.type === kind)
    list.forEach((s, i) => {
      const sample = samples.find(n => cardEntity(n)?.id === s.id) || samples[0]
      if (!sample) return
      const card = clone(sample); card.x = 80 + i % 3 * 435; card.y = 421 + Math.floor(i / 3) * 410
      const identity = kind === 'shop' ? shops[shopIds.indexOf(s.id)] : kind === 'cast' ? castNames[castIds.indexOf(s.id)] : planNames[planIds.indexOf(s.id)]
      const oldIdentity = kind === 'shop' ? shops[0]! : kind === 'cast' ? castNames[0]! : planNames[0]!
      if (sample === samples[0] && identity) traverse(card, n => { if (n.content) n.content = n.content.replaceAll(oldIdentity, identity); if (n.name) n.name = n.name.replaceAll(oldIdentity, identity) })
      nodes.push(card)
      nodes.push({ id: 'remove-' + s.id, name: '保存を解除', type: 'frame', x: card.x, y: number(card.y) + number(card.height) + 12, width: card.width, height: 40, fill: '#14263A', cornerRadius: 6, justifyContent: 'center', alignItems: 'center', children: [{ id: 'remove-text-' + s.id, type: 'text', name: '保存を解除文字', content: '保存を解除', fontSize: 14, fill: '#F6F4F0', fontFamily: 'Noto Sans JP' }] })
    })
  }
  nodes.forEach(n => traverse(n, c => {
    if (c.name === '排序' || c.name === '顺序') { if (route.query.sort === 'name') c.content = '表示順：名前順  ⌄' }
    if (c.children) c.children.forEach((child, i) => {
      if (child.name === '勾选项') { const label = c.children?.[i + 1]?.content || ''; child.name = '勾选项 ' + label; child.icon = fields['facility-' + label] === 'true' ? 'check' : 'square' }
    })
    if (/^♡ お気に入り|お気に入りに保存/.test(c.name || '') && c.children) {
      const kind = page.value === 'cast' ? 'cast' : page.value === 'plan' ? 'plan' : 'shop'
      const id = String(kind === 'cast' ? route.params.castId : kind === 'plan' ? route.params.planId : route.params.shopId)
      const text = c.children.find(t => t.type === 'text')
      if (text && site.has(kind, id)) text.content = '♥ 保存済み'
    }
  }))
  if (['shop', 'cast', 'plan', 'area', 'report'].includes(page.value)) {
    const newShop = page.value === 'report' ? shops[shopIds.indexOf(String(route.query.id))] || currentShop.value : currentShop.value
    const areaName = areas[areaIds.indexOf(String(route.params.areaSlug))] || areas[0]!
    nodes.forEach(n => traverse(n, c => {
      if (!c.content) return
      if (['shop', 'plan', 'report'].includes(page.value)) c.content = c.content.replaceAll('CLUB LUXE', newShop)
      if (page.value === 'cast') c.content = c.content.replaceAll('桜 りな', currentCast.value)
      if (page.value === 'plan') c.content = c.content.replaceAll('スタンダードプラン', currentPlan.value)
      if (page.value === 'area') c.content = c.content.replaceAll('新宿・歌舞伎町', areaName).replaceAll('新宿', areaName === areas[0] ? '新宿' : areaName)
    }))
    if (page.value === 'cast' && currentCast.value !== castNames[0]) {
      const portraits = (designs.casts!.children || []).filter(n => cardEntity(n)?.type === 'cast')
      const photo = portraits[castIds.indexOf(String(route.params.castId))]?.children?.find(n => n.type === 'rectangle')
      const hero = nodes.find(n => n.name === '个人主图')
      if (hero && photo) hero.id = photo.id
    }
  }
  return nodes
})
const height = computed(() => {
  if (page.value === 'favorites') return Math.max(1170, 560 + Math.ceil(site.saved.value.filter(s => s.type === favoritesType.value).length / 3) * 410 + 220)
  return number(base.value!.height)
})
const groups = computed(() => {
  const ordered = [...renderNodes.value].sort((a, b) => number(a.y) - number(b.y) || number(a.x) - number(b.x))
  const result: { y: number; nodes: DesignNode[]; cards: boolean }[] = []
  for (const n of ordered) {
    const y = number(n.y); const prev = result.at(-1)
    if (prev && Math.abs(prev.y - y) <= 24 && !/分区|页面标题|面包屑/.test(n.name || '') && !prev.nodes.some(c => /分区|页面标题|面包屑/.test(c.name || ''))) { prev.nodes.push(n); prev.cards ||= isCard(n) }
    else result.push({ y, nodes: [n], cards: isCard(n) })
  }
  return result
})
function search() {
  const query: Record<string, string> = {}
  traverse(base.value!, n => {
    const v = fields[n.id]; if (!v?.trim() || /^(すべて|指定なし)/.test(v)) return
    const label = n.name || ''
    if (/エリア/.test(label)) query.area = areaIds[areas.indexOf(v)] || v
    else if (/キーワード/.test(label)) query.q = v.trim()
    else if (/料金/.test(label)) query.price = v
    else if (/タイプ/.test(label)) query.category = v
    else query.shop = v
  })
  const facilities = Object.entries(fields).filter(([k,v]) => k.startsWith('facility-') && v === 'true').map(([k]) => k.slice(9))
  if (facilities.length) query.facility = facilities.join(',')
  router.push({ path: route.path, query })
}
function act(action: Action, context: string[]) {
  const kind = action.kind
  if (kind === 'facility') { const key = 'facility-' + action.value; fields[key] = fields[key] === 'true' ? 'false' : 'true'; return }
  if (kind === 'search') return search()
  if (kind === 'reset') return void router.push({ path: route.path })
  if (kind === 'sort') return void router.replace({ query: { ...route.query, sort: route.query.sort ? undefined : 'name' } })
  if (kind === 'tab') {
    const label = action.value || ''
    if (page.value === 'favorites') return void router.replace({ query: { tab: label === 'キャスト' ? 'cast' : label === 'プラン' ? 'plan' : 'shop' } })
    if (page.value === 'area') return void router.push({ path: label === 'キャスト' ? '/casts' : label === 'プラン' ? '/plans' : label === '街のガイド' ? '/features' : '/shops', query: { area: String(route.params.areaSlug || 'shinjuku') } })
    if (page.value === 'shop') { const key = ({ '店舗紹介': '分区 上質なひとときを、あなたに。', 'キャスト': '分区 所属キャスト', 'プラン': '分区 プラン・料金', '料金・設備': '店铺概要', 'アクセス': '分区 アクセス・店舗情報' } as Record<string, string>)[label]; document.querySelector(`[data-name="${key}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); return }
    if (page.value === 'rankings') return void router.push(label === 'キャスト' ? '/casts' : label === 'プラン' ? '/plans' : '/rankings')
    if (page.value === 'areas') { if (label !== '東京') site.inform('このエリアの店舗は、まだ掲載されていません。'); return }
    return void router.replace({ query: { ...route.query, category: label === 'すべて' ? undefined : label } })
  }
  if (kind === 'favorite') {
    const n = context.join('|')
    if (page.value === 'favorites') { const id = action.value?.replace('remove-', '') || ''; const entry = site.saved.value.find(s => s.id === id); if (entry) site.toggle(entry.type, entry.id); return }
    const type = page.value === 'cast' || /Cast/.test(n) ? 'cast' : page.value === 'plan' || /Plan/.test(n) ? 'plan' : 'shop'
    const id = String(type === 'cast' ? route.params.castId || entity(context, 'cast') : type === 'plan' ? route.params.planId || entity(context, 'plan') : route.params.shopId || entity(context))
    site.toggle(type, id); return
  }
  if (kind === 'share') return void site.copy(location.href)
  if (kind === 'copy') return void site.copy(action.value === 'plan' ? `「${currentShop.value}」の「${currentPlan.value}」を見ました。利用条件や料金について教えていただけますか？\n${location.href}` : `掲載情報の修正について\n対象：${currentShop.value}\nページ：${location.href}\n修正内容：`)
  if (kind === 'map') { site.inform('店舗の詳しい住所・地図は、公開情報の登録後にご案内します。'); return }
  if (kind === 'unavailable' || kind === 'platform') { site.unavailable(); return }
  if (['contact', 'phone', 'social', 'plan', 'gallery'].includes(kind || '')) { site.modal.value = kind as typeof site.modal.value; return }
}
provide<PageController>('page', { page, fields, act })
const isEmptyFavorite = computed(() => page.value === 'favorites' && !site.saved.value.some(s => s.type === favoritesType.value))
</script>
<template>
  <div :class="['page-viewport', 'page-' + page]" :style="{ '--page-height': height + 'px' }">
    <div class="design-stage" :style="{ height: height + 'px' }">
      <SiteHeader />
      <main id="main-content" class="scene-content" :aria-label="pageTitles[page]">
        <button v-if="['shops', 'casts', 'plans'].includes(page)" class="mobile-filter-toggle" :aria-expanded="filterOpen.value" @click="filterOpen.value = !filterOpen.value"><SiteIcon name="search" :size="18" />検索条件を変更</button>
        <div v-for="(group, i) in groups" :key="i" :class="['mobile-row', { 'card-row': group.cards, 'filter-is-open': filterOpen.value }]">
          <DesignNodeView v-for="node in group.nodes" :key="node.id" :node="node" :context="[node.id]" top />
        </div>
        <section v-if="filteredOut || isEmptyFavorite" class="empty-state" :class="{ 'search-empty': filteredOut }" role="status"><SiteIcon :name="isEmptyFavorite ? 'heart' : 'search'" :size="48" /><h2>{{ isEmptyFavorite ? 'お気に入りは、まだありません' : '条件に合う情報がありません' }}</h2><p>{{ isEmptyFavorite ? '気になる店舗・キャスト・プランを保存しましょう。' : 'エリアや条件を変えて、もう一度探してみてください。' }}</p><RouterLink v-if="isEmptyFavorite" to="/shops" class="primary-button">店舗を探す</RouterLink><button v-else class="primary-button" @click="act({ kind: 'reset' }, [])">条件をリセット</button></section>
      </main>
      <SiteFooter :style="{ top: height - 156 + 'px' }" />
    </div>
    <div v-if="['shop', 'plan'].includes(page)" class="mobile-contact-bar"><span>{{ currentShop }}<small>店舗へ直接お問い合わせ</small></span><button class="primary-button" @click="site.modal.value = page === 'plan' ? 'plan' : 'contact'">店舗に問い合わせ</button></div>
  </div>
</template>
