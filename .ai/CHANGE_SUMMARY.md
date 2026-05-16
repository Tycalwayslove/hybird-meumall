# 变更摘要

## 2026-05-16 - 本地多版本 H5 切换演练

### 变更

- H5 根布局新增 `H5_RELEASE_VARIANT` 和 `H5_RELEASE_LABEL` 支持，页面右上角展示可肉眼识别的版本标识。
- 全局样式新增 blue、green、rose 三套本地演练主题。
- 打包并启动三份 standalone SSR 服务：blue `3109`、green `3110`、rose `3111`。
- 在 `server-meumall` 中创建 `H5 BLUE/GREEN/ROSE 2026.05.16` 三份 manifest 配置，当前 active 恢复为 blue。
- iOS App 增加 manifest 刷新调试入口，便于 admin 切 active 后在 WebView 中立即重新拉取配置。

### 验证

- 已通过 `pnpm typecheck`、`pnpm lint`、`H5_BASE_PATH=/hybird pnpm build` 和 `pnpm run ai:prepare-standalone-assets`。
- 已验证 `3109/3110/3111` 三个 H5 SSR 服务均返回 200，并分别输出 `BLUE/GREEN/ROSE 2026.05.16` 标识。
- 已通过 server publish smoke：green active 切换成功后恢复 blue active。
- 已通过 iOS `Info.plist` / entitlements 校验和 `git diff --check`。

### 后续

- 真机调试时需要把 manifest URL 和各 H5 `serviceBaseUrl` 从 `127.0.0.1` 切换为 Mac 局域网 IP。

## 2026-05-15 - 修复 standalone SSR 静态资源 404

### 变更

- 定位 `/hybird/_next/static/chunks/0fhdp5vz98u_y.css` 404 根因：standalone 运行目录缺少 `.next/standalone/.next/static`。
- 新增 `ai:prepare-standalone-assets`，将 `.next/static` 和 `public` 复制到 `.next/standalone` 运行目录。
- 更新发布规范和 AI 工作流文档，明确直接运行 `.next/standalone/server.js` 前必须准备静态资源。

### 验证

- 已复制当前构建产物静态资源并重启 standalone SSR 服务。
- 已验证 CSS chunk、页面引用的前 10 个 `_next/static` 资源和 `/hybird/category` 均返回 200。
- 已通过 `pnpm run ai:prepare-standalone-assets`、`pnpm run ai:check-workflow --strict` 和 `git diff --check`。

### 后续

- CI/CD 在部署 standalone 产物前应执行 `pnpm run ai:prepare-standalone-assets` 或在打包步骤中等价复制 `.next/static` 与 `public`。

## 2026-05-15 - 跑通本地配置中心闭环

### 变更

- 在 `server-meumall` 落地 Python FastAPI + SQLite manifest 配置中心，支持配置 CRUD、发布 active 和 H5 只读 active manifest。
- 在 `admin-meumall` 落地 Vite + React 配置发布后台，支持编辑 manifest JSON、保存、发布和删除。
- 修正 server seed manifest 和 admin 默认 manifest 为 hybird 当前 `ManifestFile` 对象结构，保证 `grayRules`、`routes`、`assets` 与 H5 schema 一致。
- 修正 admin 对 server snake_case 时间字段和 FastAPI `detail` 错误字段的兼容。

### 验证

- 已通过 `server-meumall` 的 `. .venv/bin/activate && pytest`。
- 已通过 `admin-meumall` 的 `pnpm test` 和 `pnpm build`。
- 已通过 `hybird-meumall` 的 `pnpm exec vitest run src/lib/manifest/server-fetcher.test.ts`、`pnpm typecheck` 和 `pnpm lint`。
- 已通过临时 SQLite 数据库的 HTTP smoke：读取 active manifest、创建 draft、发布 active、重新读取 active。
- 已启动本地联调服务：server `4100`、admin `5173`、hybird SSR `3109`，并验证 active manifest、admin 首页和 `/hybird/category` 均可访问。

### 后续

- 生产化时补充登录权限、审批流、审计日志、配置 diff 和生产数据库迁移。

## 2026-05-15 - 接入 server-meumall active manifest fetcher

### 变更

- 新增 `src/lib/manifest/server-fetcher.ts`，提供 `createHttpManifestFetcher()` 和默认 manifest URL 读取 helper。
- 新增 `src/lib/manifest/server-fetcher.test.ts`，覆盖成功拉取、非 2xx、JSON 解析失败和环境变量优先级。
- 更新 `.env.example`，增加 `NEXT_PUBLIC_H5_MANIFEST_URL` 和 `H5_MANIFEST_URL`，默认指向 server-meumall 本地 active manifest endpoint。
- 更新发布/API 文档、项目状态、TODO、变更记录和决策记录，明确 active manifest 由 server-meumall 提供。

### 验证

- 已先运行 `pnpm test -- src/lib/manifest/server-fetcher.test.ts` 确认新增测试因模块缺失失败。
- 已通过 `pnpm test -- src/lib/manifest/server-fetcher.test.ts`。
- 已通过 `pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm run ai:check-workflow --strict` 和 `git diff --check`。

### 后续

- 使用真实 server-meumall 环境验证 active manifest endpoint、CORS 和 WebView 访问策略。

## 2026-05-15 - SSR 切流与回滚本地演练

### 变更

