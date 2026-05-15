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
- 主题需要支持品牌切换、暗色模式，还是两者都要？
- 设计 token 由设计、原生、H5 还是平台统一维护？
