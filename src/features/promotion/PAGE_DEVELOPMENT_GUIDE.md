# 推广模块页面开发总则

## 状态

ready for implementation

## 关联文档

- 根级工作项：`/Users/mac/person_code/meu-mall/.ai-workspace/tasks/TASK-2026-0604-002-promotion-pages-bff-foundation.md`
- 对接说明：`/Users/mac/person_code/meu-mall/.ai-workspace/integration-briefs/BRIEF-2026-0604-002-promotion-pages-bff-foundation.md`
- BFF mock 契约：`/Users/mac/person_code/meu-mall/.ai-workspace/contracts/api/promotion-bff-mock-contract.md`
- 通用 H5 页面开发工作流：`/Users/mac/person_code/meu-mall/.ai-workspace/H5_PAGE_DEVELOPMENT_WORKFLOW.md`

## 页面范围

| 页面 | 路由 | 实现方式 |
| --- | --- | --- |
| 推广首页 | `/promotion` | SSR dynamic，五档达人主题数据驱动。 |
| 活动中心 | `/promotion/activities` | SSR dynamic。 |
| 榜单中心 | `/promotion/rank-center` | SSR dynamic。 |
| 达人销量榜 | `/promotion/ranking/sales` | SSR dynamic，榜期 tab 为客户端交互。 |
| 达人销售额榜 | `/promotion/ranking/amount` | SSR dynamic，榜期 tab 为客户端交互。 |
| 达人权益中心 | `/promotion/benefits?level=v1` | SSR dynamic，首屏服务端准备 V1-V5 mock，客户端支持左右滑切换和 query 同步。 |

## 设计来源

| 页面 | Figma node |
| --- | --- |
| 推广首页 V1 新锐 | `238:5541` |
| 推广首页 V2 白银 | `210:4048` |
| 推广首页 V3 黄金 | `205:2892` |
| 推广首页 V4 星钻 | `211:4223` |
| 推广首页 V5 至尊 | `211:4398` |
| 达人徽章切图参考 | `241:5762` |
| 活动中心 | `253:5369` |
| 榜单中心 | `253:5747` |
| 达人销量榜 | `270:5973` |
| 达人销售额榜 | `277:6570` |
| 权益中心 V1 | `253:3892` |
| 权益中心 V2 | `253:3652` |
| 权益中心 V3 | `253:3406` |
| 权益中心 V4 | `253:3156` |
| 权益中心 V5 | `61:483` |

## 视觉实现原则

- 页面按高保真实现，但不直接使用 Figma 临时图片 URL。
- 首版图片、icon、徽章优先通过可替换组件表达：
  - `PromotionAssetPlaceholder`
  - `PromotionIcon`
  - `TalentBadge`
- 等级徽章、权益中心背景、切换箭头和权益 icon 使用本地静态资源，数据和组件中只保留资源 key。
- Figma 中的底部 Tab 和 Home Indicator 属于原生 App，不在 H5 中实现。
- Figma 中的状态栏只作为顶部间距参考，H5 实际使用 `statusHeight` 和 `env(safe-area-inset-top)`。
- 所有卡片圆角以 Figma 为准，避免沿用旧低保真 `PageShell` 风格。
- V5 大金额必须做容器适配，不能溢出。
- 排行榜销量榜和销售额榜当前以 2026-06-05 最新 Figma 节点为准：浅绿渐变头图、三榜 tab、绿色分段周期控件、三列领奖台、白底列表和底部当前用户栏。
- 我的页、奖励记录和排行榜使用同一张浅绿顶部背景，统一资源 key 为 `shared.greenHeroBg`，业务 alias 为 `mine.hero.background`、`promotion.rewardRecordsBg` 和 `promotion.rankingHeroBg`；后续同款头图页面优先复用，不重复复制图片。

## 顶部导航规范

推广模块二级页面必须优先使用 `src/design-system/components` 中的公共导航预设，不再手写返回按钮、状态栏占位和固定导航。

| 场景 | 组件 | 当前页面 |
| --- | --- | --- |
| 白底常规导航，内容区滚动 | `StandardNavPage` | 榜单中心 |
| 透明固定导航，头图从顶部透出 | `TransparentNavPage` | 达人销量榜、达人销售额榜 |
| 透明固定导航，含右侧操作 | `TransparentActionNavPage` | 权益中心 |

使用规则：

- `statusHeight` 由根布局注入为 `--meu-status-bar-height`，页面不直接读取 Cookie。
- 普通导航内容区由 `StandardNavPage` 提供滚动容器。
- 透明导航页面头图内容如需避开导航按钮，使用 `pt-[var(--meu-top-bar-height)]`。
- 固定在底部或顶部的 H5 浮层必须限制在 `max-w-[430px]` 容器内，不能在桌面宽屏铺满窗口。
- 设计图没有的投影不添加；旧页面迁移时优先移除历史 `shadow-card` / `shadow-floating`。

## 权益中心交互规范

- 权益中心首屏仍由 SSR 准备数据，页面入口一次传入 V1-V5 五档权益数据。
- `level` query 只作为初始档位和调试入口，客户端左右滑切换时通过 `window.history.replaceState` 轻量同步 query，不触发 Next 路由导航和服务端重渲染。
- 权益列表切换时允许 item 级轻量 stagger，但必须只使用 transform / opacity，并在新一轮切换开始前清理旧 tween，避免快速切换时产生大量重叠动画。
- 左右切换按钮使用本地 PNG 箭头资源；移动端支持横向滑动，滑动阈值不低于 38px，避免误触。
- 等级切换动效仅作用于 transform 和 opacity，不做布局尺寸动画；用户开启 `prefers-reduced-motion` 时跳过 GSAP 动效。
- 权益页背景图、徽章、箭头和 icon 必须通过 `localAssetUrl()` 解析，保证线上 `/h5-v/<version>` basePath 和后续 CDN 前缀一致。