- 新增 `ai:resolve-manifest`，用于本地观察 manifest 在不同用户、路由和当前版本下的命中结果。
- 新增 `archives/releases/2026.05.15-switch-drill/`，包含 stable、gray、rollback 三份演练 manifest 和操作 README。
- 新增 `.ai/test-reports/2026-05-15-ssr-switch-rollback-drill.md`，记录切流和回滚验证过程。

### 验证

- 已通过本地 SSR 服务 `http://127.0.0.1:3109/hybird` 的 smoke 检查。
- stable manifest 命中 `2026.05.15-001`。
- gray manifest 中 `demo-gray` 命中 `2026.05.15-002`，`demo-stable` 留在 `2026.05.15-001`。
- rollback manifest 将当前异常版本 `2026.05.15-002` 切回 `2026.05.15-001`。

### 后续

- 真实 App 接入后，需要把 `ai:resolve-manifest` 对应的观察结果映射到 WebView 实际加载日志。

## 2026-05-15 - 收敛为 SSR-only 发布与回滚

### 变更

- 将 `ManifestFile.assets` 从静态 CDN 目录模型改为 SSR 服务模型：`serviceBaseUrl`、`basePath`、`staticAssetPath`、`healthCheckPath`。
- 更新 manifest runtime，远程路由 URL 由 SSR 服务地址和路由 path 拼接，不再拼版本目录。
- 更新 `ai:release-prepare`、`ai:update-manifest` 和 `ai:rollback`，发布与回滚只面向 SSR manifest。
- 新增 `config/ssr-release.config.example.json`、`ai:prepare-ssr-release` 和 `ai:smoke-ssr-release`。
- 新增 `/api/health` 健康检查接口。
- 删除默认配置面的 OSS 配置模板、OSS 配置测试、OSS release ops 测试和 OSS 发布脚本；`.env.example` 改为 SSR 服务变量。
- 更新 GitHub Actions、发布规范、架构、编码规则、AI 工作流、状态、TODO、变更记录和决策文档。

### 验证

- 已通过 `H5_BASE_PATH=/hybird pnpm build`，构建输出确认当前路由均为 `ƒ (Dynamic) server-rendered on demand`，且未生成 `out/`。
- 已通过 `ai:release-prepare` 生成 SSR manifest 草案。
- 已通过 `ai:prepare-ssr-release` 生成 SSR 发布计划。
- 已通过本地 standalone 服务和 `ai:smoke-ssr-release`，健康检查和 4 个核心页面 smoke 通过。
- 已通过 `pnpm test`、脚本 Vitest、`pnpm typecheck`、`pnpm lint`、`pnpm run ai:check-workflow --strict` 和 `git diff --check`。

### 后续

- 需要接入真实 SSR 部署平台和 manifest active 发布审批。

## 2026-05-15 - 切回 Next.js SSR 发布模式

### 变更

- 更新 `next.config.ts`，移除静态导出，改为 `output: "standalone"` 的 SSR 构建。
- 更新 `src/app/layout.tsx` 和商品详情页，显式强制当前 App Router 路由动态渲染，并移除商品详情静态参数预生成。
- 更新 `package.json`，补充 `pnpm start`。
- 更新 `.github/workflows/h5-release.yml`，从 `out/` OSS 静态上传流水线改为 SSR standalone 产物归档流水线。
- 更新架构、发布规范、AI 工作流、项目状态、TODO、变更记录和决策文档，明确 OSS 静态上传只保留给静态包、fallback 或独立 CDN 静态资源。

### 验证

- 已通过 `rm -rf .next out && pnpm build && test -f .next/standalone/server.js && test -d .next/static && test ! -d out`，构建输出确认当前路由均为 `ƒ (Dynamic) server-rendered on demand`。
- 已通过 `PORT=3106 HOSTNAME=127.0.0.1 pnpm start` 启动本地 standalone 服务，并用 `curl -I` 验证 `/`、`/category`、`/product/p-1001` 均返回 `200 OK` 和 `text/html`。
- 已通过 `pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm run ai:check-workflow --strict` 和 `git diff --check`。

### 后续

- 需要确认 SSR 部署平台、`H5_ORIGIN`、健康检查、日志采集和 active manifest 发布审批。

## 2026-05-15 - 完善 static smoke manifest 草案

### 变更

- 修正 `ai:release-prepare` 和 `ai:update-manifest` 的 assets 生成逻辑，避免 `cdnBaseUrl` 和 `immutablePathPattern` 重复包含 `/hybird/h5/prod`。
- 完善 `archives/releases/2026.05.15-static-smoke/manifest.draft.json`：
  - `cdnBaseUrl` 调整为 OSS 公网域名根。
  - 远程路由 `path` 指向真实静态导出对象，例如 `index.html`、`category/index.html`。
  - 补全 6 个商品详情静态路由。
  - 补全 `/offline`、`/not-found`、`/error`、`/maintenance` 本地 fallback 路由。
  - 补充灰度平台范围、最低 App 版本和远程 fallback URL。
- 更新 release note、build metadata、发布规范、变更记录和决策文档。
- 已重新生成 manifest 发布计划，并同步上传 candidate manifest，不覆盖 active `manifest.json`。

### 验证

