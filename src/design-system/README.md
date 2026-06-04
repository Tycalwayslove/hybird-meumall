# MeuMall H5 Design System

## 目标

`src/design-system` 用来承接全项目复用的视觉 token 和基础 UI primitives。它不是某个页面的组件库，而是 H5 后续页面开发的统一入口：

- 颜色、圆角、阴影、字号和常用间距从 token 读取。
- 页面 JSX 不直接写 `bg-[#...]`、`text-[#...]`、`border-[#...]` 这类颜色 class。
- 业务页面优先组合 `AppScreen`、`Section`、`Surface`、`Metric`、`StateView`、`Skeleton`、`AssetPlaceholder` 等基础组件。
- 业务特有的等级色、活动色、榜单色可以集中放在 feature 内的 `theme/` 目录，不散落到页面结构中。

## Token 来源

首版 token 来自 Figma 色彩组件节点 `34:884`，核心映射如下：

| Figma 分类 | 代码入口 | Tailwind 示例 |
| --- | --- | --- |
| 品牌色 | `meuColorValues.brand` | `bg-brand-action` |
| 文字 | `meuColorValues.text` | `text-text-primary` |
| Line | `meuColorValues.line` | `border-line` |
| 成功 / 提醒 / 错误 | `meuColorValues.success / warning / danger` | `bg-success-subtle` |
| 填充 | `meuColorValues.fill` | `bg-fill-page` |
| 价格 | `meuColorValues.price` | `text-price` |

## 目录说明

```text
src/design-system/
  components/      # 全局基础组件
  tokens/          # Figma token、Tailwind 映射、圆角、阴影、字号、间距
  utils/           # 通用小工具
  index.ts         # 统一导出入口
```

## 使用规则

- 新页面最外层优先使用 `AppScreen`，保持 WebView 宽度、页面底色和文字色一致。
- 页面区块优先使用 `Section` 或 `Surface`，不要在业务页面重复造卡片外观。
- 空状态、错误状态和加载骨架优先用 `StateView`、`Skeleton`，保证兜底体验一致。
- 图片和 icon 未切正式资源前，用 `AssetPlaceholder` 或 feature 内封装的占位组件。
- 视觉参数如果跟业务状态绑定，例如达人等级 V1-V5，应放在 `src/features/<feature>/theme/`。
- 本地稳定图片通过 `src/lib/assets/local-assets.ts` 注册，再用 `localAssetUrl(key)` 引用；页面组件不要直接拼 `/assets/...`。

## 推广模块迁移样板

推广首页已按该模式拆分：

- `src/features/promotion/pages/PromotionHomePage.tsx`：页面编排。
- `src/features/promotion/components/TalentHero.tsx`：达人头图。
- `src/features/promotion/components/TalentSummaryCard.tsx`：带货汇总卡。
- `src/features/promotion/components/PromotionQuickEntryGrid.tsx`：快捷入口。
- `src/features/promotion/components/PromotionMetricGrid.tsx`：指标宫格。
- `src/features/promotion/components/PromotionToolGrid.tsx`：推广工具。
- `src/features/promotion/theme/talent-theme.ts`：达人等级、徽章、占位 icon 视觉参数。

第二阶段已完成推广二级页迁移：

- `PromotionActivitiesScreen`：活动状态色改为 `activityStatusTone`，卡片、文字、进度块使用 design token。
- `PromotionRankCenterScreen`：榜单卡片渐变集中到 `rankCenterCardTone`，页面结构使用统一 token。
- `PromotionRankingScreen`：榜单头图渐变集中到 `rankingTheme`，列表和底部当前用户条使用 token。
- `PromotionBenefitsScreen`：权益深色页面背景和分割线集中到 `benefitsTheme`，等级视觉仍由 `talent-theme` 提供。
- `PromotionShell`、`PromotionStates`：统一接入 `AppScreen`、`StateView`、`Skeleton` 和 `Button`。
- 达人徽章、推广首页达人背景、汇总卡背景 V1-V5 已使用 `public/assets/promotion/talent-badges/` 下的本地 PNG，并通过 `localAssetUrl()` 解析。

后续新增推广页面应直接按该结构开发，不再先写单页硬编码样式。