## 本地图片资源规范

- 推广模块所有随 H5 发版的本地图片、icon、背景图必须注册到 `src/lib/assets/local-assets.ts`，组件内通过 `localAssetUrl(assetKey)` 使用。
- 浅绿顶部背景属于跨页面共享资源，路径位于 `public/assets/shared/green-hero-bg.png`，页面只引用 `shared.greenHeroBg` 或已登记的业务 alias。
- 排行榜领奖台背景和皇冠属于稳定本地图片资源，路径位于 `public/assets/promotion/ranking/`，只允许通过 `promotion.rankingPodium.*` / `promotion.rankingCrown.*` 资源 key 引用。
- mock 或页面数据不保存 `/assets/...` 裸路径；需要本地资源时保存 `LocalAssetKey`，组件渲染时再转换为 URL。
- 客户端组件会在切换等级、轮播或动画时重新计算图片 URL，资源工具必须依赖显式 `process.env.NEXT_PUBLIC_*` 配置，不允许动态 `process.env[key]`。
- 禁止在组件、mock、style 中直接写 `src="/assets/..."`、`href="/assets/..."` 或 `url(/assets/...)`，否则线上 `/h5-v/<version>` 路径和 CDN 路径会丢失前缀。
- 只有后端或 CMS 返回的完整远程 URL 可以直接渲染；如果是远程 URL，字段名应明确带 `Url` 或在类型注释里说明。

## 推荐目录结构

```text
src/features/promotion/
  PAGE_DEVELOPMENT_GUIDE.md
  types.ts
  api.ts
  mock/
    home.ts
    activities.ts
    rankings.ts
    benefits.ts
  server/
    promotion-service.ts
  components/
    PromotionScreenShell.tsx
    PromotionAssetPlaceholder.tsx
    TalentBadge.tsx
    PromotionMetricGrid.tsx
    PromotionErrorState.tsx
    PromotionEmptyState.tsx
```

BFF route：

```text
src/app/api/bff/promotion/home/route.ts
src/app/api/bff/promotion/activities/route.ts
src/app/api/bff/promotion/rank-center/route.ts
src/app/api/bff/promotion/rankings/sales/route.ts
src/app/api/bff/promotion/rankings/amount/route.ts
src/app/api/bff/promotion/benefits/route.ts
```

页面 route：

```text
src/app/promotion/page.tsx
src/app/promotion/activities/page.tsx
src/app/promotion/rank-center/page.tsx
src/app/promotion/ranking/sales/page.tsx
src/app/promotion/ranking/amount/page.tsx
src/app/promotion/benefits/page.tsx
```

## 渲染策略

- 推广首页：SSR dynamic，不使用 ISR。
- 活动中心：SSR dynamic，不使用 ISR。
- 榜单中心：SSR dynamic，后续真实后端可评估短 TTL。
- 榜单详情：首屏 SSR，日榜/周榜/月榜 tab 可由客户端切换 query 后请求 BFF。
- 权益中心：SSR dynamic，query `level` 用于调试五档权益。

页面文件如需显式声明：

```ts
export const dynamic = "force-dynamic";
export const revalidate = 0;
```

## 达人等级数据

| level | 名称 | 佣金分成 | 主题 |
| --- | --- | --- | --- |
| `v1` | 新锐达人 | 基础佣金 | peach |
| `v2` | 白银达人 | 基础 * 120% | blue |
| `v3` | 黄金达人 | 基础 * 150% | gold |
| `v4` | 星钻达人 | 基础 * 180% | purple |
| `v5` | 至尊达人 | 基础 * 200% | blackPurple |

当前等级细则只做展示参考。月带货销量、月带货 GMV 和额外福利后续细化前，不写死成最终业务规则。

## BFF 调用边界

- 页面组件不直接读 mock。
- 页面组件调用 server service。
- server service 当前读 mock，后续替换为 backend client。
- 浏览器交互调用 H5 BFF。
- 浏览器端不直接读取 Cookie token。
- token 由 Next 服务端读取后按 Java / Python 后端转换为 `Authorization`。

## 状态要求

每个页面都必须实现：

- loading。
- error + retry。
- empty。
- 未登录 / token 缺失。
- 数据字段缺失 fallback。
- 等级非法 fallback 到 V1。

## 测试要求

最低测试：

- BFF mock 响应结构。
- `level=v1-v5` 映射正确。
- 非法 level fallback。
- 榜单 sales / amount 路由数据单位不同。
- V5 长金额不溢出的 DOM 结构约束。

验证命令：

```bash
pnpm test
pnpm typecheck
pnpm build
```

## 实现注意

- 旧 `/promotion/ranking` 页面后续可以作为跳转兼容或删除，具体实现任务中确认；当前新开发以 `/promotion/rank-center` 和独立榜单详情路由为准。
- 旧 `/promotion/level` 与权益页关系后续确认；当前首批权益调试以 `/promotion/benefits?level=v1-v5` 为准。
- 不新增第三方 UI 或图标库。
- 不使用 Figma 导出的长 Tailwind 代码原样落地，应拆成可维护组件。
