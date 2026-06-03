# 08 变更记录

所有重要的项目、工作流、架构、发布、Bridge、主题和 API 变更都记录在这里。

## 格式

```markdown
## YYYY-MM-DD - <标题>

### 新增

### 变更

### 废弃

### 移除

### 修复

### 安全

### 验证
```

## Unreleased

### 新增

- 初始化 Hybrid App H5 AI 工程化工作流文档结构。
- 添加项目级 Codex Skills：任务创建、规划、实现、测试、审查、归档、发布准备和回滚。
- 添加 `scripts/ai/` 下的最小可运行 AI 辅助脚本，以及 `package.json` 的 `ai:*` 命令。
- 添加 AI 工作流自检、任务计划、任务验证、任务审查和发布准备编排脚本。
- 初始化 Next.js App Router、React、TypeScript、Tailwind CSS 和 Vitest 基础工程骨架。
- 添加 `src/app`、`src/lib/*`、`src/styles` 等首版源码边界。
- 添加 CSS Variables 默认主题 token 和 Tailwind token 映射。
- 添加 Root Manifest 类型、灰度规则类型和 `resolveH5Version(ctx, manifest)` 版本解析函数。
- 添加类型化 Native Bridge adapter、Web mock、首批 Bridge 方法和统一错误结构。
- 添加 manifest、app-config、theme-config 类型和本地 schema 校验函数。
- 添加 light/dark 主题 token、主题 allowlist 和运行时应用 API。
- 添加 API Client 类型、request wrapper、Bridge token 来源、requestId 注入、超时和错误归一化。
- 添加 telemetry 事件类型、noop reporter、白屏检测策略和首屏性能事件构造。
- 添加电商模拟页面、静态缺省 HTML 和 OSS 配置模板。
- 添加 commitlint 和 husky，接入 Git 提交信息规范检查。
- 添加 OSS 配置模板目录 `ossDirectory: "/hybird"`。
- 添加客户端 manifest runtime，支持远程拉取、schema 校验、last-known-good 缓存、版本解析和路由加载结果。
- 添加 `ai:prepare-oss-release`，生成本地 OSS 上传计划草案。
- 添加 `ai:prepare-oss-release --check-config` 参数体检和 `--execute` 真实 OSS 上传入口。
- 添加发布脚本 manifest schema 回归测试。
- 添加 Next.js 静态导出配置，支持按 OSS 版本目录注入 `H5_BASE_PATH` 和 `H5_ASSET_PREFIX`。
- 添加真实 OSS smoke 上传记录，版本目录为 `/hybird/h5/prod/2026.05.15-static-smoke/`。
- 添加 `ai:smoke-oss-release`、`ai:publish-oss-manifest`、`ai:prepare-release-pointers` 和 `ai:refresh-cdn`。
- 添加手动 GitHub Actions H5 发布流水线。
- 添加 Next.js SSR/standalone 发布产物归档流程。
- 添加 SSR-only 发布计划脚本、SSR smoke 脚本和 SSR release 配置模板。
- 添加 manifest 本地解析脚本，用于体验 SSR 切流和回滚命中结果。
- 添加 `/api/health` 健康检查接口。
- 添加 server-meumall active manifest HTTP fetcher，支持环境变量默认 URL 和测试注入 `fetchImpl`。
- 添加 Mac Studio 本地 Jenkins H5 参数化构建链路，构建完成后通过 SSH/rsync 上传 SSR standalone 产物到云服务器 release 目录。
- 添加 `public/assets` 静态资源目录规范和 `assetUrl()` 统一资源路径 helper。
- 添加首页 Bridge 调试面板，可在 H5 首页测试 `router/event/rpc` 统一信封能力。
- 添加 `src/lib/bridge/protocol-bridge.ts`，支持 `bridgeHandler`、`__bridgeHandler.resolve/reject/emit`、callbackId 和超时。
- 添加 H5 BFF HTTP 鉴权基础：服务端 Cookie auth、Java/Python 后端 registry、backend client、浏览器端 BFF client 和 BFF 响应转换。
- 添加首页原生传参展示面板，展示完整 Cookie 值、`meu_page_config`、URL 参数和 H5 环境信息，用于内部联调。

### 变更

