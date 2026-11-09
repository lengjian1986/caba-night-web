# PC 页面设计索引

已在当前 Pencil 文档中完成 26 张 PC 页面、2 张状态与交互画板，另外提供设计索引和可复用导航、页脚组件。页面宽度为 1440 px，高度根据内容变化。

- [整套设计 PDF（索引 + 28 张画板）](design/pc/pc-designs.pdf)
- [设计索引 PNG](design/pc/00-index.png)
- Pencil 中的 PC 页面位于原参考图及已有移动端设计的下方，按每行 5 张排列；使用图层名“PC 01”至“PC 29”定位。
- 旧参考图、旧首页还原及移动端画板均保留，新版首页为“PC 01 · Home · 信息展示版”。

## 页面清单

| 编号 | 页面 / PNG 预览 | 对应路由或用途 | Pencil 节点 |
| --- | --- | --- | --- |
| 01 | [首页（信息展示版）](design/pc/01-home.png) | `/` | `S1YXvE` |
| 02 | [店铺搜索](design/pc/02-shops.png) | `/shops` | `VdutC` |
| 03 | [店铺详情](design/pc/03-shop.png) | `/shops/:shopId` | `wTtjv` |
| 04 | [Cast 列表](design/pc/04-casts.png) | `/casts` | `kOpec` |
| 05 | [Cast 详情](design/pc/05-cast.png) | `/casts/:castId` | `xPbNh` |
| 06 | [Plan 列表](design/pc/06-plans.png) | `/plans` | `QNtw3` |
| 07 | [Plan 详情](design/pc/07-plan.png) | `/shops/:shopId/plans/:planId` | `zilcM` |
| 08 | [地区选择](design/pc/08-areas.png) | `/areas` | `OinZZ` |
| 09 | [地区详情](design/pc/09-area.png) | `/areas/:areaSlug` | `aIbsQ` |
| 10 | [我的收藏](design/pc/10-favorites.png) | `/favorites` | `I5sUa` |
| 11 | [活动列表](design/pc/11-events.png) | `/events` | `D0aza` |
| 12 | [活动详情](design/pc/12-event.png) | `/events/:eventId` | `A18tq` |
| 13 | [优惠信息](design/pc/13-offers.png) | `/offers` | `KvXht` |
| 14 | [优惠详情](design/pc/14-offer.png) | `/offers/:offerId` | `p1SMh` |
| 15 | [专题列表](design/pc/15-features.png) | `/features` | `juvj3` |
| 16 | [专题详情](design/pc/16-feature.png) | `/features/:slug` | `NEznq` |
| 17 | [编辑精选](design/pc/17-rankings.png) | `/rankings` | `vAYR2` |
| 18 | [使用指南](design/pc/18-guide.png) | `/guide` | `Ia8rS` |
| 19 | [常见问题](design/pc/19-help.png) | `/help` | `OuCQo` |
| 20 | [联系平台](design/pc/20-contact.png) | `/contact` | `ophG0` |
| 21 | [信息纠错](design/pc/21-report.png) | `/report` | `Vkafu` |
| 22 | [关于平台](design/pc/22-about.png) | `/about` | `jMIvN` |
| 23 | [商家入驻介绍](design/pc/23-business.png) | `/for-business` | `EpGok` |
| 24 | [利用条款（正文待提供）](design/pc/24-terms.png) | `/legal/terms` | `Sihrk` |
| 25 | [隐私政策（正文待提供）](design/pc/25-privacy.png) | `/legal/privacy` | `qoLjo` |
| 26 | [404](design/pc/26-notFound.png) | `/:pathMatch(.*)*` | `aTeht` |
| 27 | [六种空态与异常](design/pc/27-states.png) | `共用状态` | `E4435a` |
| 28 | [四种联系与社媒弹层](design/pc/28-overlays.png) | `共用交互` | `pSuxz` |

## 本次范围

- 店铺、Cast、Plan 的列表、搜索、详情与外部联系流程。
- 地区、收藏、活动、优惠、专题、编辑精选、帮助、平台联系、纠错和入驻介绍。
- 状态画板包含无搜索结果、收藏为空、Plan 结束、店铺下架、Cast 所属信息待更新、网络错误。
- 交互画板包含商家联系、电话复制、Cast 社媒、Plan 咨询文案复制。
- 新版页面不包含站内支付、预约订单、积分账户及虚构评分。首页交易入口已在新版设计中调整。

## 内容与实现状态

- 设计为可编辑 Pencil 图层；照片复用已有参考图的裁切素材。
- 人名、店名、营业时间、价格、社媒与联系渠道均用于设计示例，不代表已核实资料。正式上线需替换为真实且可公开的数据。
- 条款、隐私政策仅完成排版，正文等待业务提供。联系平台页面的公开邮箱等真实渠道也待提供。
- 所有页面已检查容器裁切，关键页面已导出大图检查；PNG 与 PDF 是当前静态设计快照。
- Vue 工程仍是基础入口，本次没有实现这些页面或接入真实接口。

