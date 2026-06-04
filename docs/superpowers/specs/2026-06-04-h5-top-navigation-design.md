# H5 顶部导航公共组件设计

## 基本信息

- 日期：2026-06-04
- 项目：`hybird-meumall`
- 状态：设计已确认，待实现计划
- 适用范围：H5 页面顶部导航、状态栏高度、页面滚动容器和沉浸式头图布局
- 关联设计：Figma `bNdmC9k76qgoZtYCdYSemL`

## 背景

MeuMall H5 后续会持续新增页面。不同页面顶部导航形态不同，但它们都要遵守同一套 WebView 状态栏、返回按钮、标题、右侧操作和滚动布局规则。当前推广页面中已有页面级导航写法，后续如果继续复制，会造成状态栏补偿、透明导航覆盖、内容滚动和返回行为不一致。

本设计将导航拆成底层能力和页面预设。页面使用预设组件；预设组件复用同一个导航内核和页面壳。

## 目标

- 支持三类已确认导航：常规白底导航、透明返回导航、固定透明标题导航。
- 统一处理 App WebView 中的 `statusHeight`。
- 让页面明确选择“导航占位”或“导航覆盖内容”。
- 让业务页面少写布局细节，只声明标题、返回目标、右侧操作和页面内容。
- 将导航放入 `src/design-system`，作为全项目复用基础组件。

## 不包含

- 不实现原生状态栏图标、时间、电量和 Wi-Fi。
- 不实现真实原生返回栈；H5 只提供 `href` 或 `onBack` 回调入口。
- 不改动 manifest 路由。
- 不统一所有历史页面。首版只提供组件和示例迁移入口，后续页面逐步接入。

## 组件边界

### `TopNavigation`

`TopNavigation` 是纯导航视觉组件。它负责：

- 返回按钮。
- 居中标题。
- 右侧文本、按钮或自定义节点。
- 背景模式：白底或透明。
- 前景颜色：深色或白色。
- 固定层级和点击区域。

它不负责：

- 读取 cookie。
- 决定页面是否滚动。
- 决定内容是否从屏幕顶部开始。
- 直接调用 Native Bridge。

### `StatusBarSpacer`

`StatusBarSpacer` 提供顶部安全高度。它负责：

- 从统一运行时上下文读取 `statusHeight`。
- 在浏览器 H5 环境使用 `0px` 作为默认值。
- 保留 `env(safe-area-inset-top)` 作为 CSS fallback。
- 输出稳定 CSS 变量。

推荐变量：

```css
--meu-status-bar-height
--meu-nav-height
--meu-top-bar-height
```

### `PageShell`

`PageShell` 负责页面布局。它负责：

- WebView 最大宽度。
- 页面背景。
- 导航是否固定。
- 导航是否占据文档流。
- 内容滚动容器。
- 内容顶部补偿。

页面不直接写 `pt-[calc(env(safe-area-inset-top)+44px)]`。这类规则集中在 `PageShell`。

## 页面预设

### `StandardNavPage`

用于常规白底导航。

行为：

- 状态栏高度占位。
- 导航栏高度为 `44px`。
- 导航和状态栏都在文档流中。
- 导航白底，标题深色，返回按钮深色。
- 内容区独立滚动。

适用页面：

- 榜单中心。
- 活动中心。
- 普通列表页。
- 普通表单页。

示例：

```tsx
<StandardNavPage title="榜单中心" backHref="/promotion">
  <RankCenterContent />
</StandardNavPage>
```

### `TransparentNavPage`

用于透明返回导航。

行为：

- 导航固定在顶部。
- 导航不占据文档流。
- 内容从屏幕顶部开始。
- 背景图或头图可以显示在导航下方。
- 默认只有返回按钮，也可显示标题。

适用页面：

- 达人销量榜。
- 达人销售额榜。
- 带沉浸头图的活动详情。

示例：

```tsx
<TransparentNavPage backHref="/promotion/rank-center" foreground="dark">
  <RankingContent />
</TransparentNavPage>
```

### `TransparentActionNavPage`

用于固定透明标题导航。

行为：

- 导航固定在顶部。
- 导航不占据文档流。
- 内容从屏幕顶部开始。
- 标题居中。
- 右侧支持文本或自定义节点。
- 默认使用白色前景，适配深色背景图。

适用页面：

- 权益中心。
- 权益规则。
- 深色沉浸页。

示例：