- H5 route 清单移除旧兼容入口，智能体不再提供 H5 占位页面。
- 页面右上角版本标识改为显式 DOM 节点，方便 App 联调和截图确认。
- 将面向协作的项目文档、AI 状态文档、任务文件和 Skill 文档转换为中文。
- 将 `task-create` Skill 升级为对话式任务创建流程，支持自然语言输入、多轮澄清、草案确认后落盘。
- 增强 `archive-task`，要求验证和审查通过后才能归档任务。
- 使用 `pnpm` 作为应用工程包管理器。
- 使用 Vitest 作为首版测试运行器。
- 补充本地 manifest resolver 的优先级和 fallback 发布规则。
- 补充 Native Bridge 首版 H5 adapter 协议、默认 namespace、Web mock 和方法契约。
- 补充 H5/App/config 三类版本、不可变资源目录、`latest` 指针和客户端非敏感配置边界。
- 补充 light/dark 主题 runtime、fallback 和 allowlist 规则。
- 补充 API client 首版请求规则、错误码、鉴权 token 来源和可注入请求边界决策。
- 补充 telemetry 模块边界、白屏检测基础策略、首屏性能指标和 noop reporter 决策。
- 补充模拟电商路由、静态 fallback 资源和 OSS 配置模板说明。
- 补充 Conventional Commits 提交格式、中文描述规则和本地检查命令。
- 补充 OSS 配置模板中 bucket 内目录、CDN 公开地址和发布前缀的边界说明。
- 统一 `ai:release-prepare`、`ai:update-manifest` 和 `ai:rollback` 的 manifest 草案结构为 `ManifestFile` schema。
- 补充发布规范中的产物结构、缓存策略、客户端加载策略、灰度语义、回滚行为和 CI/CD 建议。
- 补充 OSS 环境变量覆盖、root endpoint 要求和真实上传前参数体检说明。
- 调整 OSS public base URL 约定，直接使用 bucket 公网域名时必须包含 `/hybird/h5`。
- 上传计划记录 `contentDisposition: "inline"`，发布脚本上传对象时显式写入 inline 元数据。
- 发布流程补充 candidate manifest、latest 辅助指针、CDN 刷新计划和 CI smoke gate。
- 修正发布脚本生成的 manifest assets 语义：`cdnBaseUrl` 只保留域名根，版本路径由 `immutablePathPattern` 表达。
- 完善 `2026.05.15-static-smoke` manifest 草案，补全商品详情、fallback 路由和静态导出对象路径。
- 将默认远程发布从 Next.js 静态导出切回 SSR/standalone 构建；OSS 静态上传方案降级为静态包、fallback 或可选 CDN 静态资源方案。
- 当前 App Router 根 layout 显式设置 `dynamic = "force-dynamic"`，避免 mock 页面在接入真实接口前被自动静态优化。
- 调整 `.github/workflows/h5-release.yml`，默认归档 `.next/standalone`、`.next/static`、`public` 和 release 草案，不再自动上传 `out/` 到 OSS。
- 将 manifest 资源模型从静态版本目录收敛为 SSR 服务入口：`serviceBaseUrl`、`basePath`、`staticAssetPath` 和 `healthCheckPath`。
- 移除默认配置面的 OSS/SSG 发布入口，`.env.example` 改为 SSR 服务变量。
- active manifest 来源明确为 server-meumall，H5 通过 `NEXT_PUBLIC_H5_MANIFEST_URL` 或 `H5_MANIFEST_URL` 拉取。
- 本地配置中心闭环已跑通：`server-meumall` 使用 FastAPI + SQLite 管理 manifest 配置，`admin-meumall` 提供配置发布后台，hybird 通过 active manifest endpoint 获取配置。
- 新增 `ai:prepare-standalone-assets`，用于将 `.next/static` 和 `public` 复制到 `.next/standalone` 运行目录，修复直接运行 standalone SSR 时 `_next/static` CSS/JS 404 的问题。
- 新增 H5 本地多版本演练标识：通过 `H5_RELEASE_VARIANT` 和 `H5_RELEASE_LABEL` 区分 blue、green、rose 三份 SSR 服务，便于 admin 切 active manifest 后在 iOS WebView 中确认效果。
- 本地 Jenkins H5 Pipeline 改为启动 detached 本机构建脚本并轮询状态，构建脚本使用本地 Git mirror 缓存降低 GitHub 连接失败对演练的影响。
- 本地 Jenkins agent 固化代理环境，构建脚本通过 SSH tunnel 注册 release，并为激活后的 H5 smoke 增加重试等待。
- 服务器 nginx `/hybird` 入口改为直接代理 H5，修复 `/hybird` 与 `/hybird/` 之间的重定向循环。
- manifest `assets` 增加可选 `publicAssetBaseUrl`，`release-prepare`、`update-manifest` 和 `register-release` 支持 `--public-asset-base-url`。
- 发布规范补充 H5 内置资源、业务动态图片、CDN 和原生离线包的职责边界。
- Native Bridge 从旧 `MeumallNativeBridge.call(method, payload)` 扩展为统一信封调试 runtime；旧入口暂不删除，新联调优先使用 `navigate`、`emit`、`rpc` 和 `on`。
- API 鉴权推荐方案从浏览器端直接读取 token 调后端，调整为 App 写 Cookie、Next BFF 读取 Cookie、服务端转 Authorization 调 Java/Python 后端。
- 原生传参展示调整为内部调试口径：展示完整 Cookie 值，后续正式开放前必须删除或关闭。

