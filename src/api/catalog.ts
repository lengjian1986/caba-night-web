import { computed, ref } from 'vue'

export const apiOrigin = (import.meta.env.VITE_API_ORIGIN || 'https://98.81.182.132.sslip.io').replace(/\/$/, '')
export interface PackageSet {
  name: string; description: string; image: string; price: number; status: string
  discount_type: string; discount_value: number; limit_type: string; valid_range: string[]
  usage_limit: number; max_people: number; cast_names: string[]; tags: string[]; is_recommended: boolean
}
export interface Shop {
  id: number; name: string; kana?: string; area: string; description: string; address: string
  station: string; business_hours: string; price: string; price_range?: string; image: string
  shop_images: string[]; package_sets: PackageSet[]; tags: string[]; is_recommended: number
  phone?: string; email?: string; website?: string; line_url?: string; casts?: Cast[]
}
export interface Cast {
  id: number; shop_id: number; name: string; shop: string; area: string; image: string
  gallery_images: string[]; profile: string; tags: string[]; age: number; height: number
  style: string; hobby: string; birthplace: string; blood_type: string; attendance_frequency: string
  status: string; instagram_url?: string; x_url?: string; tiktok_url?: string
}
export interface Plan extends PackageSet { id: string; shop_id: number; shop_name: string; area: string; index: number }
export interface Area { id: number; name: string; prefecture: string; city: string; parent_id?: number; level?: number; children?: Area[] }
export interface AreaOption extends Area { label: string }
export function areaLabel(area: Area) { return [...new Set([area.prefecture, area.city, area.name].filter(Boolean))].join(' ') }
export interface Catalog { shops: Shop[]; casts: Cast[]; areas: Area[]; area_tree?: Area[]; plans: unknown[] }
export function imageUrl(value: string | undefined): string {
  if (!value) return ''
  try { const url = new URL(value.replace(/^uploads\//, '/uploads/'), apiOrigin + '/'); return /^https?:$/.test(url.protocol) ? url.href : '' } catch { return '' }
}
export function externalUrl(value: string | undefined): string {
  if (!value) return ''
  try { const url = new URL(value); return /^https?:$/.test(url.protocol) ? url.href : '' } catch { return '' }
}
async function get<T>(path: string): Promise<T> {
  const response = await fetch(apiOrigin + '/api/cabakura_home/' + path, { signal: AbortSignal.timeout(15000), credentials: 'omit' })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const result = await response.json()
  if (result.code !== 1 || !result.data || typeof result.data !== 'object') throw new Error('Invalid API response')
  return result.data as T
}
function normalizeCast(c: Cast): Cast { return { ...c, image: imageUrl(c.image), gallery_images: (c.gallery_images || []).map(imageUrl), tags: readableTags(c.tags) } }
export function readableTags(tags: string[] = []) { return tags.filter(t => t && !/^option_/.test(t)) }
function normalizeShop(s: Shop): Shop {
  return { ...s, price: s.price_range || s.price || '', image: imageUrl(s.image || s.shop_images?.[0]), shop_images: (s.shop_images || []).map(imageUrl), package_sets: Array.isArray(s.package_sets) ? s.package_sets : [], tags: readableTags(s.tags), ...(s.casts ? { casts: s.casts.map(normalizeCast) } : {}) }
}
const data = ref<Catalog>({ shops: [], casts: [], plans: [], areas: [] })
const details = ref<Record<string, Shop>>({})
let pending: Promise<void> | undefined
async function refresh() {
  if (!pending) pending = (async () => {
    const next = await get<Catalog>('index?strict_search=1&area_tree=1')
    if (!Array.isArray(next.shops) || !Array.isArray(next.casts) || !Array.isArray(next.areas)) throw new Error('Invalid catalog')
    data.value = { ...next, shops: next.shops.map(normalizeShop), casts: next.casts.map(normalizeCast) }
    details.value = {}
  })().finally(() => { pending = undefined })
  return pending
}
async function loadShop(id: string) {
  const value = await get<Shop>(`detail?shop_id=${encodeURIComponent(id)}`)
  if (!value.id) return undefined
  const base = data.value.shops.find(s => s.id === value.id)
  const shop = normalizeShop({ ...base, ...value } as Shop)
  details.value = { ...details.value, [id]: shop }
  return shop
}
const shops = computed(() => data.value.shops.map(s => details.value[s.id] || s))
const casts = computed(() => {
  const map = new Map(data.value.casts.map(c => [c.id, c]))
  Object.values(details.value).forEach(s => s.casts?.forEach(c => map.set(c.id, { ...map.get(c.id), ...c })))
  return [...map.values()]
})
export function shopPlans(shop: Shop): Plan[] {
  return shop.package_sets.flatMap((p, index) => p.name && p.status !== 'private' ? [{ ...p, image: imageUrl(p.image) || shop.image, tags: readableTags(p.tags), id: `${shop.id}-${index}`, shop_id: shop.id, shop_name: shop.name, area: shop.area, index }] : [])
}
const plans = computed(() => shops.value.flatMap(shopPlans))
const areaTree = computed(() => data.value.area_tree || [])
const areaOptions = computed<AreaOption[]>(() => {
  const result: AreaOption[] = []
  const visit = (area: Area) => { result.push({ ...area, label: areaLabel(area) }); area.children?.forEach(visit) }
  ;(areaTree.value.length ? areaTree.value : data.value.areas).forEach(visit)
  return result
})
function resolveArea(value: string) {
  const alias: Record<string, string> = { shinjuku: '新宿区', roppongi: '港区', ginza: '中央区', ikebukuro: '豊島区', ebisu: '渋谷区', ueno: '台東区' }
  return areaOptions.value.find(a => String(a.id) === value || a.label === value || a.name === alias[value])
}
async function loadArea(id: number) {
  const area = resolveArea(String(id))
  if (!area) throw new Error('Unknown area')
  // The existing API filters by the registered area name, rather than its ID.
  const selection = area.level === 1 ? area.name : [area.prefecture, area.name].filter(Boolean).join(' ')
  return get<Catalog>(`index?strict_search=1&area=${encodeURIComponent(selection)}`)
}
export const yen = (n: number) => n > 0 ? `¥${n.toLocaleString('ja-JP')}` : '店舗へお問い合わせ'
export function planExpired(p: Plan) { return p.limit_type === 'date_range' && !!p.valid_range?.[1] && p.valid_range[1] < new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date()) }
export function useCatalog() { return { data, shops, casts, plans, areaTree, areaOptions, resolveArea, loadArea, refresh, loadShop } }