- 已先运行 `pnpm exec vitest run --config scripts/ai/vitest.config.ts scripts/ai/release-manifest.test.ts` 并确认旧 assets 生成逻辑导致测试失败。
- 已通过 `pnpm exec vitest run --config scripts/ai/vitest.config.ts scripts/ai/release-manifest.test.ts`。
- 已通过 manifest 草案结构和 route URL 拼接检查。
- 已通过 `pnpm run ai:publish-oss-manifest ... --stage candidate --execute` 上传 2 个 candidate manifest 对象。
- 已通过公网读取 `manifest.candidate.json`，确认 `routeCount = 14` 且 `/` 拼接到 `.../index.html`。

### 后续

- active manifest 仍未覆盖，需发布审批后执行。
- OSS/CDN 强制下载响应头仍需在外部平台侧修复。

## 2026-05-15 - 补齐发布运维脚本和手动 CI/CD

### 变更

- 新增 `ai:smoke-oss-release`，读取 `oss-upload-plan.json` 后检查关键 HTML、CSS 和 JS 的公网可访问性、content-type、cache-control 和强制下载头。
- 新增 `ai:publish-oss-manifest`，生成 manifest candidate/active 发布计划，并支持显式 `--execute` 上传到 OSS。
- 新增 `ai:prepare-release-pointers`，生成 `latest/` 辅助指针计划，只覆盖 HTML、config 和 fallback，不镜像 `_next/static` 不可变资源。
- 新增 `ai:refresh-cdn`，生成 CDN 刷新计划，并可构造阿里云 CDN `RefreshObjectCaches` 签名请求。
- 新增 `.github/workflows/h5-release.yml` 手动发布流水线，串联质量检查、静态构建、OSS 上传、smoke、candidate manifest、latest 指针计划和 CDN 刷新计划。
- 为 release ops 增加 Vitest 回归测试。
- 已对 `2026.05.15-static-smoke` 生成 release pointer/CDN refresh/manifest publish 计划，并真实上传 candidate manifest。

### 验证

- 已先运行 `pnpm exec vitest run --config scripts/ai/vitest.config.ts scripts/ai/release-ops.test.ts` 并确认新增脚本缺失导致失败。
- 已通过 `pnpm exec vitest run --config scripts/ai/vitest.config.ts scripts/ai/release-ops.test.ts`，5 个测试通过。
- 已通过 `pnpm run ai:smoke-oss-release --plan archives/releases/2026.05.15-static-smoke/oss-upload-plan.json --routes index.html,category/index.html --allow-force-download`，4 个关键资源返回 200。
- 严格 `ai:smoke-oss-release` 已验证会因当前 OSS 强制下载响应头失败，可作为 CI 阻断门禁。
- 已通过 `pnpm run ai:prepare-release-pointers ...` 和 `pnpm run ai:refresh-cdn ...` 生成计划。
- 已通过 `pnpm run ai:publish-oss-manifest ... --stage candidate --execute` 上传 2 个 manifest 对象。
- 已通过公网 `curl` 验证 `manifest.candidate.json` 返回 200 且内容可解析。
- 已通过 `pnpm test`、`pnpm typecheck` 和 `pnpm lint`。

### 后续

- 关闭 OSS/CDN 强制下载响应头后，CI smoke 可改为严格通过并阻断错误平台配置。
- 配置 GitHub Actions secrets、受保护环境和 CDN 刷新权限后，再执行远端 workflow。
- active manifest 覆盖仍需人工审批，不在本次自动执行。

## 2026-05-15 - 补构建静态产物并上传 OSS smoke 版本

### 变更

- 更新 `next.config.ts`，启用 `output: "export"`，并支持通过 `H5_BASE_PATH`、`H5_ASSET_PREFIX` 构建可部署到 OSS 版本目录的静态产物。
- 更新 `.env.example` 和 `config/oss.config.example.json`，使 `OSS_PUBLIC_BASE_URL`/`publicBaseUrl` 对齐 bucket 内目录 `/hybird/h5`。
- 更新 `ai:prepare-oss-release` 上传计划和 PutObject 元数据，记录并尝试写入 `contentDisposition: "inline"`。
- 重新构建 `out/` 并上传真实 OSS smoke 版本 `2026.05.15-static-smoke`。
- 更新发布规范、变更记录、决策文档和验证报告。

### 验证

- 已通过 `pnpm test -- config/oss-config.test.ts`。
- 已通过 `pnpm run ai:prepare-oss-release --version 2026.05.15-static-smoke --environment prod --env-file .env.example --check-config`。
- 已通过带 `H5_BASE_PATH` 和 `H5_ASSET_PREFIX` 的 `pnpm build`。
- 已通过 `ai:prepare-oss-release --execute` 上传 112 个对象到 OSS。
- 已通过公网 `curl -I` 验证 `index.html`、`category/index.html` 和 `_next/static` JS 资源返回 200。
- 已验证远程 HTML 内容包含版本目录下的 `_next/static` 资源前缀和站内链接前缀。
- 已通过 `pnpm test`、`pnpm typecheck`、`pnpm lint` 和 `pnpm run ai:check-workflow --strict`。

### 后续

- OSS 当前仍返回 `Content-Disposition: attachment` 和 `x-oss-force-download: true`，需要在 OSS bucket 或 CDN 侧关闭强制下载/覆盖响应头。
- 接入 CDN 刷新和正式 manifest 发布审批。

## 2026-05-15 - 落地版本发布与回滚基础机制

### 变更

