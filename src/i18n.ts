import { ref, watch } from 'vue'
export type Locale = 'ja' | 'zh' | 'en'
export const languages: { value: Locale; label: string }[] = [{ value: 'ja', label: '日本語' }, { value: 'zh', label: '中文' }, { value: 'en', label: 'English' }]
function initial(): Locale { try { const stored = localStorage.getItem('caba-language'); if (stored === 'zh' || stored === 'en') return stored } catch { /* Storage may be disabled. */ } return 'ja' }
export const locale = ref<Locale>(initial())
watch(locale, value => { document.documentElement.lang = value === 'zh' ? 'zh-CN' : value; try { localStorage.setItem('caba-language', value) } catch { /* Switching still works without storage. */ } }, { immediate: true })
const messages: Record<string, [string, string]> = Object.fromEntries(`
エリア|地区|Areas
店舗|店铺|Shops
キャスト|Cast|Cast
プラン|套餐|Plans
特集|专题|Features
ご利用ガイド|使用指南|Guide
お気に入り|收藏|Favorites
イベント|活动|Events
店舗のご案内|店铺资讯|Shop updates
運営について|关于我们|About
お問い合わせ|联系我们|Contact
掲載をご希望の方|商家入驻|For businesses
利用規約|使用条款|Terms of use
プライバシー|隐私政策|Privacy
プライバシーポリシー|隐私政策|Privacy policy
お店と、人と、特別な夜に出会う。|邂逅心仪的店铺与 Cast，开启特别之夜。|Discover places, people and special nights.
料金・掲載情報は店舗へご確認ください。|价格及刊登信息请向店铺确认。|Confirm prices and details with the shop.
メインナビゲーション|主导航|Main navigation
モバイルナビゲーション|移动端导航|Mobile navigation
フッターナビゲーション|页脚导航|Footer navigation
メニューを閉じる|关闭菜单|Close menu
メニューを開く|打开菜单|Open menu
CABA NIGHT ホーム|CABA NIGHT 首页|CABA NIGHT home
本文へスキップ|跳转到主要内容|Skip to content
言語|语言|Language
今夜、行きたいお店が見つかる。|发现今晚想去的店铺。|Find your place for tonight.
気になるお店、キャスト、プランを見つけて、直接お問い合わせ。|发现心仪的店铺、Cast 和套餐，直接联系商家。|Discover shops, cast and plans. Contact shops directly.
キーワード|关键词|Keyword
店名・エリアを入力|输入店名或地区|Shop name or area
名前・プロフィール|姓名或个人简介|Name or profile
お店を探す|查找店铺|Find shops
店舗を探す|查找店铺|Find shops
すべてのエリア|全部地区|All areas
すべての店舗|全部店铺|All shops
すべてのタイプ|全部类型|All types
すべてのプラン|全部套餐|All plans
指定なし|不限|Any price
店舗に直接お問い合わせ|直接联系店铺|Contact shops directly
キャストの公式SNS|Cast 官方社媒|Official cast social links
プランの参考料金を比較|比较套餐参考价格|Compare plan prices
注目の店舗|精选店铺|Featured shops
編集部ピックアップ|推荐店铺|Our picks
気になるキャストに出会う|发现心仪的 Cast|Discover your favorite cast
キャスト一覧へ →|查看全部 Cast →|View all cast →
お店を探す  →  キャスト・プランを見る  →  お店に直接連絡|查找店铺 → 浏览 Cast 与套餐 → 直接联系店铺|Find a shop → Explore cast and plans → Contact the shop
あなたに合うお店を探す|查找适合你的店铺|Find your ideal shop
エリアや料金、設備から、気になるお店を見つけましょう。|按地区、价格和设施查找心仪的店铺。|Explore shops by area, price and amenities.
条件で絞り込む|筛选条件|Filter results
店舗タイプ|店铺类型|Shop type
参考料金 / 60分|参考价格／60 分钟|Reference price / 60 min
参考料金|参考价格|Reference price
設備・サービス|设施与服务|Amenities
個室あり|提供包间|Private rooms
駅から徒歩5分以内|距车站步行 5 分钟内|Within 5 min of a station
外国語対応|支持外语|Foreign languages
公式SNSあり|提供官方社媒|Official social links
この条件で検索|按条件搜索|Apply filters
条件をクリア|清除筛选|Clear filters
条件をリセット|重置筛选|Reset filters
詳細を見る|查看详情|View details
店舗詳細を見る|查看店铺详情|View shop
店舗詳細を見る →|查看店铺详情 →|View shop →
表示順：名前順  ⌄|排序：名称 ⌄|Sort: name ⌄
名前順 ⌄|按名称排序 ⌄|Name ⌄
掲載順 ⌄|默认排序 ⌄|Default order ⌄
気になるキャストを見つける|发现心仪的 Cast|Find your favorite cast
プロフィール、所属店舗、公開SNSから、その人らしさに出会う。|浏览个人简介、所属店铺与公开社媒，了解 Cast。|Explore profiles, shops and public social links.
所属店舗|所属店铺|Shop
キャストを探す|查找 Cast|Find cast
プロフィールを見る →|查看个人简介 →|View profile →
プロフィール・SNSを見る →|查看简介与社媒 →|Profile and socials →
過ごし方に合わせて、プランを探す|寻找适合你的套餐|Find a plan for your evening
料金と内容を比較して、お店へ直接お問い合わせください。|比较价格和内容，直接联系店铺咨询。|Compare prices and details. Contact the shop directly.
タイプ|类型|Type
検索する|搜索|Search
すべて|全部|All
スタンダード|标准套餐|Standard
初回来店|首次到店|First visit
VIP・個室|VIP／包间|VIP / private rooms
グループ|团体|Groups
プラン詳細を見る →|查看套餐详情 →|View plan →
参考料金 · 詳細条件は店舗へ|参考价格 · 详情请咨询店铺|Reference price · Ask the shop for details
掲載期間終了 · 条件は店舗へ|有效期已结束 · 条件请咨询店铺|Period ended · Ask the shop
掲載期間終了|有效期已结束|Period ended
店舗へお問い合わせ|请咨询店铺|Ask the shop
料金は店舗へ|价格请咨询店铺|Ask the shop for prices
店鋪情報|店铺信息|Shop information
店舗情報|店铺信息|Shop information
♡ お気に入り|♡ 收藏|♡ Save
♡ お気に入りに保存|♡ 加入收藏|♡ Save to favorites
♥ 保存済み|♥ 已收藏|♥ Saved
共有 ↗|分享 ↗|Share ↗
プロフィールを共有 ↗|分享个人主页 ↗|Share profile ↗
すべての写真を見る|查看全部照片|View all photos
掲載写真はイメージです。最新情報は店舗へご確認ください。|照片仅供参考，最新信息请向店铺确认。|Photos are illustrative. Confirm current details with the shop.
店舗紹介|店铺介绍|About the shop
料金・設備|价格与设施|Prices and amenities
アクセス|交通|Location
上質なひとときを、あなたに。|享受特别的美好时光。|Make time for a special evening.
営業時間|营业时间|Opening hours
所属キャスト|所属 Cast|Cast at this shop
プラン・料金|套餐与价格|Plans and prices
アクセス・店舗情報|交通与店铺信息|Location and shop information
地図・アクセスを確認 ↗|查看地图与路线 ↗|View map and directions ↗
情報の修正を依頼 →|反馈信息错误 →|Report an issue →
店舗へお問い合わせ|联系店铺|Contact the shop
料金や来店日時は、お店に直接ご確認ください。|价格和到店时间请直接向店铺确认。|Confirm prices and visiting times directly with the shop.
LINEで問い合わせ ↗|通过 LINE 咨询 ↗|Contact via LINE ↗
電話番号を表示|显示电话号码|Show phone number
公式サイトを見る ↗|访问官网 ↗|Visit website ↗
受付時間・対応言語は店舗情報をご確認ください。|接待时间及支持语言请查看店铺信息。|See shop information for contact hours and languages.
税・サービス料などの条件は店舗へご確認ください。|税费、服务费等条件请向店铺确认。|Confirm taxes and service charges with the shop.
店舗の登録情報を掲載しています。|展示店铺登记的信息。|Information provided by the shop.
店舗紹介はまだ登録されていません。|店铺介绍暂未登记。|No shop description yet.
住所はまだ登録されていません。|地址暂未登记。|No address listed yet.
所属キャストはまだ登録されていません。|暂未登记所属 Cast。|No cast listed yet.
公開プランはまだ登録されていません。|暂无公开套餐。|No public plans yet.
フォトギャラリー|相册|Photo gallery
公開プロフィール|公开资料|Public profile
プロフィールはまだ登録されていません。|个人简介暂未登记。|No profile description yet.
公開プロフィールはまだ登録されていません。|公开资料暂未登记。|No public profile details yet.
公開SNSが未登録の場合は、所属店舗へお問い合わせください。|未登记公开社媒时，请联系所属店铺。|If no social links are listed, contact the shop.
来店やプランについては、店舗へお問い合わせください。|到店及套餐事宜请咨询店铺。|Contact the shop about visits and plans.
店舗に問い合わせ|联系店铺|Contact shop
プロフィール・リンクの修正を依頼 →|反馈资料或链接错误 →|Report a profile or link issue →
店舗へこのプランを問い合わせ|向店铺咨询此套餐|Ask the shop about this plan
プランについて|套餐介绍|About this plan
参考料金 · 条件は店舗へご確認ください|参考价格 · 使用条件请向店铺确认|Reference price · Confirm conditions with the shop
プランの詳細は店舗へお問い合わせください。|套餐详情请咨询店铺。|Ask the shop for plan details.
このプランの店舗|套餐所属店铺|Shop offering this plan
店舗の詳細を見る →|查看店铺详情 →|View shop details →
プラン名とURLをコピー|复制套餐名称与链接|Copy plan name and link
お問い合わせの前に|咨询前须知|Before you contact the shop
料金|价格|Price
対象人数|适用人数|Group size
対象キャスト|适用 Cast|Eligible cast
掲載期間|有效期|Validity period
割引条件|优惠条件|Discount conditions
割引なし|无优惠|No discount
行きたい街から探す|按地区查找|Explore by area
お気に入りの街から、新しい出会いを見つけましょう。|从心仪的地区开始，发现新的邂逅。|Discover new places in your favorite areas.
都道府県からエリアを選択|按都道府县选择地区|Choose an area by prefecture
公開中のエリアはまだありません。|暂无公开地区。|No public areas yet.
華やかな通りと、多彩なお店。あなたらしい夜を探しに。|探索多彩街区与店铺，发现属于你的夜晚。|Explore vibrant streets and find your kind of night.
お店の雰囲気やキャスト、プランを見比べて、お気に入りの一軒へ。|比较店铺氛围、Cast 和套餐，找到心仪的店铺。|Compare shops, cast and plans to find your favorite.
街のガイド|街区指南|Area guide
アクセス・周辺エリア|交通与周边地区|Access and nearby areas
気になる場所と、人をストック。|收藏心仪的店铺与 Cast。|Keep your favorites close.
このブラウザに保存した店舗・キャスト・プランをまとめて確認できます。|查看在此浏览器收藏的店铺、Cast 和套餐。|View shops, cast and plans saved in this browser.
保存を解除|取消收藏|Remove favorite
保存した情報はまだありません|暂无收藏|No favorites yet
条件に合う情報がありません|没有符合条件的信息|No matching results
条件を変えて、店舗・キャスト・プランを探してみてください。|请调整筛选条件，查找店铺、Cast 或套餐。|Try different filters to find shops, cast or plans.
検索条件を変更|修改搜索条件|Change filters
読み込み中…|加载中…|Loading…
情報を取得できません|无法获取信息|Unable to load information
情報を読み込めませんでした。時間をおいて再度お試しください。|信息加载失败，请稍后重试。|Could not load information. Please try again later.
再読み込み|重新加载|Try again
写真準備中|图片准备中|Photo coming soon
閉じる|关闭|Close
電話番号は未登録です|电话号码暂未登记|No phone number listed
店舗に電話で問い合わせ|致电店铺|Call the shop
店舗が公開する電話番号の掲載後にご案内します。|店铺公开电话号码后将显示在此。|A phone number will appear when the shop publishes one.
店舗の連絡先に戻る|返回店铺联系方式|Back to contact details
電話をかける|拨打电话|Call now
ご希望の窓口から、店舗へ直接ご連絡ください。|请选择联系渠道，直接联系店铺。|Choose a channel to contact the shop directly.
店舗の公開連絡先は、まだ登録されていません。|店铺的公开联系方式暂未登记。|No public contact details are listed yet.
ご利用条件や最終料金は店舗へ直接ご確認ください。|使用条件和最终价格请向店铺确认。|Confirm conditions and final prices directly with the shop.
公式サイトを開く ↗|打开官网 ↗|Open website ↗
本人・店舗が公開するアカウントへのリンクをご案内します。|此处展示本人或店铺公开的社媒链接。|Links published by the cast or their shop appear here.
公開SNSは未登録です。所属店舗の情報をご確認ください。|公开社媒暂未登记，请查看所属店铺信息。|No public social links yet. Please check the shop information.
所属店舗を見る|查看所属店铺|View shop
このプランについて問い合わせ|咨询此套餐|Ask about this plan
文章とURLをコピー|复制内容与链接|Copy message and link
店舗のLINEを開く ↗|打开店铺 LINE ↗|Open shop LINE ↗
店舗の連絡先を見る|查看店铺联系方式|View contact details
コピーした文章を貼り付けて、ご自身で送信してください。|请粘贴复制的内容并自行发送。|Paste the copied message and send it yourself.
掲載写真はまだありません。|暂无照片。|No photos yet.
お気に入りから解除しました|已取消收藏|Removed from favorites
お気に入りに保存しました|已加入收藏|Saved to favorites
このブラウザでは保存できませんでした|此浏览器无法保存收藏|Could not save in this browser
コピーしました|已复制|Copied
コピーできませんでした。表示された内容を選択してコピーしてください。|复制失败，请选中显示的内容手动复制。|Could not copy. Select and copy the displayed text.
お探しのページが見つかりません。|找不到此页面。|Page not found.
ページが移動したか、掲載が終了した可能性があります。|页面可能已移动或停止展示。|This page may have moved or is no longer available.
ホームに戻る|返回首页|Back to home
HOME|首页|HOME
キャスト紹介|Cast 介绍|Cast profile
プラン詳細|套餐详情|Plan details
エリアガイド|地区指南|Area guide
ページが見つかりません|找不到页面|Page not found
よくある質問|常见问题|FAQ
情報の修正|信息纠错|Report an issue
店舗へ直接お問い合わせ|直接联系店铺|Contact the shop directly
¥8,000以下|¥8,000 及以下|Up to ¥8,000
¥8,000〜¥12,000|¥8,000～¥12,000|¥8,000–¥12,000
¥12,000以上|¥12,000 及以上|¥12,000 and up
キャバクラ|日式陪酒俱乐部|Cabaret club
ラウンジ|酒廊|Lounge
クラブ|俱乐部|Club
ニュークラブ|新式俱乐部|New club
今、気になるお店をピックアップ。|发现值得关注的店铺。|Shops worth discovering.
編集部が選ぶ店舗をご紹介。順位や口コミ評価ではありません。|展示精选店铺，不代表排名或用户评分。|A selection of shops, not a ranking or review score.
掲載順は編集上の構成によるものです。|展示顺序由编辑安排。|Display order is editorial.
このブラウザに保存されます。|保存在当前浏览器。|Saved in this browser.
JR・私鉄・地下鉄の各線からアクセス。|可乘 JR、私铁或地铁前往。|Accessible by train and subway.
ご来店の際は、各店舗の所在地と営業情報をご確認ください。|到店前请确认店铺地址及营业信息。|Check each shop’s address and opening hours before visiting.
掲載料金は目安です。ご利用内容や時期によって変わる場合があります。|展示价格仅供参考，可能因消费内容和时间而变化。|Prices are indicative and may vary by service and date.
来店日時・人数・ご希望を店舗に伝え、最終料金と条件をご確認ください。|请告知店铺到店时间、人数和需求，确认最终价格及条件。|Tell the shop your date, group size and preferences to confirm prices and conditions.
お店との出会いを、もっとスムーズに。|更轻松地找到心仪的店铺。|Discover your next shop with ease.
気になるお店を見つけて、直接連絡するまでの3ステップ。|找到心仪店铺并直接联系的三个步骤。|Three steps to find and contact your next shop.
エリアや店舗タイプ、参考料金から、自分に合うお店を探しましょう。|按地区、店铺类型及参考价格查找适合你的店铺。|Find a shop by area, type and reference price.
店舗一覧へ →|查看店铺列表 →|Browse shops →
キャスト・プランをチェック|浏览 Cast 与套餐|Explore cast and plans
写真やプロフィール、プランの内容と条件を見比べましょう。|比较照片、简介及套餐内容与条件。|Compare photos, profiles and plan details.
キャスト・プランへ →|查看 Cast 与套餐 →|Explore cast and plans →
電話・LINE・公式サイトから、来店日時や料金についてご確認ください。|通过电话、LINE 或官网咨询到店时间与价格。|Ask about dates and prices by phone, LINE or the official website.
お問い合わせ方法 →|查看联系方法 →|How to contact shops →
料金を見るときのチェックポイント|查看价格时的注意事项|What to check in the price
参考料金と時間|参考价格与时长|Reference price and duration
「お一人様・60分」などの単位をご確認ください。|请确认“每人／60 分钟”等计价单位。|Check units such as per person or per 60 minutes.
含まれる内容と追加料金|包含内容及额外费用|Inclusions and extra charges
セット内容、税・サービス料などは店舗へお問い合わせください。|套餐内容、税费和服务费请向店铺确认。|Ask the shop about inclusions, taxes and service charges.
店舗との直接連絡|直接联系店铺|Contacting the shop
連絡しただけでは来店条件が確定しないため、店舗の案内をご確認ください。|联系店铺不代表到店安排已确认，请以店铺回复为准。|Contact alone does not confirm arrangements. Follow the shop’s guidance.
よくある質問を見る|查看常见问题|Read the FAQ
お店を探してみる →|查找店铺 →|Find a shop →
お店探しやお問い合わせで、気になることはこちらから。|有关查找店铺及联系商家的问题，请查看此处。|Help with finding and contacting shops.
お店の探し方|如何查找店铺|Finding shops
料金・プラン|价格与套餐|Prices and plans
店舗への連絡|联系店铺|Contacting shops
キャスト・SNS|Cast 与社媒|Cast and socials
掲載情報について|关于刊登信息|Listed information
このサイトで予約や支払いはできますか？|可以在本站预约或付款吗？|Can I book or pay on this site?
店舗・キャスト・プランの情報をご覧いただけます。来店相談は店舗の窓口へ直接お問い合わせください。|本站提供店铺、Cast 与套餐信息，到店事宜请直接联系店铺。|Browse shops, cast and plans here. Contact shops directly about visits.
掲載料金はどのような料金ですか？|展示的价格是什么价格？|What do the listed prices mean?
表示は参考料金です。時間や含まれる内容、税・サービス料などの条件は店舗へご確認ください。|展示价格仅供参考，时长、包含内容及税费等条件请咨询店铺。|Prices are indicative. Confirm duration, inclusions, taxes and service charges with the shop.
キャストのSNSはどこで見られますか？|在哪里查看 Cast 的社媒？|Where can I find cast social links?
キャスト詳細ページに、公開されている公式SNSのリンクを掲載します。|Cast 详情页将展示公开的官方社媒链接。|Public official social links appear on cast profiles.
お気に入りは別の端末でも使えますか？|收藏可以在其他设备使用吗？|Can I access favorites on another device?
お気に入りは保存したブラウザで利用できます。別の端末やブラウザには同期されません。|收藏仅保存在当前浏览器，不会同步到其他设备或浏览器。|Favorites stay in this browser and do not sync across devices.
掲載情報が古い場合はどうすればよいですか？|刊登信息过时了怎么办？|What if listed information is outdated?
詳細ページの「情報の修正を依頼」から、対象ページと内容をお知らせください。|请通过详情页的信息纠错入口提供页面和问题内容。|Use the report link on the detail page to tell us what needs updating.
解決しない場合は、お問い合わせ|仍有问题请联系我们|Still need help? Contact us
ヘルプ|帮助|Help
ご案内|说明|Information
おすすめ|推荐|Recommended
`.trim().split('\n').map(line => { const [ja, zh, en] = line.split('|'); return [ja!, [zh!, en!]] }))
export function t(text: string | undefined): string {
  if (!text || locale.value === 'ja') return text || ''
  const index = locale.value === 'zh' ? 0 : 1
  const direct = messages[text]?.[index]
  if (direct) return direct
  // Translate UI patterns while preserving record names, IDs and filter values.
  const maximum = text.match(/^最大(\d+)名$/)
  if (maximum) return index === 0 ? `最多 ${maximum[1]} 人` : `Up to ${maximum[1]} people`
  const profile = text.match(/^(年齢|身長|スタイル|趣味|出勤|出勤状況)　(.+)$/)
  if (profile) { const labels: Record<string, [string, string]> = { 年齢: ['年龄', 'Age'], 身長: ['身高', 'Height'], スタイル: ['风格', 'Style'], 趣味: ['爱好', 'Hobbies'], 出勤: ['出勤', 'Attendance'], 出勤状況: ['出勤状态', 'Attendance status'] }; return `${labels[profile[1]!]![index]}: ${profile[2]!.replace(/歳$/, index === 0 ? ' 岁' : ' years')}` }
  if (text.endsWith('（掲載期間終了）')) return text.slice(0, -8) + (index === 0 ? '（有效期已结束）' : ' (period ended)')
  const count = text.match(/^(\d+) (件の店舗|名のキャスト|店舗)$/)
  if (count) return locale.value === 'zh' ? `${count[1]} ${count[2] === '名のキャスト' ? '位 Cast' : '家店铺'}` : `${count[1]} ${count[2] === '名のキャスト' ? 'cast' : 'shops'}`
  if (text.startsWith('HOME /') || text.startsWith('HOME  /')) return text.split(/\s*\/\s*/).map(t).join(' / ')
  if (text.includes('\n')) return text.split('\n').map(t).join('\n')
  const suffixes: [string, string, string][] = [['の公開SNS', '的公开社媒', ' — public social links'], [' に問い合わせ', ' · 联系店铺', ' — contact shop'], ['の店舗', '的店铺', ' shops'], ['の夜を楽しむ。', ' · 探索夜生活。', ' nights await.']]
  for (const [ja, zh, en] of suffixes) if (text.endsWith(ja)) return text.slice(0, -ja.length) + (index === 0 ? zh : en)
  return text
}
