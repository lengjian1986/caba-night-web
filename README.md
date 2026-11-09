# CABA NIGHT Web

Vue 3 + TypeScript + Vite 前端项目。

本期定位：店铺、Cast、Plan 信息展示与外部联系平台，适配桌面和手机浏览器。暂不接支付；首版按浏览信息、联系商家和打开 Cast 公开社媒的流程规划。

## 本地开发

```sh
npm install
npm run dev
```

## 构建与预览

```sh
npm run build
npm run preview
```

- `src/App.vue`：页面入口
- `src/style.css`：全局样式
- `src/components/`：页面组件
- `public/`：静态资源

已还原 PC 页面并适配移动端；首页、店铺、Cast、套餐及其详情已连接 CABA NIGHT 后台公开数据，不包含支付。后台修改后刷新页面即可更新。

## 项目文档

- [动态数据接口与配置](docs/live-data.md)：接口、数据刷新、套餐展示、部署及现有字段限制。

- [PC 设计索引与预览](docs/pc-design-index.md)：26 张页面、状态与联系弹层、整套 PDF 和各页 PNG。
- [页面规划与开发顺序](docs/page-plan.md)：本期范围、页面与字段清单、联系与社媒交互、Home 调整项及开发顺序。
