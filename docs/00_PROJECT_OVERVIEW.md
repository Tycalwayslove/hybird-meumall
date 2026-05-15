# 00 项目概览

## 项目定位

本项目是运行在原生 App WebView 中的 Hybrid App H5。它同时支持远程 H5 加载和部分静态页面随 App 打包。

## 技术栈

- 框架：Next.js
- UI：React
- 语言：TypeScript
- 样式：Tailwind CSS
- 主题：CSS Variables
- 容器：iOS / Android WebView
- 发布：manifest 控制版本、灰度和回滚

## 交付模式

### 远程 WebView

- H5 运行在远程 Next.js SSR 服务中。
- 原生 App 通过 WebView URL 加载页面。
- manifest 控制版本选择、灰度和回滚。

### App 内置兜底页

- 网络不可用或远程 SSR 服务不可达时，原生 App 可以加载内置兜底页。
- 内置兜底页只用于 offline、error、not-found、maintenance 等低交互场景。
- 当前不维护业务页面的 SSG 静态导出发布链路。

## 核心目标

- 建立清晰、可持续的 Hybrid App H5 架构。
- 明确 H5 与原生 App 的契约。
- 使用 manifest 控制发布和回滚。
- 使用 Tailwind + CSS Variables 支持动态换肤。
- 让 Codex 可以基于任务流安全开发。

## 非目标

- 本文不定义业务页面。
- 本文不定义具体产品需求。
- 本文不替代原生 App 发布文档。

## 核心概念

| 概念 | 含义 |
| --- | --- |
| H5 | 在 WebView 中渲染的 Web 应用。 |
| WebView | 原生 App 中承载 H5 的容器。 |
| Manifest | 描述版本、渠道、资源、灰度和回滚的运行时配置。 |
| Native Bridge | H5 调用原生能力的通信层。 |
| Native Fallback | 随原生 App 打包的兜底 HTML。 |
| Theme Tokens | 通过 CSS Variables 暴露并被 Tailwind 使用的主题变量。 |

## 运行时约束

- 不同 App 版本和平台的 WebView 能力可能不同。
- 不能假设网络始终可用。
- App 内置兜底页可能落后于远程 H5。
- Native Bridge 方法必须做版本和能力检测。
- 主题变量必须有安全默认值。

## 文档地图

- `docs/01_ARCHITECTURE.md` - 架构和模块边界。
- `docs/02_NATIVE_BRIDGE_SPEC.md` - H5 与原生通信契约。
- `docs/03_RELEASE_SPEC.md` - manifest、灰度、回滚和打包。
- `docs/04_THEME_SPEC.md` - Tailwind 与 CSS Variables 主题。
- `docs/05_API_SPEC.md` - API 约定。
- `docs/06_CODING_RULES.md` - 工程规则。
- `docs/07_AI_WORKFLOW.md` - AI 任务工作流。
- `docs/08_CHANGELOG.md` - 变更记录。
- `docs/09_DECISIONS.md` - 架构决策记录。

## 待确认问题

- 哪些兜底页必须随 App 内置？
- 首批支持哪些原生 App 版本？
- 主题需要支持品牌、暗色模式、无障碍或活动主题吗？
- manifest 服务由谁维护和发布？