- 新增客户端 manifest runtime，支持远程拉取、schema 校验、last-known-good 缓存、版本解析和路由加载结果。
- 统一 `ai:release-prepare`、`ai:update-manifest` 和 `ai:rollback` 输出/修改的 manifest 草案为 `ManifestFile` schema。
- 新增 `ai:prepare-oss-release`，基于 OSS 配置和本地构建目录生成 `oss-upload-plan.json`。
- 更新 `config/oss.config.example.json` 的 `remotePrefix` 为 `h5`，避免 OSS 对象路径重复环境名。
- 更新发布、架构、编码规则、AI 工作流、变更记录和决策文档。
- 新增 `.ai/tasks/2026-05-15-release-rollback-system-implementation.md`。

### 验证

- 已通过 `pnpm test -- config/oss-config.test.ts`。
- 已通过 `pnpm exec vitest run --config scripts/ai/vitest.config.ts scripts/ai/release-manifest.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。
- 已通过 `pnpm build`。
- 已通过 `pnpm run ai:check-workflow --strict`。
- 已通过 release prepare、prepare OSS release 和 rollback CLI 烟测。

### 后续

- 接入真实 OSS 上传、CDN 刷新和 manifest 发布审批。
- 明确 manifest 最终由原生 App、H5 runtime 或两者共同拉取。

## 2026-05-15 - 接入真实 OSS 平台参数体检

### 变更

- 为 `ai:prepare-oss-release` 增加 `--check-config` 参数体检模式。
- 为 `ai:prepare-oss-release` 增加 `--env-file` 支持，从 `.env.local` 或 `.env.example` 读取 OSS 参数并覆盖配置模板。
- 为 `ai:prepare-oss-release` 增加显式 `--execute` 真实 OSS PutObject 上传入口。
- 增加 OSS V1 Authorization Header 签名构造、STS token header 支持和 Cache-Control 对象元数据写入。
- 更新发布规范、AI 工作流、变更记录和 AI 状态文件。

### 验证

- 已通过 `pnpm test -- config/oss-config.test.ts`。
- 已运行 `pnpm run ai:prepare-oss-release --version 2026.05.15-verify --environment prod --env-file .env.example --check-config`。
- 当前体检结果：AK/SK 已可读取，但 `OSS_BUCKET`、`OSS_REGION`、`OSS_ENDPOINT` 和 `OSS_PUBLIC_BASE_URL`/CDN public base URL 仍缺真实值或仍为占位符。
- 已通过 `pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm build` 和 `pnpm run ai:check-workflow --strict`。

### 后续

- 补齐真实 OSS bucket、region、root endpoint 和 CDN public base URL 后，再执行 `--check-config`。
- 体检通过后，可使用 `--execute` 执行真实 OSS 上传。

## 2026-05-15 - 补充 OSS bucket 内目录配置

### 变更

- 更新 `config/oss.config.example.json`，新增 `ossDirectory: "/hybird"`。
- 更新 `config/oss-config.test.ts`，覆盖 OSS 配置模板 bucket 内目录字段。
- 更新 `docs/03_RELEASE_SPEC.md`、`docs/08_CHANGELOG.md`、`docs/09_DECISIONS.md` 和 AI 状态文件。

### 验证

- 已先运行 `pnpm test -- config/oss-config.test.ts` 并确认测试因缺少 `ossDirectory` 失败。
- 已通过 `pnpm test -- config/oss-config.test.ts`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。
- 已通过 `pnpm run ai:check-workflow --strict`。

### 后续

- 后续实现真实 OSS 上传脚本时，应继续区分 `ossDirectory`、`publicBaseUrl` 和 `remotePrefix`。

## 2026-05-15 - 接入 Git 提交信息规范检查

### 变更

- 新增 `commitlint.config.cjs`，采用 `@commitlint/config-conventional` 并允许中文提交描述。
- 新增 `.husky/commit-msg`，提交时自动执行 commitlint。
- 更新 `package.json`，增加 `prepare` 和 `lint:commit` 脚本。
- 更新 `docs/06_CODING_RULES.md`、`docs/07_AI_WORKFLOW.md` 和 `.ai/PROJECT_STATE.md`。

### 验证

- 已通过规范提交信息样例：`chore(git): 接入提交信息规范检查`。
- 已确认非规范提交信息样例会失败：`接入提交信息规范检查`。
- 已通过 `.husky/commit-msg` 正反向检查。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。
- 已通过 `pnpm build`。
- 已通过 `pnpm run ai:check-workflow --strict`。

### 后续

- 后续可按需接入 commitizen 或 changelog 生成工具。

## 2026-05-15 - 实现模拟电商页面、静态缺省页与 OSS 配置模板

### 变更

- 新增本地电商 mock 数据和测试。
- 新增首页、分类页、商品详情页、购物车页和我的页。
- 新增电商共享组件：页面壳、底部导航、商品卡片和色块 icon 占位。
- 新增 `public/static/fallback/` 下的 offline、not-found、error、maintenance 静态 HTML。
- 新增 `config/oss.config.example.json` 和 `.env.example`。
- 更新发布、架构、编码规则和决策文档。
- 更新 `.ai/PROJECT_STATE.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。

### 验证