```tsx
<TransparentActionNavPage title="权益中心" rightText="权益规则" backHref="/promotion">
  <BenefitsContent />
</TransparentActionNavPage>
```

## 状态栏高度规则

原生 App 通过 cookie 传入：

```text
statusHeight=<number>
```

处理规则：

- `statusHeight` 单位按 CSS px 处理。
- 缺失、非法、负数时使用 `0`。
- H5 浏览器环境默认不额外加状态栏高度。
- 组件层仍保留 `env(safe-area-inset-top)`，用于 iOS Safari 或其他安全区环境。
- 最终布局使用 CSS 变量，不让业务页面直接解析 cookie。

推荐计算口径：

```text
topBarHeight = statusBarHeight + 44
```

## 返回行为

首版提供两个入口：

- `backHref`：使用 Next.js `Link` 跳转。
- `onBack`：由客户端组件处理，例如调用 Bridge 或 `history.back()`。

规则：

- 如果同时传入 `onBack` 和 `backHref`，优先执行 `onBack`。
- 如果两者都缺失，返回按钮仍可隐藏，避免无效点击。
- 返回按钮点击区域不小于 `44px * 44px`，视觉图标保持 `16px`。

## 视觉规则

统一基础尺寸：

- 状态栏高度：来自 `statusHeight`。
- 导航栏高度：`44px`。
- 左侧返回图标视觉尺寸：`16px`。
- 返回按钮点击热区：`44px`。
- 标题字号：`18px`。
- 标题行高：`26px`。
- 右侧文本字号：`14px`。
- 左右安全边距：`16px`。

颜色使用 design-system token：

- 白底导航：`bg-fill-white`、`text-text-primary`。
- 透明深色前景：`text-text-primary`。
- 透明白色前景：`text-text-inverse`。
- 分割线仅在页面需要时使用 `border-line`。

禁止在导航组件 JSX 中写 `text-[#...]`、`bg-[#...]`、`border-[#...]`。

## 文件规划

推荐新增文件：

```text
src/design-system/components/StatusBarSpacer.tsx
src/design-system/components/TopNavigation.tsx
src/design-system/components/NavPageShell.tsx
src/design-system/components/navigation.tsx
src/design-system/components/navigation.test.tsx
```

导出入口：

```text
src/design-system/components/index.ts
src/design-system/index.ts
```

后续页面按需从 `@/design-system` 引入。

## 与现有页面的关系

首版实现后，优先迁移推广模块中的页面导航：

- `PromotionRankCenterScreen` 使用 `StandardNavPage`。
- `PromotionRankingScreen` 使用 `TransparentNavPage`。
- `PromotionBenefitsScreen` 使用 `TransparentActionNavPage`。

`PromotionShell` 可以继续保留为推广业务壳，但不再重复实现导航和状态栏逻辑。

## 验收标准

- 常规白底导航能展示返回按钮和居中标题。
- 透明导航能固定在顶部，内容从屏幕顶部开始。
- 固定透明导航能展示返回按钮、标题和右侧文本。
- `statusHeight` 为 `44` 时，导航整体下移并保留正确点击区域。
- `statusHeight` 缺失时，浏览器 H5 不额外占用顶部高度。
- 页面内容不会被普通导航遮挡。
- 沉浸式头图可以显示在透明导航下方。
- 导航组件不直接读取业务数据，不调用后端，不调用真实 Bridge。
- `pnpm test`、`pnpm lint`、`pnpm typecheck` 和 `pnpm build` 通过。
- 至少用浏览器检查普通导航、透明导航和固定透明导航的视觉效果。

## 风险

- 当前 App 通过 cookie 写入 `statusHeight`，不同平台可能传入 dp、px 或字符串。首版按 CSS px 处理，后续联调时需要 App 方确认单位。
- 如果未来 H5 运行在 iOS Safari，`statusHeight` 和 `env(safe-area-inset-top)` 可能同时存在。首版以 cookie 为主，CSS fallback 只兜底。
- 透明导航是否需要滚动后变白底，当前不纳入首版。后续可在 `TopNavigation` 上增加滚动态变体。

## 后续实现顺序

1. 实现状态栏高度解析和 CSS 变量。
2. 实现 `TopNavigation`。
3. 实现 `NavPageShell` 和三个预设页面组件。
4. 增加组件测试。
5. 迁移推广模块的三个页面。
6. 运行验证并记录测试报告。