### 废弃

- 修正静态导出产物的 `_next/static` 资源引用，避免部署到 `/hybird/h5/prod/<version>/` 后仍访问 bucket 根路径。
- OSS/SSG 发布配置已由 SSR-only 发布模型取代。

### 移除

- 无。

### 修复

- 无。

### 安全

- 无。

### 验证

- 已确认项目级 Codex Skills 存在并包含必需工作流章节。
- 已确认 AI 辅助脚本支持 help、参数校验、本地烟测和非法参数非 0 退出。
- 本轮使用 AI 工作流自动化完善任务完成一次完整闭环演练。
- 已通过真实 OSS smoke 上传和公网 `curl` 验证静态 HTML/JS 对象可访问。
- 已通过 release ops 单测、真实 OSS smoke、manifest candidate 上传和公网 manifest 读取验证。
- 已通过 Next.js SSR/standalone 构建、standalone 产物检查、本地 SSR 服务 smoke 和 SSR release 脚本测试。
- 已通过 SSR 切流与回滚本地演练，覆盖稳定用户、灰度用户和异常版本回滚。
- 已通过 `pnpm install --frozen-lockfile`、`pnpm build`、`pnpm typecheck`、`pnpm lint`、`pnpm test` 和 `pnpm run ai:check-workflow --strict`。
- 已通过 server-meumall active manifest fetcher 的红绿测试，覆盖成功、非 2xx 和 JSON 解析失败路径。
- 已通过 `pnpm test -- src/config/manifest.test.ts`、`pnpm test`、`pnpm typecheck` 和 `pnpm lint`。
- 已通过 Bridge adapter 单测、全量测试、类型检查、lint 和 AI 工作流检查。
- 已通过 Cookie auth、backend registry、backend client、BFF response 和 H5 client 目标测试验证 BFF 鉴权基础。
- 已通过 native runtime context 目标测试验证原生传参调试信息。
- 已通过远程配置 schema 单测、全量测试、类型检查、lint 和 AI 工作流检查。
- 已通过 theme runtime 单测、全量测试、类型检查、lint 和 AI 工作流检查。
- 已通过 API client 单测、全量测试、类型检查、lint 和 AI 工作流检查。
- 已通过 telemetry 单测、全量测试、类型检查、lint 和 AI 工作流检查。
- 已通过电商 mock 数据和 OSS 配置模板单测。
- 已通过模拟电商页面全量测试、类型检查、lint、生产构建、AI 工作流检查和浏览器抽查。
- 已通过 commitlint 正反向样例、husky commit-msg hook、全量测试、类型检查、lint、生产构建和 AI 工作流检查。
- 已通过 OSS 配置模板 bucket 内目录单测。
- 已通过客户端 manifest runtime、发布 manifest 脚本和 OSS 上传计划测试。
- 已通过 OSS 参数体检测试，当前 `.env.example` 可用于真实 OSS smoke 上传；正式 CI 仍应使用安全环境变量或密钥管理注入参数。
- 已通过 Jenkins build #7 构建并上传 `2026.05.16-local-smoke-007`，远端 `standalone/server.js` 和 `deploy.json` 校验通过。
- 已通过 Jenkins build #11 完整验证：测试、类型检查、SSR 构建、release 注册、远端激活和公网 smoke 均通过。
- 已验证 `http://118.196.24.12/hybird`、`/hybird/`、`/` 不再出现无限重定向。
- 已通过 `src/lib/bridge/protocol-bridge.test.ts`、`pnpm typecheck` 和 `pnpm build` 验证首页 Bridge 调试面板。
## 2026-05-15 - 归档任务