- 已先运行 `pnpm test -- src/lib/commerce/mock-data.test.ts config/oss-config.test.ts` 并确认测试因模块缺失失败。
- 已通过 `pnpm test -- src/lib/commerce/mock-data.test.ts config/oss-config.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。
- 已通过 `pnpm build`。
- 已通过 `pnpm run ai:check-workflow --strict`。
- 已通过浏览器抽查 `/`、`/category`、`/product/p-1001`、`/cart`、`/profile` 和 `/static/fallback/offline.html`。

### 后续

- 后续可接入真实 icon、真实业务接口和 OSS 上传脚本。

## 2026-05-15 - 创建模拟电商页面与静态资源任务

### 变更

- 新增 `.ai/tasks/2026-05-15-commerce-mock-pages-static-fallback-oss-config.md`。
- 更新 `.ai/TODO.md`，将模拟电商页面、静态缺省页与 OSS 配置模板加入 Active。

### 验证

- 任务创建阶段未修改业务实现。

### 后续

- 按任务计划实现模拟页面、静态缺省资源和 OSS 配置模板。

## 2026-05-15 - 实现监控、白屏检测与性能埋点基础

### 变更

- 新增 `src/lib/telemetry/types.ts`，定义错误、性能、白屏和通用埋点事件类型。
- 新增 `src/lib/telemetry/reporter.ts`，实现 `TelemetryReporter` interface、noop reporter 和 telemetry client。
- 新增 `src/lib/telemetry/white-screen.ts`，实现白屏采样评估纯函数。
- 新增 `src/lib/telemetry/performance.ts`，实现首屏性能事件构造。
- 新增 `src/lib/telemetry/index.ts`，统一导出 telemetry 模块边界。
- 新增 `src/lib/telemetry/telemetry.test.ts`，覆盖事件类型、noop reporter、client 上报、错误归一化、白屏阈值和首屏性能事件。
- 更新 `docs/01_ARCHITECTURE.md`、`docs/06_CODING_RULES.md` 和 `docs/09_DECISIONS.md`，记录 telemetry 边界、白屏策略和首版 noop reporter 决策。
- 更新 `.ai/PROJECT_STATE.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。

### 验证

- 已先运行 `pnpm test -- src/lib/telemetry/telemetry.test.ts` 并确认测试因 `./index` 缺失失败。
- 已通过 `pnpm test -- src/lib/telemetry/telemetry.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。
- 已通过 `pnpm run ai:check-workflow --strict`。

### 后续

- 后续需确认真实 Sentry/埋点平台、白屏采样点、采样率和隐私脱敏策略。

## 2026-05-15 - 实现 API Client、鉴权与请求追踪

### 变更

- 新增 `src/lib/api/types.ts`，定义 `ApiResult<T>`、`ApiError`、`RequestMeta`、client 配置和请求选项。
- 新增 `src/lib/api/errors.ts`，实现统一 API 错误构造。
- 新增 `src/lib/api/client.ts`，实现 base URL 拼接、requestId/header 注入、Bridge token 来源、JSON 请求、超时和错误归一化。
- 更新 `src/lib/api/index.ts`，统一导出 API client、错误和类型。
- 新增 `src/lib/api/client.test.ts`，覆盖成功、base URL、requestId、Bridge token、token 缺失、鉴权失败、网络失败和超时。
- 更新 `docs/05_API_SPEC.md` 和 `docs/09_DECISIONS.md`，记录首版 API client 行为和架构决策。
- 更新 `.ai/PROJECT_STATE.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。

### 验证

- 已先运行 `pnpm test -- src/lib/api/client.test.ts` 并确认测试因 `./client` 缺失失败。
- 已通过 `pnpm test -- src/lib/api/client.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。
- 已通过 `pnpm run ai:check-workflow --strict`。

### 后续

- 后续需确认真实 base URL、token 刷新、重新登录和原生代理策略。

## 2026-05-15 - 实现 Theme Runtime 与 Light/Dark 切换

### 变更

- 更新 `src/lib/theme/tokens.ts`，新增 light/dark 主题变量和变量 allowlist。
- 新增 `src/lib/theme/runtime.ts`，实现 `getThemeConfig`、`sanitizeThemeVariables` 和 `applyTheme`。
- 更新 `src/lib/theme/index.ts`，统一导出主题 runtime API。
- 更新 `src/styles/globals.css`，补充 `[data-theme="dark"]` CSS fallback。
- 新增 `src/lib/theme/runtime.test.ts`，覆盖 light、dark、fallback、allowlist 和变量应用。
- 更新 `docs/04_THEME_SPEC.md`、`.ai/PROJECT_STATE.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。

### 验证

- 已先运行 `pnpm test -- src/lib/theme/runtime.test.ts` 并确认测试因 runtime API 缺失失败。
- 已通过 `pnpm test -- src/lib/theme/runtime.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。

### 后续

- 后续可补充品牌主题、远程主题拉取、用户偏好持久化和对比度检查。

## 2026-05-15 - 实现 Manifest Schema 与远程配置中心

### 变更

- 新增 `src/config/remote-config.ts`，定义 `ManifestFile`、`AppConfigFile`、`ThemeConfigFile` 和本地校验函数。
- 新增 `src/config/remote-config.test.ts`，覆盖合法 manifest、缺字段、版本黑名单、灰度配置、路由交付、敏感配置拒绝和 theme config。
- 更新 `docs/03_RELEASE_SPEC.md`，记录 manifest/app-config/theme-config 结构、三类版本、不可变资源目录、`latest` 指针和客户端非敏感配置边界。
- 更新 `.ai/PROJECT_STATE.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。

### 验证

