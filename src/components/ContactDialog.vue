<script setup lang="ts">
import { locale, t } from '../i18n'
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { externalUrl, useCatalog } from '../api/catalog'
import { useSite } from '../composables/useSite'
import SiteIcon from './SiteIcon.vue'
const catalog = useCatalog()
const route = useRoute(), site = useSite(), dialog = ref<HTMLElement>()
const { modal } = site
let lastFocus: HTMLElement | null = null
const castRecord = computed(() => catalog.casts.value.find(c => String(c.id) === route.params.castId))
const shopRecord = computed(() => catalog.shops.value.find(s => String(s.id) === String(route.params.shopId || castRecord.value?.shop_id)))
const planRecord = computed(() => catalog.plans.value.find(p => p.id === route.params.planId && String(p.shop_id) === route.params.shopId))
const shop = computed(() => shopRecord.value?.name || '店舗')
const cast = computed(() => castRecord.value?.name || 'キャスト')
const plan = computed(() => planRecord.value?.name || 'プラン')
const phone = computed(() => shopRecord.value?.phone || '')
const telephone = computed(() => phone.value.replace(/[^+0-9]/g, ''))
const website = computed(() => externalUrl(shopRecord.value?.website))
const line = computed(() => externalUrl(shopRecord.value?.line_url))
const socials = computed(() => [
  { name: 'Instagram', url: externalUrl(castRecord.value?.instagram_url) },
  { name: 'X', url: externalUrl(castRecord.value?.x_url) },
  { name: 'TikTok', url: externalUrl(castRecord.value?.tiktok_url) },
].filter(s => s.url))
const message = computed(() => {
  const url = `${location.origin}${route.path}`
  if (locale.value === 'zh') return `我看到了「${shop.value}」的「${plan.value}」，想咨询使用条件和价格。\n${url}`
  if (locale.value === 'en') return `I saw the “${plan.value}” plan at “${shop.value}”. Could you share the conditions and prices?\n${url}`
  return `「${shop.value}」の「${plan.value}」を見ました。\n利用条件や料金について教えていただけますか？\n${url}`
})
const title = computed(() => modal.value === 'phone' ? '店舗に電話で問い合わせ' : modal.value === 'social' ? `${cast.value} の公開SNS` : modal.value === 'plan' ? 'このプランについて問い合わせ' : modal.value === 'gallery' ? 'フォトギャラリー' : `${shop.value} に問い合わせ`)
const gallery = computed(() => [...new Set(castRecord.value ? [castRecord.value.image, ...castRecord.value.gallery_images] : shopRecord.value ? [shopRecord.value.image, ...shopRecord.value.shop_images] : [])].filter(Boolean))
function close() { modal.value = '' }
function keys(e: KeyboardEvent) {
  if (!modal.value) return
  if (e.key === 'Escape') close()
  if (e.key === 'Tab') {
    const items = dialog.value?.querySelectorAll<HTMLElement>('button, a[href], textarea')
    const first = items?.[0], last = items?.[items.length - 1]
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus() }
    if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus() }
  }
}
watch(modal, async value => {
  if (value) { lastFocus = document.activeElement as HTMLElement; document.body.style.overflow = 'hidden'; await nextTick(); dialog.value?.querySelector<HTMLElement>('button')?.focus(); document.addEventListener('keydown', keys) }
  else { document.body.style.overflow = ''; document.removeEventListener('keydown', keys); lastFocus?.focus() }
})
watch(() => route.fullPath, close)
onUnmounted(() => { document.body.style.overflow = ''; document.removeEventListener('keydown', keys) })
</script>
<template><Teleport to="body"><Transition name="dialog"><div v-if="modal" class="modal-backdrop" @click.self="close"><section ref="dialog" :class="['contact-dialog', { 'gallery-dialog': modal === 'gallery' }]" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button class="dialog-close" :aria-label="t('閉じる')" @click="close"><SiteIcon name="x" /></button><h2 id="dialog-title">{{ t(title) }}</h2>
  <template v-if="modal === 'contact'"><p>{{ t('ご希望の窓口から、店舗へ直接ご連絡ください。') }}</p><div class="dialog-actions"><a v-if="line" :href="line" target="_blank" rel="noopener noreferrer" class="primary-button">{{ t('LINEで問い合わせ ↗') }}</a><button class="secondary-button" @click="modal = 'phone'">{{ t('電話番号を表示') }}</button><a v-if="website" :href="website" target="_blank" rel="noopener noreferrer" class="secondary-button">{{ t('公式サイトを開く ↗') }}</a></div><p class="dialog-note">{{ t(!line && !website && !phone ? '店舗の公開連絡先は、まだ登録されていません。' : '') }}<br />{{ t('ご利用条件や最終料金は店舗へ直接ご確認ください。') }}</p></template>
  <template v-else-if="modal === 'phone'"><SiteIcon name="phone" :size="42" /><h3>{{ t(phone || '電話番号は未登録です') }}</h3><a v-if="telephone" :href="'tel:' + telephone" class="primary-button">{{ t('電話をかける') }}</a><p v-else>{{ t('店舗が公開する電話番号の掲載後にご案内します。') }}</p><button class="secondary-button" @click="modal = 'contact'">{{ t('店舗の連絡先に戻る') }}</button></template>
  <template v-else-if="modal === 'social'"><p>{{ t('本人・店舗が公開するアカウントへのリンクをご案内します。') }}</p><div v-if="socials.length" class="dialog-actions"><a v-for="s in socials" :key="s.name" :href="s.url" target="_blank" rel="noopener noreferrer" class="secondary-button">{{ s.name }} ↗</a></div><p v-else>{{ t('公開SNSは未登録です。所属店舗の情報をご確認ください。') }}</p><RouterLink v-if="shopRecord" class="primary-button" :to="'/shops/' + shopRecord.id" @click="close">{{ t('所属店舗を見る') }}</RouterLink></template>
  <template v-else-if="modal === 'plan'"><p>{{ shop }} / {{ plan }}</p><div class="message-preview">{{ message }}</div><div class="dialog-actions"><button class="primary-button" @click="site.copy(message)">{{ t('文章とURLをコピー') }}</button><a v-if="line" :href="line" target="_blank" rel="noopener noreferrer" class="secondary-button">{{ t('店舗のLINEを開く ↗') }}</a><button class="secondary-button" @click="modal = 'contact'">{{ t('店舗の連絡先を見る') }}</button></div><p class="dialog-note">{{ t('コピーした文章を貼り付けて、ご自身で送信してください。') }}</p></template>
  <div v-else class="gallery-grid"><img v-for="src in gallery" :key="src" :src="src" alt="店内・キャストの掲載写真" /><p v-if="!gallery.length">{{ t('掲載写真はまだありません。') }}</p></div>
</section></div></Transition></Teleport></template>
