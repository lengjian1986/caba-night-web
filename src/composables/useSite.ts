import { ref } from 'vue'
export type Saved = { type: 'shop' | 'cast' | 'plan'; id: string }
function readSaved(): Saved[] {
  try { const v: unknown = JSON.parse(localStorage.getItem('caba-favorites') || '[]'); return Array.isArray(v) ? v.filter((x): x is Saved => !!x && typeof x === 'object' && ['shop', 'cast', 'plan'].includes(x.type) && typeof x.id === 'string') : [] } catch { return [] }
}
const saved = ref<Saved[]>(readSaved())
const toast = ref('')
const modal = ref<'' | 'contact' | 'phone' | 'social' | 'plan' | 'gallery'>('')
const notice = ref('')
let timer: ReturnType<typeof setTimeout>
export function useSite() {
  function inform(s: string) { toast.value = s; clearTimeout(timer); timer = setTimeout(() => toast.value = '', 3400) }
  function has(type: Saved['type'], id: string) { return saved.value.some(s => s.type === type && s.id === id) }
  function toggle(type: Saved['type'], id: string) {
    const found = has(type, id)
    saved.value = found ? saved.value.filter(s => s.type !== type || s.id !== id) : [...saved.value, { type, id }]
    try { localStorage.setItem('caba-favorites', JSON.stringify(saved.value)); inform(found ? 'お気に入りから解除しました' : 'お気に入りに保存しました') } catch { inform('このブラウザでは保存できませんでした') }
  }
  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); inform('コピーしました') } catch { notice.value = text; inform('コピーできませんでした。表示された内容を選択してコピーしてください。') }
  }
  function unavailable() { inform('店舗の公開連絡先は、まだ登録されていません。') }
  return { saved, toast, modal, notice, has, toggle, inform, copy, unavailable }
}