- 已先运行 `pnpm test -- src/config/remote-config.test.ts` 并确认测试因模块缺失失败。
- 已通过 `pnpm test -- src/config/remote-config.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。

### 后续

- 确认 manifest 托管、缓存、灰度归属，以及由 H5 还是原生负责拉取 manifest。

## 2026-05-15 - 实现 Native Bridge 协议与 Web Mock

### 变更

- 新增 `src/lib/bridge/types.ts`，定义首批 Bridge 方法、请求/响应类型、`BridgeResult<T>` 和 `BridgeError`。
- 新增 `src/lib/bridge/errors.ts`，统一 Bridge 错误构造。
- 新增 `src/lib/bridge/web-mock.ts`，提供 Web mock adapter。
- 新增 `src/lib/bridge/native-adapter.ts`，封装 `window.MeumallNativeBridge.call`。
- 更新 `src/lib/bridge/index.ts`，导出 `nativeBridge`、adapter factory、类型和默认边界信息。
- 新增 `src/lib/bridge/bridge.test.ts`，覆盖 Web mock、方法不存在、Bridge 不可用、超时、原生异常和 window adapter。
- 更新 `docs/02_NATIVE_BRIDGE_SPEC.md`、`.ai/PROJECT_STATE.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。

### 验证

- 已先运行 `pnpm test -- src/lib/bridge/bridge.test.ts` 并确认测试因能力缺失失败。
- 已通过 `pnpm test -- src/lib/bridge/bridge.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。

### 后续

- 与原生团队确认最终 namespace、通信协议和首批方法最低 App 版本。

## 2026-05-15 - 创建第一批运行时基础能力任务

### 变更

- 新增 `.ai/tasks/2026-05-15-native-bridge-adapter-and-web-mock.md`。
- 新增 `.ai/tasks/2026-05-15-manifest-schema-and-remote-config.md`。
- 新增 `.ai/tasks/2026-05-15-theme-runtime-light-dark.md`。
- 新增 `.ai/tasks/2026-05-15-api-client-auth-tracing.md`。
- 新增 `.ai/tasks/2026-05-15-telemetry-white-screen-performance.md`。
- 更新 `.ai/TODO.md`，将第一批基础能力任务加入 Active，并将静态包、离线兜底、业务目录和 UI 组件库事项放入 Backlog。

### 验证

- 仅创建任务文档和 TODO 记录，未修改业务代码或实现文件。

### 后续

- 逐个使用 `task-plan` 为第一批任务制定实现计划。

## 2026-05-15 - 实现 Root Manifest Resolver

### 变更

- 新增 `src/config/manifest.ts`，导出 `RootManifest`、`GrayRules`、`ResolveH5VersionContext` 和 `resolveH5Version(ctx, manifest)`。
- 新增 `src/config/manifest.test.ts`，覆盖 stable、gray、force、blacklist、rollback 和 fallback 行为。
- 更新 `docs/03_RELEASE_SPEC.md`，记录本地版本解析优先级和 fallback 规则。
- 更新 `docs/09_DECISIONS.md`，记录 Root Manifest 本地版本解析优先级决策。
- 更新 `.ai/PROJECT_STATE.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。

### 验证