### 变更

- 完善 AI 工作流自动化并完成完整任务闭环演练

### 验证

- 语法检查、docs sync、workflow check、release-prepare 烟测、archive-task 失败路径、task-test 和 task-review 均通过
## 2026-05-15 - 归档任务

### 变更

- 初始化 H5 基础工程架构

### 验证

- pnpm install --frozen-lockfile、pnpm build、pnpm typecheck、pnpm lint、pnpm test、pnpm run ai:check-workflow --strict、dev server 200 均通过
## 2026-05-15 - 归档任务

### 变更

- 实现 Root Manifest 类型和 resolveH5Version(ctx, manifest)

### 验证

- pnpm test -- src/config/manifest.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过
## 2026-05-15 - 归档任务

### 变更

- 实现 Native Bridge 协议与 Web Mock

### 验证

- pnpm test -- src/lib/bridge/bridge.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过
## 2026-05-15 - 归档任务

### 变更

- 实现 Manifest Schema 与远程配置中心类型

### 验证

- pnpm test -- src/config/remote-config.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过
## 2026-05-15 - 归档任务

### 变更

- 实现 Theme Runtime 与 Light/Dark 切换

### 验证

- pnpm test -- src/lib/theme/runtime.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过
## 2026-05-15 - 归档任务

### 变更

- 实现 API Client、鉴权与请求追踪基础

### 验证

- pnpm test -- src/lib/api/client.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过
## 2026-05-15 - 归档任务

### 变更

- 实现监控、白屏检测与性能埋点基础

### 验证

- pnpm test -- src/lib/telemetry/telemetry.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过
## 2026-05-15 - 归档任务

### 变更

- 实现模拟电商页面、静态缺省页与 OSS 配置模板

### 验证

- pnpm test、pnpm typecheck、pnpm lint、pnpm build、pnpm run ai:check-workflow --strict 和浏览器抽查均通过
## 2026-05-15 - 归档任务

### 变更

- 落地版本发布与回滚基础机制

### 验证

- pnpm-test-typecheck-lint-build-workflow-and-release-cli-smoke-passed
## 2026-05-15 - 归档任务

### 变更

- 真实OSS平台参数体检与显式上传入口

### 验证

- pnpm-test-typecheck-lint-build-workflow-and-oss-config-check-passed
## 2026-05-16 - 正式发版入口

### 变更

- H5 CI 增加 candidate release 注册入口：`pnpm run ai:register-release`。
- GitHub Actions 增加可选 `register_release` 输入，支持构建归档后注册到 server-meumall。
- server-meumall 增加 release 注册、列表、发布 active、设置灰度和回滚 API。
- admin-meumall 增加“正式发版”操作区，承接候选版本发布、灰度和回滚。

### 验证

- server/admin/hybird 自动化测试和构建通过。
- 本地 FastAPI smoke 已验证注册 candidate、发布 active、灰度和回滚链路。

## 2026-06-01 - 本地工作区路径收敛

### 变更

- 将本地 Jenkins/CI、launchd agent、pipeline 和 H5 构建脚本的运行路径统一到 `/Users/mac/person_code/meu-mall/meumall-ci`。
- 将 H5 本地构建种子仓库路径统一到 `/Users/mac/person_code/meu-mall/hybird-meumall`。
- 移除当前运行配置对旧目录软链接的依赖，便于后续迁移到新机器或新服务器。

### 验证

- 已执行脚本语法检查、Jenkins/Agent 重启验证和旧软链接依赖扫描。
