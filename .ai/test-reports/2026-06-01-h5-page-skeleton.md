# H5 页面骨架验证记录

## 任务

基于喵呜当前产品决策，绘制 H5 页面结构，并将首页、推广页、我的页从低保真骨架升级为贴近 Figma 的首屏视觉复刻。

## 验证日期

2026-06-01

## 覆盖范围

- 首页内容页：贴近 Figma 首页的顶部品牌、搜索、消息、运营 banner、分类、活动卡片和推荐商品结构。
- 推广内容页：贴近 Figma 推广首页的黄金背景、达人信息、等级徽章、收益卡片、数据宫格和推广工具结构。
- 我的内容页：贴近 Figma 我的页的绿色头图、用户信息、权益卡、订单入口、运营 banner 和服务工具结构。
- 智能体原生占位页。
- 商品列表、商品详情、订单确认、秒杀、消息、咨询、收藏、会员/达人、购买记录、推广二级页面。

## 关键约束

- H5 不渲染原生一级 Tab。
- H5 不保留购物车页面或购物车语义。
- 图片、banner、头像、二维码和 icon 均使用可替换占位组件或 CSS 图形。
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

- 页面内容集中在移动 H5 宽度容器内，桌面环境居中展示。
- 页面无底部 Tab。
- 页面无购物车入口。
- 页面未依赖从 Figma 下载的图片或 icon。
- 首页、推广页、我的页首屏视觉与 Figma 主结构对齐，无明显重叠和跑版。

## 备注

本轮完成一级 H5 页面高保真结构复刻，但真实商品图片、真实 icon、登录态、支付、订单状态、佣金规则、达人等级规则和原生 Bridge 交互仍需后续任务确认。