- 已先运行 `pnpm test -- src/config/manifest.test.ts` 并确认测试因模块缺失失败。
- 已通过 `pnpm test -- src/config/manifest.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。

### 后续

- 补充 manifest schema 校验任务，统一字段名和发布平台结构。

## 2026-05-15 - 实现 H5 基础工程架构

### 变更

- 初始化 Next.js App Router、React、TypeScript、Tailwind CSS、pnpm 和 Vitest 工程骨架。
- 新增 `src/app` 最小 App Shell、`src/styles/globals.css` 默认主题变量和 `src/lib/*` 运行时模块边界。
- 新增 Tailwind、PostCSS、Vitest、ESLint、TypeScript 和 Next.js 配置。
- 新增 `.gitignore` 和 `pnpm-lock.yaml`。
- 更新架构、主题、编码规则、AI 工作流、变更记录、决策记录和项目状态。

### 验证

- 已通过 `pnpm install --frozen-lockfile`。
- 已通过 `pnpm build`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。
- 已通过 `pnpm test`。
- 已通过 `pnpm run ai:check-workflow --strict`。
- 已启动 `pnpm dev`，并通过 `curl -I http://localhost:3000` 确认返回 200。

### 后续

- 使用 `task-test` 和 `task-review` 完成任务验证与审查记录后归档。

## 2026-05-15 - 规划 H5 基础工程架构任务

### 变更

- 更新 `.ai/tasks/2026-05-15-h5-foundation-architecture.md`，补充 `## 计划` 章节。
- 明确基础工程架构任务的影响范围、文件影响、实施步骤、验证计划、风险和待确认问题。

### 验证

- 计划阶段未修改业务代码或工程实现。

### 后续

- 使用 `task-implement` 按计划初始化 Next.js App Router、pnpm、Tailwind 和 Vitest 工程骨架。

## 2026-05-15 - 创建 H5 基础工程架构任务

### 变更

- 新增 `.ai/tasks/2026-05-15-h5-foundation-architecture.md`。
- 将 H5 基础工程架构任务加入 `.ai/TODO.md`。
- 记录已确认技术选型：Next.js App Router、pnpm、Vitest。

### 验证

- 仅创建任务文档和 TODO 记录，未修改业务代码或实现文件。

### 后续

- 使用 `task-plan` 为 H5 基础工程架构任务制定实现计划。

## 2026-05-15 - 完善 AI 工作流自动化

### 变更

- 新增 `scripts/ai/check-workflow.ts`。
- 新增 `scripts/ai/plan-task.ts`、`scripts/ai/test-task.ts`、`scripts/ai/review-task.ts`。
- 新增 `scripts/ai/release-prepare.ts`，可一次性生成发布草案三件套。
- 增强 `scripts/ai/archive-task.ts`，要求验证和审查通过且验收项完成后才能归档。
- 更新 `package.json`，补充新增 `ai:*` 命令。
- 更新 `docs/07_AI_WORKFLOW.md`，补充完整任务闭环和辅助脚本说明。
- 更新 `.ai/PROJECT_STATE.md` 和 `.ai/TODO.md`。

### 验证

- 已通过 `node` 源码语法解析检查所有 `scripts/ai/*.ts`。
- 已通过 `npm run ai:check-docs-sync -- --strict`。
- 已通过 `npm run ai:check-workflow -- --strict`。
- 已通过新增脚本 help 检查。
- 已通过 `ai:release-prepare` 本地烟测，生成 `build.json`、`release-note.md`、`manifest.draft.json`。
- 已验证 `ai:archive-task` 在验证状态非 passed 时非 0 退出。
- 已通过 `ai:test-task` 和 `ai:review-task` 生成本任务验证/审查记录。

### 后续

- 选择正式业务测试运行器，并在 Next.js 项目初始化后接入。

## 2026-05-15 - 创建 AI 工作流完善与演练任务

### 变更

- 新增 `.ai/tasks/2026-05-15-ai-workflow-hardening-and-rehearsal.md`。
- 将 AI 工作流自动化完善任务加入 `.ai/TODO.md`。

### 验证

- 作为本轮完整工作流演练的起点，后续会在任务内记录验证和归档结果。

### 后续

- 按任务计划实现并归档本任务。

## 2026-05-15 - 升级 task-create 为对话式任务创建

### 变更

- 更新 `.codex/skills/task-create/SKILL.md`。
- 明确自然语言输入时先多轮澄清，不立即落盘。
- 增加任务草案确认流程。
- 增加“可以落盘 / 不能落盘”的判断规则。
- 增加对话式示例。

### 验证

- 已检查 `task-create` Skill 包含对话式流程、确认后落盘规则和示例。
- 已运行 `npm run ai:check-docs-sync -- --strict`。

### 后续

- 后续使用 `task-create` 时，应先汇总草案并等待用户确认。

## 2026-05-15 - 中文化协作文档

### 变更

- 将 `AGENTS.md` 和 `docs/*.md` 转换为中文。
- 将 `.ai/*.md` 和当前任务文件转换为中文。
- 将项目级 Codex Skills 转换为中文。
- 保留代码标识符、文件名、命令名、类型名和 JSON 字段英文。

### 验证

- 已运行 `npm run ai:check-docs-sync -- --strict`。
- 已运行代表性脚本 `--help` 检查，确认输出中文用法。
- 已完成所有 `scripts/ai/*.ts` 源码语法解析检查。
- 已验证 `generate-diff-summary` 生成中文模板。
- 已验证 `create-task` 缺参时非 0 退出并输出中文错误。

### 后续

- 后续新增协作文档默认使用中文。

## 2026-05-15 - 创建 Root Manifest Resolver 任务

### 变更

- 添加 `.ai/tasks/2026-05-15-root-manifest-version-resolver.md`，用于后续实现 Root Manifest 类型和版本解析函数。
- 将 manifest resolver 任务加入 `.ai/TODO.md`。

### 验证

- 仅创建任务文档，未修改业务代码或实现文件。

### 后续

- 实现前先运行 `task-plan`。

## 2026-05-15 - 添加 AI 辅助脚本骨架

### 变更

- 添加 `scripts/ai/` 下的最小可运行 CLI 脚本。
- 添加共享工具文件 `scripts/ai/_utils.ts`。
- 添加包含 `ai:*` 命令的 `package.json`。

### 验证

- 已运行所有 8 个脚本的 `--help`。
- 已运行 `npm run ai:check-docs-sync -- --strict`。
- 已在 `/tmp` 目录完成 diff summary、build JSON、manifest draft、rollback draft 烟测。
- 已确认非法参数会非 0 退出。

### 后续

- 选择测试运行器后添加正式测试。

## 2026-05-15 - 添加项目级 Codex Skills

### 变更

- 添加 `.codex/skills/` 下的任务生命周期、发布准备和回滚 Skills。
- 定义每个 Skill 的输入、步骤和输出。

### 验证

- 已确认 8 个 `SKILL.md` 存在。
- 已确认每个 Skill 包含必需工作流章节。

### 后续

- 用一个示例任务验证 Skills。

## 2026-05-15 - 初始化 AI 工作流文档

### 变更

- 添加项目级 `AGENTS.md`。
- 添加 Hybrid App H5 架构、Bridge、发布、主题、API、编码、AI 工作流、变更记录和决策文档。
- 添加 AI 状态文件和归档目录。

### 验证

- 文档脚手架创建完成。

### 后续

- 确认 Bridge、manifest、主题和静态打包细节。
## 2026-05-15 - 归档任务 2026-05-15-ai-workflow-hardening-and-rehearsal.md

### 变更

- 已将 .ai/tasks/2026-05-15-ai-workflow-hardening-and-rehearsal.md 归档到 archives/tasks/2026-05-15-ai-workflow-hardening-and-rehearsal.md。

### 验证

- 语法检查、docs sync、workflow check、release-prepare 烟测、archive-task 失败路径、task-test 和 task-review 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-h5-foundation-architecture.md

### 变更

- 已将 .ai/tasks/2026-05-15-h5-foundation-architecture.md 归档到 archives/tasks/2026-05-15-h5-foundation-architecture.md。

### 验证

- pnpm install --frozen-lockfile、pnpm build、pnpm typecheck、pnpm lint、pnpm test、pnpm run ai:check-workflow --strict、dev server 200 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-root-manifest-version-resolver.md

### 变更

- 已将 .ai/tasks/2026-05-15-root-manifest-version-resolver.md 归档到 archives/tasks/2026-05-15-root-manifest-version-resolver.md。

### 验证

- pnpm test -- src/config/manifest.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-native-bridge-adapter-and-web-mock.md

### 变更

- 已将 .ai/tasks/2026-05-15-native-bridge-adapter-and-web-mock.md 归档到 archives/tasks/2026-05-15-native-bridge-adapter-and-web-mock.md。

### 验证

- pnpm test -- src/lib/bridge/bridge.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-manifest-schema-and-remote-config.md

### 变更

- 已将 .ai/tasks/2026-05-15-manifest-schema-and-remote-config.md 归档到 archives/tasks/2026-05-15-manifest-schema-and-remote-config.md。

### 验证

- pnpm test -- src/config/remote-config.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-theme-runtime-light-dark.md

### 变更

- 已将 .ai/tasks/2026-05-15-theme-runtime-light-dark.md 归档到 archives/tasks/2026-05-15-theme-runtime-light-dark.md。

### 验证

- pnpm test -- src/lib/theme/runtime.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-api-client-auth-tracing.md

### 变更

- 已将 .ai/tasks/2026-05-15-api-client-auth-tracing.md 归档到 archives/tasks/2026-05-15-api-client-auth-tracing.md。

### 验证

- pnpm test -- src/lib/api/client.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-telemetry-white-screen-performance.md

### 变更

- 已将 .ai/tasks/2026-05-15-telemetry-white-screen-performance.md 归档到 archives/tasks/2026-05-15-telemetry-white-screen-performance.md。

### 验证

- pnpm test -- src/lib/telemetry/telemetry.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-commerce-mock-pages-static-fallback-oss-config.md

### 变更

- 已将 .ai/tasks/2026-05-15-commerce-mock-pages-static-fallback-oss-config.md 归档到 archives/tasks/2026-05-15-commerce-mock-pages-static-fallback-oss-config.md。

### 验证

- pnpm test、pnpm typecheck、pnpm lint、pnpm build、pnpm run ai:check-workflow --strict 和浏览器抽查均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-release-rollback-system-implementation.md

### 变更

- 已将 .ai/tasks/2026-05-15-release-rollback-system-implementation.md 归档到 archives/tasks/2026-05-15-release-rollback-system-implementation.md。

### 验证

- pnpm-test-typecheck-lint-build-workflow-and-release-cli-smoke-passed

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-real-oss-platform-integration.md

### 变更

- 已将 .ai/tasks/2026-05-15-real-oss-platform-integration.md 归档到 archives/tasks/2026-05-15-real-oss-platform-integration.md。

### 验证

- pnpm-test-typecheck-lint-build-workflow-and-oss-config-check-passed

### 后续

- 暂无。
## 2026-05-16 - 本地发布 2026.05.16-003

### 变更

- 启动 server-meumall、admin-meumall 和 H5 SSR 新版本服务。
- 生成 `archives/releases/2026.05.16-003/` 发布草案、SSR 发布计划和验证记录。
- 将 `2026.05.16-003` 注册为 candidate release，并发布为 prod active。

### 验证

- `GET /api/health`、admin 首页和 H5 `/hybird/category` 均返回 200。
- `pnpm run ai:smoke-ssr-release --plan archives/releases/2026.05.16-003/ssr-release-plan.json` 通过。
- active manifest 已指向 `http://127.0.0.1:3112/hybird/category`。

### 后续

- iOS Simulator 点击“刷新配置”后可看到 `NEW 2026.05.16-003` 绿色标识。

## 2026-05-16 - 落地正式发版入口

### 变更

- 新增 `scripts/ai/register-release.ts` 和 `ai:register-release`，支持生成 release 注册草案，并在 `--execute` 时提交到 server-meumall。
- 更新 `.github/workflows/h5-release.yml`，增加可选 `register_release` 输入和 candidate release 注册步骤。
- 扩展 server-meumall release API，支持 CI 参数式注册、完整 manifest 注册、发布 active、设置灰度和回滚。
- 扩展 admin-meumall 正式发版操作区，展示 release 列表并支持发布、灰度和回滚。
- 更新发布规范、AI 工作流、server/admin README 和项目状态记录。

### 验证

- server-meumall：`. .venv/bin/activate && pytest` 通过，10 tests。
- admin-meumall：`pnpm test && pnpm build` 通过。
- hybird-meumall：`pnpm exec vitest run --config scripts/ai/vitest.config.ts scripts/ai/release-manifest.test.ts`、`pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm run ai:check-workflow --strict` 均通过。
- 本地 HTTP smoke：`ai:register-release --execute` 成功注册 candidate，随后通过 release API 完成 promote、gray 和 rollback，active manifest 指针符合预期。

### 后续

- 在真实 CI 中配置 `H5_RELEASE_SERVER_URL` 并验证受保护环境注册链路。
