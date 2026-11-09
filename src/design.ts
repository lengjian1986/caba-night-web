import type { CSSProperties } from 'vue'
import source from './designs.json'

export interface DesignNode {
  imageSrc?: string; live?: boolean
  action?: { to?: string; kind?: string; value?: string; disabled?: boolean }
  id: string; type: string; name?: string; content?: string; enabled?: boolean
  x?: number; y?: number; width?: number | string; height?: number | string
  fill?: string | { type: string; url?: string; transform?: number[] }
  stroke?: string; strokeWidth?: number | Record<string, number>
  cornerRadius?: number; fontFamily?: string; fontSize?: number; fontWeight?: string
  lineHeight?: number; textGrowth?: string; textAlign?: string; icon?: string
  layout?: string; justifyContent?: string; alignItems?: string; clip?: boolean
  ref?: string; children?: DesignNode[]
}
export const designs = source as unknown as Record<string, DesignNode>
export const nav = [['エリア', '/areas'], ['店舗', '/shops'], ['キャスト', '/casts'], ['プラン', '/plans'], ['特集', '/features'], ['ご利用ガイド', '/guide']]
export const footerLinks = [['運営について', '/about'], ['お問い合わせ', '/contact'], ['掲載をご希望の方', '/for-business'], ['利用規約', '/legal/terms'], ['プライバシー', '/legal/privacy']]
export const shops = ['CLUB LUXE', 'RÉVE TOKYO', 'NIGHT GARDEN', 'CLUB BELLE', 'Salon de R', 'Lounge Nocturne']
export const castNames = ['桜 りな', '美月 あい', '七瀬 みお', '橘 ゆい', '一ノ瀬 はな', '白石 さき', '水瀬 るな', '星野 えま']
export const planNames = ['スタンダードプラン', 'VIP・個室プラン', '初めての方へ', 'ゆったり90分プラン', 'グループ向けプラン', 'ラウンジプラン']
export const areas = ['新宿・歌舞伎町', '六本木', '銀座', '池袋', '恵比寿', '上野']
export const shopIds = ['club-luxe', 'reve-tokyo', 'night-garden', 'club-belle', 'salon-de-r', 'lounge-nocturne']
export const castIds = ['rina-sakura', 'ai-mizuki', 'mio-nanase', 'yui-tachibana', 'hana-ichinose', 'saki-shiraishi', 'runa-minase', 'ema-hoshino']
export const planIds = ['standard', 'vip', 'first-visit', 'relax-90', 'group', 'lounge']
export const areaIds = ['shinjuku', 'roppongi', 'ginza', 'ikebukuro', 'ebisu', 'ueno']
export const pageTitles: Record<string, string> = { home: 'CABA NIGHT', shops: '店舗を探す', shop: '店舗情報', casts: 'キャスト', cast: 'キャスト紹介', plans: 'プラン', plan: 'プラン詳細', areas: 'エリア', area: 'エリアガイド', favorites: 'お気に入り', events: 'イベント', event: 'イベント詳細', offers: '店舗のご案内', offer: 'ご案内の詳細', features: '特集', feature: '特集記事', rankings: '編集部ピックアップ', guide: 'ご利用ガイド', help: 'よくある質問', contact: 'お問い合わせ', report: '情報の修正', about: '運営について', business: '掲載をご希望の方', terms: '利用規約', privacy: 'プライバシーポリシー', notFound: 'ページが見つかりません' }
export function number(v: unknown) { return typeof v === 'number' ? v : 0 }
export function isCard(n: DesignNode) { return /^(店铺卡片|搜索卡片|Cast 卡片|Plan 卡片|首页 Cast|所属 Cast|地区 |活动 |优惠 |专题 |精选条目)/.test(n.name || '') && n.type === 'frame' }
export function isField(n: DesignNode) { return n.children?.some(c => c.name === '展开') || false }
export function isButton(n: DesignNode) { return n.type === 'frame' && n.justifyContent === 'center' && n.alignItems === 'center' && n.children?.some(c => c.type === 'text') }
export function isLine(n: DesignNode) { return number(n.height) <= 1 && n.type === 'frame' }
export function nodeStyle(n: DesignNode, inFlex = false): CSSProperties {
  const s: CSSProperties = { position: inFlex ? 'relative' : 'absolute', left: inFlex ? undefined : number(n.x) + 'px', top: inFlex ? undefined : number(n.y) + 'px', boxSizing: 'border-box' }
  if (typeof n.width === 'number') s.width = n.width + 'px'
  if (typeof n.height === 'number' && n.type !== 'text') s.height = n.height + 'px'
  if (n.type === 'text') {
    Object.assign(s, { color: n.fill, fontFamily: n.fontFamily?.includes('Serif') ? 'var(--serif)' : 'var(--sans)', fontSize: (n.fontSize || 16) + 'px', fontWeight: n.fontWeight || '400', lineHeight: n.lineHeight || 1.5, whiteSpace: n.textGrowth?.startsWith('fixed') ? 'pre-wrap' : 'pre', textAlign: n.textAlign || 'left' })
  } else {
    if (typeof n.fill === 'string') s.background = n.fill
    if (n.cornerRadius) s.borderRadius = n.cornerRadius + 'px'
    if (n.stroke) { s.borderStyle = 'solid'; s.borderColor = n.stroke; const w = n.strokeWidth; s.borderWidth = typeof w === 'number' ? w + 'px' : `${w?.top || 0}px ${w?.right || 0}px ${w?.bottom || 0}px ${w?.left || 0}px` }
    if (n.clip || n.type === 'rectangle') s.overflow = 'hidden'
    if (n.justifyContent || n.layout === 'horizontal') Object.assign(s, { display: 'flex', alignItems: n.alignItems || 'start', justifyContent: n.justifyContent || 'start' })
    if (n.icon) { s.background = 'transparent'; s.color = typeof n.fill === 'string' ? n.fill : '#DFC18B' }
  }
  return s
}
export function fieldOptions(label: string): string[] {
  if (label.includes('エリア')) return ['すべてのエリア', ...areas]
  if (label.includes('店舗') && !label.includes('タイプ')) return ['すべての店舗', ...shops]
  if (label.includes('タイプ') && !label.includes('プラン')) return ['すべてのタイプ', 'キャバクラ', 'ラウンジ']
  if (label.includes('料金')) return ['指定なし', '¥8,000以下', '¥8,000〜¥12,000', '¥12,000以上']
  return ['すべてのプラン', 'スタンダード', '初回来店', 'VIP・個室', 'グループ']
}
export function entity(context: string[], type: 'shop' | 'cast' | 'plan' = 'shop') {
  const names = type === 'cast' ? castNames : type === 'plan' ? planNames : shops
  const ids = type === 'cast' ? castIds : type === 'plan' ? planIds : shopIds
  const match = names.findIndex(s => context.some(c => c.includes(s)))
  return ids[Math.max(0, match)]!
}
export function cardEntity(n: DesignNode): { type: 'shop' | 'cast' | 'plan'; id: string } | undefined {
  if (/Cast|キャスト/.test(n.name || '')) return { type: 'cast', id: entity([n.name || ''], 'cast') }
  if (/Plan|方案行/.test(n.name || '')) return { type: 'plan', id: entity([n.name || ''], 'plan') }
  if (/店铺卡片|搜索卡片|精选条目/.test(n.name || '')) return { type: 'shop', id: entity([n.name || '']) }
}
