# 04 主题规范

## 目的

定义 Tailwind CSS 与 CSS Variables 的动态换肤模型。

## 主题目标

- 支持 WebView 内运行时切换主题。
- 支持原生 App 或 manifest 注入主题值。
- Tailwind 工具类通过 CSS Variables 消费主题。
- 避免在业务代码中硬编码品牌颜色。
- 主题注入失败时提供安全默认值。

## 主题来源优先级

1. 原生 App 注入主题。
2. manifest 提供主题。
3. 用户偏好。
4. 系统色彩模式。
5. H5 默认主题。

## CSS Variable 模板

```css
:root {
  --color-bg: 255 255 255;
  --color-fg: 17 24 39;
  --color-primary: 37 99 235;
  --color-primary-fg: 255 255 255;
  --color-muted: 243 244 246;
  --color-muted-fg: 107 114 128;
  --color-border: 229 231 235;
  --radius-sm: 4px;
  --radius-md: 8px;
}
```

## Tailwind 映射模板

```ts
const colors = {
  bg: "rgb(var(--color-bg) / <alpha-value>)",
  fg: "rgb(var(--color-fg) / <alpha-value>)",
  primary: "rgb(var(--color-primary) / <alpha-value>)",
  "primary-fg": "rgb(var(--color-primary-fg) / <alpha-value>)",
  muted: "rgb(var(--color-muted) / <alpha-value>)",
  "muted-fg": "rgb(var(--color-muted-fg) / <alpha-value>)",
  border: "rgb(var(--color-border) / <alpha-value>)"
};
```

## 当前实现位置

- 默认 CSS Variables 定义在 `src/styles/globals.css`。
- Tailwind token 映射定义在 `src/lib/theme/tokens.ts`，并由 `tailwind.config.ts` 消费。
- Figma 色彩组件已沉淀为 `src/design-system/tokens/colors.ts`，并由 `tailwind.config.ts` 扩展为 `brand`、`text`、`fill`、`line`、`success`、`warning`、`danger`、`price` 等语义 token。
- 全局基础组件位于 `src/design-system/components/`，页面应优先使用这些组件组合结构。
- light/dark token 定义在 `src/lib/theme/tokens.ts`。
- 主题 runtime 定义在 `src/lib/theme/runtime.ts`。
- 当前实现 light/dark runtime，不包含品牌主题、远程主题拉取、原生注入或 manifest 注入逻辑。

## MeuMall Design Token

首版 design token 来源于 Figma 色彩组件节点 `34:884`。

| Figma Token | 代码语义 | Tailwind 示例 |
| --- | --- | --- |
| 品牌色/点击 | `brand.action` | `bg-brand-action` |
| 品牌色/底色 | `brand.subtle` | `bg-brand-subtle` |
| 文字/text-1 | `text.primary` | `text-text-primary` |
| 文字/text-5 | `text.muted` | `text-text-muted` |
| Line | `line.DEFAULT` | `border-line` |
| 填充/fill-4 | `fill.page` | `bg-fill-page` |
| 填充/fill-白 | `fill.white` | `bg-fill-white` |
| 功能色/价格 | `price.DEFAULT` | `text-price` |

业务页面规则：

- 不在 `className` 中直接写 `bg-[#...]`、`text-[#...]`、`border-[#...]`、`from-[#...]` 或 `to-[#...]`。
- 常规颜色从 design token 读取。
- 业务状态色如果不属于全局 token，例如达人等级主题，可以集中在 feature 的 `theme/` 目录中，再通过组件 props 或 inline style 消费。
- 新增全局色值必须先补 `src/design-system/tokens/colors.ts` 和对应测试，再进入页面。

## Light/Dark Runtime

首版只支持 `light` 和 `dark`：

```ts
applyTheme("dark");
```

runtime 行为：

- `getThemeConfig(mode)` 返回 light/dark 主题配置，未知 mode fallback 到 light。
- `applyTheme(theme, target?)` 将 allowlist 内 CSS Variables 写入目标 root。
- `applyTheme` 同时设置 `data-theme="light"` 或 `data-theme="dark"`。
- `sanitizeThemeVariables` 会忽略未知变量、不以 `--` 开头的变量和不在 allowlist 内的变量。
- 默认 fallback 为 light。

无 JavaScript 或首屏 runtime 未执行时，`src/styles/globals.css` 仍提供 `:root` 默认变量和 `[data-theme="dark"]` CSS fallback。

## 主题对象模板

```ts
type ThemeConfig = {
  name: string;
  mode: "light" | "dark";
  variables: Record<string, string>;
  source: "native" | "manifest" | "user" | "system" | "default";
};
```

## Token 分类

| 分类 | 示例 |
| --- | --- |
| Background | page、surface、overlay |
| Text | foreground、muted、disabled、inverse |
| Brand | primary、secondary、accent |
| Feedback | success、warning、danger、info |
| Border | default、strong、focus |
| Shape | radius、shadow |
| Spacing | 可选的运行时间距 token |

## 运行时规则

- 将主题变量应用到 document root。
- 变量名必须通过 allowlist 校验。
- 忽略未知或不安全变量。
- 默认变量必须先于远程或原生主题数据加载。
- 主题切换不能造成明显布局抖动。

## 无障碍要求

- 文本与背景对比度应满足目标要求。
- 所有主题下 focus 样式必须可见。
- 错误、警告、成功状态不能只依赖颜色表达。

## 待确认问题

- 原生 App 是否能在首屏渲染前同步注入主题？
- 后续是否需要支持品牌主题。
- 设计 token 由设计、原生、H5 还是平台统一维护？
- 后续是否需要持久化用户主题偏好。
