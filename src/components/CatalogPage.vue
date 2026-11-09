<script setup lang="ts">
import { locale, t } from '../i18n'
import { computed, onUnmounted, provide, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { areaLabel, externalUrl, planExpired, useCatalog, type Cast, type Plan, type Shop } from '../api/catalog'
import { bindCast, bindPlan, bindShop, card, contentNodes, expandText, grid, lower, prepare, removeCards, sample, texts, walk } from '../catalogDesign'
import { designs, isCard, number, pageTitles, type DesignNode } from '../design'
import type { Action } from '../actions'
import type { PageController } from '../pageController'
import { useSite, type Saved } from '../composables/useSite'
import DesignNodeView from './DesignNode.vue'
import SiteHeader from './SiteHeader.vue'
import SiteFooter from './SiteFooter.vue'
import SiteIcon from './SiteIcon.vue'
const route = useRoute(), router = useRouter(), catalog = useCatalog(), site = useSite()
const page = computed(() => String(route.meta.page || 'home'))
const areaMembers = ref<{ id: number; shops: number[]; casts: number[] }>()
const busy = ref(true), error = ref(''), missing = ref(false), filterOpen = ref(false)
const fields = reactive<Record<string, string>>({})
const selectedCast = computed(() => catalog.casts.value.find(c => String(c.id) === route.params.castId))
const selectedShop = computed(() => catalog.shops.value.find(s => String(s.id) === String(route.params.shopId || selectedCast.value?.shop_id)))
const selectedPlan = computed(() => catalog.plans.value.find(p => p.id === route.params.planId && String(p.shop_id) === route.params.shopId))
let generation = 0
async function load() {
  const current = ++generation
  busy.value = true; error.value = ''; missing.value = false; areaMembers.value = undefined
  const kind = page.value, id = String(route.params.shopId || ''), castId = String(route.params.castId || '')
  try {
    await catalog.refresh()
    if (current !== generation) return
    if (kind === 'cast') {
      const cast = catalog.casts.value.find(c => String(c.id) === castId)
      if (cast) await catalog.loadShop(String(cast.shop_id))
      else missing.value = true
    } else if (id && ['shop', 'plan'].includes(kind)) {
      const shop = await catalog.loadShop(id)
      if (current !== generation) return
      missing.value = !shop || kind === 'plan' && !catalog.plans.value.some(p => p.id === route.params.planId && String(p.shop_id) === id)
    }
    if (current !== generation) return
    if (kind === 'area' && !selectedArea.value) missing.value = true
    if (selectedArea.value) {
      const areaId = selectedArea.value.id
      const result = await catalog.loadArea(areaId)
      if (current !== generation) return
      areaMembers.value = { id: areaId, shops: result.shops.map(s => s.id), casts: result.casts.map(c => c.id) }
    }
  } catch { if (current === generation) error.value = '情報を読み込めませんでした。時間をおいて再度お試しください。' }
  finally { if (current === generation) busy.value = false }
}
watch(() => [route.path, route.query.area], load, { immediate: true })
onUnmounted(() => { generation++ })
const areaOptions = computed(() => catalog.areaOptions.value.map(a => a.label))
const selectedArea = computed(() => catalog.resolveArea(String(route.params.areaSlug || route.query.area || '')))
const areaName = computed(() => selectedArea.value?.label || '')
const directoryAreas = computed(() => catalog.areaOptions.value.filter(a => (a.level || 2) > 1 && (!route.query.prefecture || String(a.id) === route.query.prefecture || String(a.parent_id) === route.query.prefecture || a.prefecture === catalog.resolveArea(String(route.query.prefecture))?.name)))
function options(label: string) {
  if (/キーワード/.test(label)) return ['']
  if (/エリア/.test(label)) return ['すべてのエリア', ...areaOptions.value]
  if (/店舗/.test(label) && !/タイプ/.test(label)) return ['すべての店舗', ...catalog.shops.value.map(s => s.name)]
  if (/料金/.test(label)) return ['指定なし', '¥8,000以下', '¥8,000〜¥12,000', '¥12,000以上']
  if (/店舗タイプ/.test(label)) return ['すべてのタイプ', ...new Set(catalog.shops.value.flatMap(s => s.tags).filter(t => /キャバクラ|ラウンジ|クラブ/.test(t)))]
  return ['すべてのプラン', ...new Set(catalog.plans.value.flatMap(p => [p.name, ...p.tags]))]
}
function fieldKey(label: string) { return /エリア/.test(label) ? 'area' : /キーワード/.test(label) ? 'q' : /料金/.test(label) ? 'price' : /タイプ/.test(label) ? 'category' : 'shop' }
watch([() => route.fullPath, () => areaOptions.value.join('|')], () => {
  Object.keys(fields).forEach(k => delete fields[k])
  walk(designs[page.value]!, n => {
    if (!n.children?.some(c => c.name === '展开')) return
    const key = fieldKey(n.name || '')
    fields[n.id] = key === 'area' ? areaName.value || 'すべてのエリア' : String(route.query[key] || options(n.name || '')[0] || '')
  })
  for (const f of String(route.query.facility || '').split(',').filter(Boolean)) fields['facility-' + f] = 'true'
  filterOpen.value = false
}, { immediate: true })
watch(() => { const field = sample('rankings', /^エリア$/); return page.value === 'rankings' ? fields[field.id] : undefined }, value => { if (value !== undefined && !busy.value) { const area = value === 'すべてのエリア' ? undefined : String(catalog.resolveArea(value)?.id || ''); if (String(route.query.area || '') !== String(area || '')) router.replace({ query: { ...route.query, area } }) } })
watch([page, selectedShop, selectedCast, selectedPlan, missing, locale], () => { document.title = page.value === 'home' ? 'CABA NIGHT' : `${missing.value ? t(pageTitles.notFound) : selectedPlan.value?.name || selectedCast.value?.name || selectedShop.value?.name || t(pageTitles[page.value])} | CABA NIGHT` }, { immediate: true })
const tabKind = computed<Saved['type']>(() => route.query.tab === 'cast' ? 'cast' : route.query.tab === 'plan' ? 'plan' : 'shop')
function matches(item: Shop | Cast | Plan) {
  const s = item as Shop, c = item as Cast, p = item as Plan
  const q = String(route.query.q || '').normalize('NFKC').toLocaleLowerCase().trim()
  const text = [s.name, s.area, s.description, s.station, c.shop, c.profile, p.shop_name, ...(s.tags || [])].filter(Boolean).join(' ').normalize('NFKC').toLocaleLowerCase()
  if (q && !text.includes(q)) return false
  const rawArea = String(route.params.areaSlug || route.query.area || '')
  if (rawArea && !areaName.value) return false
  if (selectedArea.value) {
    const members = areaMembers.value
    if (!members || members.id !== selectedArea.value.id) return false
    if ('shop_id' in item ? 'index' in item ? !members.shops.includes(p.shop_id) : !members.casts.includes(c.id) : !members.shops.includes(s.id)) return false
  }
  const shopFilter = String(route.query.shop || '')
  if (shopFilter && ![String(s.id), s.name, String(c.shop_id), c.shop, p.shop_name].includes(shopFilter)) return false
  const price = 'index' in item ? p.price : 'price' in item ? Number(s.price?.replace(/,/g, '').match(/\d+/)?.[0]) : undefined
  const fee = String(route.query.price || '')
  if (fee && (!price || fee === '¥8,000以下' && price > 8000 || fee === '¥8,000〜¥12,000' && (price < 8000 || price > 12000) || fee === '¥12,000以上' && price < 12000)) return false
  const category = String(route.query.category || '')
  if (category && !text.includes(category.normalize('NFKC').toLocaleLowerCase())) return false
  const facilities = String(route.query.facility || '').split(',').filter(Boolean)
  if (facilities.some(f => !(s.tags || []).includes(f))) return false
  return true
}
const listKind = computed<Saved['type']>(() => page.value === 'casts' ? 'cast' : page.value === 'plans' ? 'plan' : page.value === 'favorites' ? tabKind.value : 'shop')
const list = computed(() => {
  let items: (Shop | Cast | Plan)[] = listKind.value === 'cast' ? [...catalog.casts.value] : listKind.value === 'plan' ? [...catalog.plans.value] : [...catalog.shops.value]
  if (page.value === 'favorites') return items.filter(i => site.has(listKind.value, String(i.id)))
  if (page.value === 'rankings') items = items.filter(i => (i as Shop).is_recommended)
  items = items.filter(matches)
  if (route.query.sort === 'name') items.sort((a, b) => a.name.localeCompare(b.name, 'ja'))
  return items
})
const view = computed(() => {
  const p = missing.value ? 'notFound' : page.value
  let nodes = contentNodes(p), height = number(designs[p]!.height)
  prepare(nodes, p, (a, n) => {
    if (a.to?.startsWith('/shops/') && selectedShop.value) return { to: `/shops/${selectedShop.value.id}` }
    if (a.to?.startsWith('/report')) return { to: `/report?type=${p}&id=${p === 'cast' ? selectedCast.value?.id : selectedShop.value?.id || ''}` }
    if (a.kind === 'unavailable' && /公式サイト/.test(n.name || '')) return { kind: 'website' }
    if (a.kind === 'unavailable' && /LINE/.test(n.name || '')) return { kind: 'line' }
    return a
  })
  if (['shops', 'casts', 'plans', 'favorites', 'rankings', 'area'].includes(p)) {
    nodes = removeCards(nodes)
    const k = listKind.value
    const tpl = sample(p === 'favorites' ? k === 'shop' ? 'home' : k === 'cast' ? 'casts' : 'plans' : p, k === 'cast' ? /Cast 卡片/ : k === 'plan' ? /Plan 卡片/ : /店铺卡片|搜索卡片|精选条目/)
    const cols = p === 'rankings' ? 1 : p === 'shops' || k !== 'cast' ? 3 : 4
    const y = p === 'favorites' ? 421 : number(tpl.y)
    const stepY = number(tpl.height) + (p === 'favorites' ? 80 : 24)
    const cards: DesignNode[] = grid(list.value, k, tpl, p === 'shops' ? 360 : 80, y, cols, p === 'shops' ? 340 : cols === 4 ? 326 : 435, stepY)
    nodes.push(...cards)
    const end = y + Math.max(1, Math.ceil(cards.length / cols)) * stepY
    if (p === 'favorites') {
      nodes = nodes.filter(n => n.name !== '收藏提示')
      cards.forEach((c, i) => nodes.push({ id: `remove-live-${i}`, name: '保存を解除', type: 'frame', x: c.x, y: number(c.y) + number(c.height) + 12, width: c.width, height: 40, fill: '#14263A', cornerRadius: 6, justifyContent: 'center', alignItems: 'center', live: true, action: { kind: 'remove', value: String(list.value[i]!.id) }, children: [{ id: `remove-live-text-${i}`, type: 'text', content: '保存を解除', fill: '#F6F4F0', fontSize: 14, live: true }] }))
    }
    if (p === 'area') {
      const oldEnd = 1078, delta = Math.max(0, end + 35 - oldEnd)
      lower(nodes.filter(n => !cards.includes(n)), oldEnd, delta)
      texts(nodes, { '页面标题': areaName.value, '面包屑': `HOME / エリア / ${areaName.value}`, '分区 新宿のおすすめ店舗': `${areaName.value}の店舗` })
      nodes = nodes.filter(n => !/^标签 西新宿|^标签 新宿三丁目|^标签 東新宿/.test(n.name || ''))
      nodes.filter(n => n.name === '专题首屏').forEach(n => { texts([n], { '上标': 'AREA GUIDE', '大标题': `${areaName.value}の夜を楽しむ。` }); walk(n, c => { if (c.type === 'rectangle') c.imageSrc = (list.value[0] as Shop)?.image || '' }) })
    }
    texts(nodes, { '结果说明': `${list.value.length} 件の店舗`, '筛选结果': `${list.value.length} 名のキャスト`, '排序': route.query.sort === 'name' ? '名前順 ⌄' : '掲載順 ⌄', '顺序': route.query.sort === 'name' ? '名前順 ⌄' : '掲載順 ⌄' })
    if (p === 'shops') nodes = nodes.filter(n => !/^标签 /.test(n.name || ''))
    height = Math.max(p === 'area' ? height : 1000, end + 210, ...nodes.map(n => number(n.y) + number(n.height) + 190))
  }
  if (p === 'plans') {
    const categories = [...new Set(catalog.plans.value.flatMap(plan => [plan.name, ...plan.tags]))].slice(0, 4)
    nodes.filter(n => n.name?.startsWith('切换 ') && n.name !== '切换 すべて').forEach((n, i) => { n.enabled = !!categories[i]; n.content = categories[i] || ''; n.action = { kind: 'tab', value: categories[i] } })
  }
  if (p === 'home') {
    nodes = removeCards(nodes)
    nodes.push(...grid(catalog.shops.value.slice(0, 3), 'shop', sample('home', /店铺卡片/), 80, 575, 3, 435, 376))
    nodes.push(...grid(catalog.casts.value.slice(0, 4), 'cast', sample('home', /首页 Cast/), 80, 1030, 4, 326, 220))
    nodes.forEach(n => walk(n, c => { if (c.name === '人物摄影') c.imageSrc = '/images/photos/w4SBPC.webp' }))
  }
  if (p === 'shop' && selectedShop.value) {
    const shop = selectedShop.value
    nodes = removeCards(nodes); bindShop(nodes, shop)
    height += expandText(nodes, '店铺介绍', 820, 65, 839)
    const castY = number(nodes.find(n => n.name === '分区 所属キャスト')?.y) + 59
    const casts = (shop.casts || []).filter(c => c.shop_id === shop.id)
    const castDelta = Math.max(0, Math.ceil(casts.length / 3) - 1) * 204
    lower(nodes, castY + 181, castDelta); height += castDelta
    nodes.push(...grid(casts, 'cast', sample('shop', /所属 Cast/), 80, castY, 3, 287, 204))
    if (!casts.length) nodes.push(emptySection('cast-empty', '所属キャストはまだ登録されていません。', 80, castY))
    const planY = number(nodes.find(n => n.name === '分区 プラン・料金')?.y) + 60
    const plans = catalog.plans.value.filter(plan => plan.shop_id === shop.id)
    const planDelta = Math.max(0, plans.length - 2) * 114
    lower(nodes, planY + 212, planDelta); height += planDelta
    plans.forEach((plan, i) => { const n = card('plan', plan, sample('shop', /方案行/)); n.x = 80; n.y = planY + i * 114; nodes.push(n) })
    if (!plans.length) nodes.push(emptySection('plan-empty', '公開プランはまだ登録されていません。', 80, planY))
  }
  if (p === 'cast' && selectedCast.value) {
    bindCast(nodes, selectedCast.value, selectedShop.value)
    const delta = expandText(nodes, '简介', 680, 65, 478); height += delta
    height += expandText(nodes, '资料展示', 900, 70, 1210 + delta)
  }
  if (p === 'plan' && selectedPlan.value) {
    bindPlan(nodes, selectedPlan.value)
    height += expandText(nodes, '方案介绍', 805, 70, 722)
  }
  if (p === 'areas') {
    nodes = nodes.filter(n => !isCard(n) && n.name !== '地区切换' && n.name !== '其他地区' && n.name !== 'すべての店舗を見る')
    directoryAreas.value.forEach((a, i) => {
      const n = sample('areas', /^地区 /), name = areaLabel(a)
      const tile = JSON.parse(JSON.stringify(n)) as DesignNode
      prepare([tile], p, () => ({ to: `/areas/${a.id}` }))
      tile.id = `area-${a.id}`; tile.x = 80 + i % 3 * 435; tile.y = 360 + Math.floor(i / 3) * 258
      texts([tile], { '地区名': name, '地区描述': `${catalog.shops.value.filter(s => s.area === name || s.area.startsWith(name + ' ')).length} 店舗` })
      walk(tile, c => { if (c.type === 'rectangle') c.imageSrc = catalog.shops.value.find(s => s.area === name || s.area.startsWith(name + ' '))?.image || '' })
      nodes.push(tile)
    })
    height = Math.max(1000, 570 + Math.ceil(directoryAreas.value.length / 3) * 258)
  }
  nodes.forEach(n => walk(n, c => {
    if (c.action?.kind === 'favorite') {
      const kind = p === 'cast' ? 'cast' : p === 'plan' ? 'plan' : 'shop'
      const id = String(kind === 'cast' ? selectedCast.value?.id : kind === 'plan' ? selectedPlan.value?.id : selectedShop.value?.id)
      const text = c.children?.find(x => x.type === 'text'); if (text && site.has(kind, id)) text.content = '♥ 保存済み'
    }
    c.children?.forEach((child, i) => { if (child.name === '勾选项') { const label = c.children?.[i + 1]?.content || ''; child.action = { kind: 'facility', value: label }; child.icon = fields['facility-' + label] === 'true' ? 'check' : 'square' } })
  }))
  return { nodes, height }
})
function emptySection(id: string, content: string, x: number, y: number): DesignNode { return { id, type: 'text', content, x, y, width: 820, fontSize: 16, fill: '#A7B1C0', live: true } }
const groups = computed(() => {
  const ordered = [...view.value.nodes].sort((a, b) => number(a.y) - number(b.y) || number(a.x) - number(b.x))
  const result: { y: number; nodes: DesignNode[]; cards: boolean }[] = []
  for (const n of ordered) {
    const y = number(n.y), previous = result.at(-1)
    if (previous && Math.abs(previous.y - y) <= 24 && !/分区|页面标题|面包屑/.test(n.name || '') && !previous.nodes.some(c => /分区|页面标题|面包屑/.test(c.name || ''))) { previous.nodes.push(n); previous.cards ||= isCard(n) }
    else result.push({ y, nodes: [n], cards: isCard(n) })
  }
  return result
})
const empty = computed(() => ['shops', 'casts', 'plans', 'favorites', 'rankings', 'area'].includes(page.value) && list.value.length === 0)
function search() {
  const query: Record<string, string> = {}
  walk(designs[page.value]!, n => { const value = fields[n.id]; if (value?.trim() && !/^(すべて|指定なし)/.test(value) && !n.id.startsWith('facility-')) query[fieldKey(n.name || '')] = fieldKey(n.name || '') === 'area' ? String(catalog.resolveArea(value)?.id || value) : value.trim() })
  const facilities = Object.keys(fields).filter(k => k.startsWith('facility-') && fields[k] === 'true').map(k => k.slice(9))
  if (facilities.length) query.facility = facilities.join(',')
  router.push({ path: route.path, query })
}
function act(action: Action) {
  const kind = action.kind, shop = selectedShop.value
  if (kind === 'search') return search()
  if (kind === 'reset') return void router.push({ path: route.path })
  if (kind === 'sort') return void router.replace({ query: { ...route.query, sort: route.query.sort ? undefined : 'name' } })
  if (kind === 'facility') { const key = 'facility-' + action.value; fields[key] = fields[key] === 'true' ? 'false' : 'true'; return }
  if (kind === 'remove') return site.toggle(tabKind.value, action.value!)
  if (kind === 'favorite') {
    const type = page.value === 'cast' ? 'cast' : page.value === 'plan' ? 'plan' : 'shop'
    const id = type === 'cast' ? selectedCast.value?.id : type === 'plan' ? selectedPlan.value?.id : shop?.id
    if (id !== undefined) site.toggle(type, String(id)); return
  }
  if (kind === 'tab') {
    const label = action.value || ''
    if (page.value === 'favorites') return void router.replace({ query: { tab: label === 'キャスト' ? 'cast' : label === 'プラン' ? 'plan' : 'shop' } })
    if (page.value === 'area' || page.value === 'rankings') return void router.push({ path: label === 'キャスト' ? '/casts' : label === 'プラン' ? '/plans' : '/shops', query: selectedArea.value ? { area: String(selectedArea.value.id) } : {} })
    if (page.value === 'shop') { const name = ({ '店舗紹介': '分区 上質なひとときを、あなたに。', 'キャスト': '分区 所属キャスト', 'プラン': '分区 プラン・料金', '料金・設備': '店铺概要', 'アクセス': '分区 アクセス・店舗情報' } as Record<string,string>)[label]; document.querySelector(`[data-name="${name}"]`)?.scrollIntoView({ behavior: 'smooth' }); return }
    return void router.replace({ query: { ...route.query, category: label === 'すべて' ? undefined : label } })
  }
  if (kind === 'share') return void site.copy(location.href)
  if (kind === 'copy') return void site.copy(`「${shop?.name || ''}」の「${selectedPlan.value?.name || ''}」について問い合わせ\n${location.href}`)
  if (kind === 'map') { if (shop?.address) window.open('https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(shop.address), '_blank', 'noopener,noreferrer'); else site.inform('住所はまだ登録されていません。'); return }
  if (kind === 'website' || kind === 'line') { const url = externalUrl(kind === 'website' ? shop?.website : shop?.line_url); if (url) window.open(url, '_blank', 'noopener,noreferrer'); else site.unavailable(); return }
  if (['phone', 'social', 'plan', 'contact', 'gallery'].includes(kind || '')) site.modal.value = kind as typeof site.modal.value
}
provide<PageController>('page', { page, fields, options, act })
</script>
<template>
  <div :class="['page-viewport', 'live-catalog', 'page-' + page]" :style="{ '--page-height': view.height + 'px' }">
    <div class="design-stage" :style="{ height: view.height + 'px' }">
      <SiteHeader />
      <main id="main-content" class="scene-content" :aria-label="pageTitles[page]" :aria-busy="busy">
        <section v-if="busy || error" class="catalog-status" :role="error ? 'alert' : 'status'"><h1>{{ t(busy ? '読み込み中…' : '情報を取得できません') }}</h1><p v-if="error">{{ t(error) }}</p><button v-if="error" class="primary-button" @click="load">{{ t('再読み込み') }}</button></section>
        <template v-else>
          <nav v-if="page === 'areas'" class="area-directory-controls" :aria-label="t('都道府県からエリアを選択')">
            <RouterLink :to="{ path: '/areas' }" :class="{ active: !route.query.prefecture }">{{ t('すべて') }}</RouterLink>
            <RouterLink v-for="area in catalog.areaTree.value" :key="area.id" :to="{ path: '/areas', query: { prefecture: String(area.id) } }" :class="{ active: route.query.prefecture === String(area.id) }">{{ area.name }}</RouterLink>
          </nav>
          <p v-if="page === 'areas' && !directoryAreas.length" class="area-directory-empty" role="status">{{ t('公開中のエリアはまだありません。') }}</p>
          <button v-if="['shops', 'casts', 'plans'].includes(page)" class="mobile-filter-toggle" :aria-expanded="filterOpen" @click="filterOpen = !filterOpen"><SiteIcon name="search" :size="18" />{{ t('検索条件を変更') }}</button>
          <div v-for="(group, i) in groups" :key="i" :class="['mobile-row', { 'card-row': group.cards, 'filter-is-open': filterOpen }]">
            <DesignNodeView v-for="node in group.nodes" :key="node.id" :node="node" :context="[node.id]" top />
          </div>
          <section v-if="empty && !missing" class="empty-state catalog-empty" :class="{ 'search-empty': page === 'shops' }" role="status"><SiteIcon name="search" :size="40" /><h2>{{ t(page === 'favorites' ? '保存した情報はまだありません' : '条件に合う情報がありません') }}</h2><p>{{ t('条件を変えて、店舗・キャスト・プランを探してみてください。') }}</p><RouterLink v-if="page === 'favorites'" to="/shops" class="primary-button">{{ t('店舗を探す') }}</RouterLink><button v-else class="primary-button" @click="act({ kind: 'reset' })">{{ t('条件をリセット') }}</button></section>
        </template>
      </main>
      <SiteFooter :style="{ top: view.height - 156 + 'px' }" />
    </div>
    <div v-if="!busy && !error && !missing && ['shop', 'plan'].includes(page)" class="mobile-contact-bar"><span>{{ selectedShop?.name }}<small>{{ t(selectedPlan && planExpired(selectedPlan) ? '掲載期間終了 · 条件は店舗へ' : '店舗へ直接お問い合わせ') }}</small></span><button class="primary-button" @click="site.modal.value = page === 'plan' ? 'plan' : 'contact'">{{ t('店舗に問い合わせ') }}</button></div>
  </div>
</template>
