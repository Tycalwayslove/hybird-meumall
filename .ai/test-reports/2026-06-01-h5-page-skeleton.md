# H5 页面骨架验证记录

## 任务

基于喵呜当前产品决策，绘制第一版 H5 页面结构骨架。

## 验证日期

2026-06-01

## 覆盖范围

- 首页内容页。
- 推广内容页。
- 我的内容页。
- 智能体原生占位页。
- 商品列表、商品详情、订单确认、秒杀、消息、咨询、收藏、会员/达人、购买记录、推广二级页面。

## 关键约束

- H5 不渲染原生一级 Tab。
- H5 不保留购物车页面或购物车语义。
- 图片、banner、头像、二维码和 icon 均使用占位组件。
- 未从 Figma 下载图片或 icon。

## 自动验证

- `pnpm lint`：通过。
- `pnpm typecheck`：通过。
- `pnpm test`：通过，10 个测试文件，59 个测试。
- `pnpm build`：通过。
- `pnpm run ai:check-workflow`：通过。

## 路由 smoke

以下路由均返回 200：

- `/`
- `/promotion`
- `/mine`
- `/agent-placeholder`
- `/category`
- `/product/p-1001`
- `/order-confirm`
- `/seckill`
- `/messages`
- `/consult`
- `/favorites/products`
- `/favorites/shops`
- `/member`
- `/orders`
- `/promotion/products`
- `/promotion/commission`
- `/promotion/card`
- `/promotion/level`
- `/promotion/benefits`
- `/promotion/ranking`

## 人工抽查

通过 Chrome 打开 `http://localhost:3000`，抽查首页、推广页和我的页：

- 页面内容集中在移动 H5 宽度容器内。
- 页面无底部 Tab。
- 页面无图片加载失败占位。
- 首页、推广和我的主结构可读。

## 备注

本轮只完成低保真结构骨架。正式视觉、真实 API、登录态、支付、订单状态、佣金规则、达人等级规则和原生 Bridge 交互仍需后续任务确认。
