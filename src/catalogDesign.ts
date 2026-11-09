import { actionFor, type Action } from './actions'
import { designs, isCard, number, type DesignNode } from './design'
import { imageUrl, planExpired, readableTags, yen, type Cast, type Plan, type Shop } from './api/catalog'
export const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v))
export function walk(n: DesignNode, fn: (n: DesignNode) => void) { fn(n); n.children?.forEach(c => walk(c, fn)) }
export function contentNodes(page: string) { return clone(designs[page]!.children || []).filter(n => !n.ref && !/共用 PC 导航|共用页脚/.test(n.name || '')) }
export function prepare(nodes: DesignNode[], page: string, map: (a: Action, n: DesignNode) => Action | undefined = a => a) {
  const visit = (n: DesignNode, context: string[]) => {
    const action = actionFor(n, context, page)
    if (action) n.action = map(action, n)
    n.live = true
    n.children?.forEach(c => visit(c, [...context, n.name || '']))
  }
  nodes.forEach(n => visit(n, [n.id]))
}
export function texts(nodes: DesignNode[], values: Record<string, string>) {
  nodes.forEach(n => walk(n, c => { if (c.type === 'text' && c.name && c.name in values) c.content = values[c.name]! }))
}
export function picture(n: DesignNode, src: string) { n.fill = { type: 'image' }; n.imageSrc = imageUrl(src); n.live = true }
export function card(kind: 'shop' | 'cast' | 'plan', item: Shop | Cast | Plan, sample: DesignNode): DesignNode {
  const n = clone(sample), s = item as Shop, c = item as Cast, p = item as Plan
  const href = kind === 'shop' ? `/shops/${s.id}` : kind === 'cast' ? `/casts/${c.id}` : `/shops/${p.shop_id}/plans/${p.id}`
  prepare([n], kind, a => a.to ? { to: href } : undefined)
  n.id = `live-${kind}-${item.id}`
  n.name = `${kind === 'cast' ? sample.name?.startsWith('首页 Cast') ? '首页 Cast' : sample.name?.startsWith('所属 Cast') ? '所属 Cast' : 'Cast 卡片' : kind === 'plan' ? sample.name?.startsWith('方案行') ? '方案行' : 'Plan 卡片' : sample.name?.startsWith('精选条目') ? '精选条目' : sample.name?.startsWith('搜索卡片') ? '搜索卡片' : '店铺卡片'} ${kind === 'plan' ? p.name : s.name}`
  const price = kind === 'plan' ? yen(p.price) : s.price || '料金は店舗へ'
  texts([n], kind === 'shop' ? { '店名': s.name, '精选店名': s.name, '地区类型': s.area, '地区': s.area, '参考费用': price, '费用': price, '精选理由': s.description || '店舗の詳細をご覧ください。', '上标': s.is_recommended ? 'PICK UP' : 'SHOP' }
    : kind === 'cast' ? { '展示名': c.name, '名字': c.name, '所属店铺': `${c.shop} · ${c.area}`, '店铺': `${c.shop}\n${c.area}`, '社媒入口': 'プロフィールを見る →', '查看社媒': 'プロフィールを見る →' }
    : { '方案名称': p.name, '方案名': p.name, '所属店铺': `${p.shop_name} · ${p.area}`, '参考费用': price, '方案费用': price, '费用说明': planExpired(p) ? '掲載期間終了 · 条件は店舗へ' : '参考料金 · 詳細条件は店舗へ' })
  walk(n, child => { if (child.type === 'rectangle' && typeof child.fill === 'object') picture(child, item.image) })
  return n
}
export function grid(items: (Shop | Cast | Plan)[], kind: 'shop' | 'cast' | 'plan', sample: DesignNode, x: number, y: number, columns: number, stepX: number, stepY: number) {
  return items.map((item, i) => Object.assign(card(kind, item, sample), { x: x + i % columns * stepX, y: y + Math.floor(i / columns) * stepY }))
}
export function sample(page: string, pattern: RegExp) {
  const node = clone(designs[page]!.children!.find(n => pattern.test(n.name || ''))!)
  if (/^Cast 卡片/.test(node.name || '')) {
    const photo = node.children?.find(n => n.name === 'Cast 肖像')
    if (photo) {
      const height = Math.round(number(node.width) * 4 / 3)
      const delta = height - number(photo.height)
      photo.height = height
      node.height = number(node.height) + delta
      node.children?.filter(n => n !== photo).forEach(n => { n.y = number(n.y) + delta })
    }
  }
  return node
}
export function removeCards(nodes: DesignNode[]) { return nodes.filter(n => !isCard(n) && !/^方案行|^保存を解除$|^[‹›…1-8]$/.test(n.name || '')) }
export function lower(nodes: DesignNode[], from: number, amount: number) { nodes.forEach(n => { if (number(n.y) >= from) n.y = number(n.y) + amount }) }
export function expandText(nodes: DesignNode[], name: string, width: number, minimum: number, nextY: number) {
  const n = nodes.find(n => n.name === name)
  if (!n?.content) return 0
  const font = n.fontSize || 16
  const lines = n.content.split('\n').reduce((sum, s) => sum + Math.max(1, Math.ceil(s.length * font / width)), 0)
  const height = lines * font * (n.lineHeight || 1.5)
  const delta = Math.max(0, height - minimum)
  n.width = width; n.textGrowth = 'fixed-width'; n.height = undefined
  lower(nodes, nextY, delta)
  return delta
}
export function bindShop(nodes: DesignNode[], s: Shop) {
  texts(nodes, { '店名': s.name, '地区与类型': s.area, '店铺介绍': s.description || '店舗紹介はまだ登録されていません。', '参考料金值': s.price || '店舗へお問い合わせ', '営業時間值': s.business_hours || '店舗へお問い合わせ', 'アクセス值': s.station || '店舗へお問い合わせ', '到店信息': [s.address, s.station].filter(Boolean).join('\n') || '住所はまだ登録されていません。', '资料更新时间': '店舗の登録情報を掲載しています。', '面包屑': `HOME / 店舗 / ${s.area} / ${s.name}` })
  const images = s.shop_images.length ? s.shop_images : [s.image]
  nodes.filter(n => n.type === 'rectangle').forEach((n, i) => picture(n, images[i % images.length] || ''))
}
export function bindCast(nodes: DesignNode[], c: Cast, s?: Shop) {
  texts(nodes, { '展示名': c.name, '英文展示名': '', '所属地区': c.area, '简介': c.profile || 'プロフィールはまだ登録されていません。', '所属店名': s?.name || c.shop, '资料展示': [c.age ? `年齢　${c.age}歳` : '', c.height ? `身長　${c.height}cm` : '', c.style && `スタイル　${c.style}`, c.hobby && `趣味　${c.hobby}`, c.attendance_frequency && `出勤　${c.attendance_frequency}`, c.status && `出勤状況　${c.status}`].filter(Boolean).join('\n') || '公開プロフィールはまだ登録されていません。', '面包屑': `HOME / キャスト / ${c.name}`, '公开账号说明': '公開SNSが未登録の場合は、所属店舗へお問い合わせください。' })
  nodes.forEach(n => { if (/^标签 /.test(n.name || '')) { const index = nodes.filter(x => /^标签 /.test(x.name || '')).indexOf(n); const tag = c.tags[index]; n.enabled = !!tag; texts([n], { '标签文字': tag || '' }) } })
  nodes.filter(n => n.name === '个人主图').forEach(n => picture(n, c.image))
  nodes.filter(n => /^个人相册/.test(n.name || '')).forEach((n, i) => { const url = c.gallery_images[i]; n.enabled = !!url; if (url) picture(n, url) })
}
export function bindPlan(nodes: DesignNode[], p: Plan) {
  texts(nodes, { '方案标题': p.name, '所属店铺': `${p.shop_name} · ${p.area}`, '参考费用': yen(p.price), '价格单位': '参考料金 · 条件は店舗へご確認ください', '方案介绍': p.description || 'プランの詳細は店舗へお問い合わせください。', '商家名称': p.shop_name, '更新时间': '店舗の登録情報を掲載しています。', '面包屑': `HOME / プラン / ${p.shop_name} / ${p.name}` })
  const photo = nodes.find(n => n.name === '方案首屏照片'); if (photo) picture(photo, p.image)
  const tag = nodes.find(n => n.name?.startsWith('标签 ')); if (tag) texts([tag], { '标签文字': planExpired(p) ? '掲載期間終了' : readableTags(p.tags)[0] || '店舗プラン' })
  const conditions = nodes.find(n => n.name === '方案条件明细')
  if (conditions) {
    const labels = ['料金', '対象人数', '対象キャスト', '掲載期間', '割引条件']
    const values = [yen(p.price), p.max_people ? `最大${p.max_people}名` : '店舗へお問い合わせ', p.cast_names?.join('・') || '店舗へお問い合わせ', p.limit_type === 'date_range' ? `${p.valid_range?.join(' 〜 ') || '店舗へお問い合わせ'}${planExpired(p) ? '（掲載期間終了）' : ''}` : p.usage_limit ? `利用上限 ${p.usage_limit}回` : '店舗へお問い合わせ', `${p.discount_type === 'percent' ? p.discount_value + '%OFF' : p.discount_type === 'amount' ? yen(p.discount_value) + ' OFF' : '割引なし'} · 適用可否は店舗へ`]
    let label = 0, value = 0
    walk(conditions, n => { if (n.name?.startsWith('条件 ')) n.content = labels[label++] || ''; if (n.name === '条件值') n.content = values[value++] || '' })
  }
}
