# AI 上下文

## 项目身份

面向原生 App WebView 运行时的 Hybrid App H5 项目。

## 技术栈

- Next.js
- React
- TypeScript
- Tailwind CSS
- CSS Variables 动态主题

## 运行模型

- H5 运行在 iOS 和 Android WebView 中。
- 页面可以远程加载。
- 部分静态页面可以随原生 App 打包。
- manifest 控制版本、灰度、回滚和资源路由。
- Native Bridge 为 H5 提供原生能力。

## 当前 AI 指令

当前阶段以工程化工作流和基础设施为主。除非后续任务明确要求，不实现业务页面或业务行为。

## 重要文档

- `AGENTS.md`
- `docs/00_PROJECT_OVERVIEW.md`
- `docs/01_ARCHITECTURE.md`
- `docs/02_NATIVE_BRIDGE_SPEC.md`
- `docs/03_RELEASE_SPEC.md`
- `docs/04_THEME_SPEC.md`
- `docs/05_API_SPEC.md`
- `docs/06_CODING_RULES.md`
- `docs/07_AI_WORKFLOW.md`
- `docs/08_CHANGELOG.md`
- `docs/09_DECISIONS.md`

## 已知约束

- WebView 能力会因原生 App 版本和平台不同而不同。
- Bridge 能力必须检测后再调用。
- manifest 与静态包兼容性必须写入文档。
- 主题 token 必须有安全默认值。
- 面向协作的文档优先使用中文；代码标识符、文件名和命令名保留英文。

## 后续 Agent 启动方式

先读 `AGENTS.md`，再读本文件、`.ai/PROJECT_STATE.md`、`.ai/TODO.md` 和相关文档。
