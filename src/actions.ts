import { entity, areaIds, areas, type DesignNode, isButton } from './design'
export type Action = { to?: string; kind?: string; value?: string; disabled?: boolean }
export function actionFor(n: DesignNode, context: string[], page: string): Action | undefined {
  if (n.action) return n.action
  if (n.live) return
  if (n.type === 'text' && n.name?.endsWith('文字')) return
  if (/^remove-(?!text-)/.test(n.id)) return { kind: 'favorite', value: n.id }
  const name = n.name || '', text = n.content || name, all = [...context, name], ctx = all.join('|')
  const button = isButton(n)
  if (n.type === 'frame' && !button) return
  if (n.type === 'text' && context.at(-1) === text && !/[→↗]/.test(text)) return
  if (/^[‹›…1-8]$/.test(name) && button) return { kind: 'page', value: name, disabled: name !== '1' }
  if (/保存を解除/.test(text) || /お気に入りに保存|♡ お気に入り/.test(text)) return { kind: 'favorite', value: ctx }
  if (/情報の修正|修正を依頼|修正へ/.test(text)) return { to: '/report?type=shop&id=' + entity(all) }
  if (/共有|シェア/.test(text)) return { kind: 'share' }
  if (/コピー/.test(text)) return { kind: 'copy', value: /プラン|文章/.test(text) ? 'plan' : 'report' }
  if (/すべての写真|相册/.test(text) && button) return { kind: 'gallery' }
  if (/電話番号|電話で/.test(text) && button) return { kind: 'phone' }
  if (/LINEで|LINEを|公式サイト/.test(text) && button) return { kind: 'unavailable' }
  if (/Instagram|TikTok|^X ↗/.test(text) && button) return { kind: 'social' }
  if (/メール窓口|運営窓口/.test(text) && button) return { kind: 'platform' }
  if (/問い合わせ|お問い合わせ/.test(text) && button) {
    if (page === 'business' || /運営|掲載について|メール窓口|運営窓口|連絡/.test(text)) return { to: '/contact' }
    return { kind: page === 'plan' ? 'plan' : 'contact' }
  }
  if (/地図・アクセス/.test(text) && button) return { kind: 'map' }
  if (/掲載のご案内/.test(text)) return { to: '/for-business' }
  if (/よくある質問/.test(text) && (button || /→/.test(text))) return { to: '/help' }
  if (/ご利用ガイド/.test(text) && button) return { to: '/guide' }
  if (/この条件で検索|キャストを探す|^検索する$/.test(name) && button) return { kind: 'search' }
  if (/条件をクリア/.test(text)) return { kind: 'reset' }
  if (name.startsWith('勾选项 ') || name.startsWith('设施 ')) return { kind: 'facility', value: name.replace(/^(勾选项|设施) /, '') }
  if (/表示順|掲載順/.test(text)) return { kind: 'sort' }
  if (/ほかのエリア|すべての店舗|エリアから店舗|店舗を探す|お店を探して/.test(text) && button) return { to: '/shops' }
  if (/ホームに戻る/.test(text)) return { to: '/' }
  if (/所属店舗を見る|店舗の詳細|店舗詳細を見る|店舗情報へ戻る/.test(text) && (button || /→|←/.test(text))) return { to: '/shops/' + entity(all) }
  if (/キャスト一覧/.test(text)) return { to: '/casts' }
  if (/标签 /.test(name) && n.type === 'text') return
  if (name.startsWith('切换 ')) return { kind: 'tab', value: text }
  if (/^地区 /.test(context.at(-1) || '') && (name === '地区名' || name === '地区箭头' || n.type === 'rectangle')) {
    const i = areas.findIndex(a => ctx.includes(a)); return { to: '/areas/' + areaIds[Math.max(0, i)] }
  }
  if (/地区标签/.test(name) && page === 'area') return { to: '/shops?area=shinjuku' }
  if (/Cast 卡片|首页 Cast|所属 Cast/.test(ctx) && /展示名|名字|查看社媒|社媒入口|Cast 肖像|肖像/.test(name)) return { to: '/casts/' + entity(all, 'cast') }
  if (/Plan 卡片|方案行/.test(ctx) && /查看方案|方案名|方案名称|詳細を見る|方案照片/.test(name)) return { to: '/shops/club-luxe/plans/' + entity(all, 'plan') }
  if (/店铺卡片|搜索卡片|精选条目/.test(ctx) && /店名|精选店名|店内照片|照片|詳細を見る|店舗詳細/.test(name)) return { to: '/shops/' + entity(all) }
  if (/活动 /.test(ctx) && /活动标题|活动入口|活动摄影/.test(name) || /イベント詳細を見る/.test(text)) return { to: '/events/luxe-night' }
  if (/优惠 /.test(ctx) && /优惠标题|优惠详情|优惠标识/.test(name)) return { to: '/offers/first-visit' }
  if (/专题 /.test(ctx) && /专题标题|专题入口|专题摄影/.test(name) || /特集を読む/.test(text)) return { to: '/features/first-visit-guide' }
  if (/イベント一覧へ/.test(text)) return { to: '/events' }
  if (/精选说明|编辑推荐说明/.test(name)) return { to: '/rankings' }
  if (/步骤链接/.test(name)) return { to: text.includes('店舗一覧') ? '/shops' : text.includes('キャスト') ? '/casts' : '/help' }
  return
}
