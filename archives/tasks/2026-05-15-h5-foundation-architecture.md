# 任务：初始化 H5 基础工程架构

## 目标

建立最小可运行的 Hybrid App H5 工程骨架：Next.js App Router、React、TypeScript、Tailwind CSS、CSS Variables 默认主题、基础目录边界、pnpm 脚本和 Vitest 测试基础，为后续 manifest、Bridge、theme、API 和业务页面开发提供稳定基础。

## 标签

- infra
- docs
- theme

## 范围

### 包含

- 初始化 Next.js App Router 工程结构。
- 使用 `pnpm` 作为包管理器。
- 接入 TypeScript、Tailwind CSS、PostCSS。
- 接入 Vitest，建立最小测试配置。
- 创建基础目录：
  - `src/app`
  - `src/components`
  - `src/lib/bridge`
  - `src/lib/manifest`
  - `src/lib/theme`
  - `src/lib/api`
  - `src/styles`
- 创建最小 App Shell 和全局样式。
- 定义默认 CSS Variables，并映射到 Tailwind theme。
- 添加 `dev`、`build`、`typecheck`、`lint`、`test` 脚本。
- 更新项目状态、TODO、变更摘要、changelog 和必要决策记录。
- 生成 `.ai/test-reports/` 验证记录。

### 不包含

- 不实现业务页面。
- 不实现真实 Native Bridge adapter。
- 不实现 manifest resolver、拉取、缓存或发布逻辑。
- 不实现 API client 真实请求逻辑。
- 不接入真实 CDN、原生 App 或静态包流水线。

## 上下文

- 相关文档：
  - `AGENTS.md`
  - `docs/00_PROJECT_OVERVIEW.md`
  - `docs/01_ARCHITECTURE.md`
  - `docs/04_THEME_SPEC.md`
  - `docs/06_CODING_RULES.md`
  - `docs/07_AI_WORKFLOW.md`
- 相关文件：
  - `package.json`
  - 待创建：`.gitignore`
  - 待创建：`pnpm-lock.yaml`
  - 待创建：`next.config.*`
  - 待创建：`tsconfig.json`
  - 待创建：`tailwind.config.*`
  - 待创建：`postcss.config.*`
  - 待创建：`vitest.config.*`
  - 待创建：`src/**`
  - `.ai/PROJECT_STATE.md`
  - `.ai/CHANGE_SUMMARY.md`
  - `.ai/TODO.md`
  - `docs/08_CHANGELOG.md`
  - `docs/09_DECISIONS.md`

## 验收标准

- [x] `pnpm install` 后依赖可用。
- [x] `pnpm dev` 可启动 Next.js App Router 应用。
- [x] `pnpm build` 通过。
- [x] `pnpm typecheck` 通过。
- [x] `pnpm lint` 通过，或记录初始 lint 约束。
- [x] `pnpm test` 通过最小 Vitest 测试。
- [x] Tailwind 能通过 CSS Variables 使用默认主题 token。
- [x] 基础目录边界存在，且不包含业务实现。
- [x] 相关 AI 状态和项目文档已同步更新。

## 验证

- 命令或人工检查：
  - `pnpm build`
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm test`
  - `pnpm run ai:check-workflow --strict`
- 预期结果：
  - 构建、类型检查、lint 和测试通过。
  - AI 工作流一致性检查通过。
  - `.ai/test-reports/` 中存在本任务验证记录。

## 风险和假设

- 使用 Next.js App Router。
- 使用 `pnpm` 作为包管理器。
- 使用 Vitest 作为第一版测试运行器。
- 第一版只建立工程边界和最小可运行页面，不设计业务首页。
- Lint 使用 Next.js 推荐配置；若版本或依赖冲突，应以最小可维护配置落地并记录原因。
- 现有 Root Manifest resolver 任务保持独立，本任务只提供它未来放置和测试的工程基础。

## 计划

### 影响范围

- Native Bridge：只创建目录和模块入口，不实现通信、能力检测或方法调用。
- Manifest 和发布：只创建目录边界，不实现 resolver、schema、拉取、缓存、灰度或回滚。
- Theme：接入 CSS Variables 默认值和 Tailwind token 映射，暂不实现运行时主题切换。
- API：只创建目录和模块入口，不实现真实请求、鉴权、重试或错误归一化。
- Static Bundle：不实现静态导出和原生打包流水线，仅确保后续可在 Next.js 配置中扩展。
- UI：只创建最小 App Shell，不设计业务页面。
- AI Workflow：更新任务状态、变更摘要、changelog、决策记录和验证记录。

### 文件影响

- 新增或修改工程配置：
  - `package.json`
  - `pnpm-lock.yaml`
  - `next.config.ts`
  - `tsconfig.json`
  - `tailwind.config.ts`
  - `postcss.config.js`
  - `vitest.config.ts`
  - `eslint.config.mjs` 或 Next.js 推荐 lint 配置文件
  - `.gitignore`
- 新增源码骨架：
  - `src/app/layout.tsx`
  - `src/app/page.tsx`
  - `src/styles/globals.css`
  - `src/components/.gitkeep`
  - `src/lib/bridge/index.ts`
  - `src/lib/manifest/index.ts`
  - `src/lib/theme/index.ts`
  - `src/lib/theme/tokens.ts`
  - `src/lib/api/index.ts`
  - `src/lib/**/__tests__/*` 或同等最小 Vitest 测试文件
- 更新文档和 AI 状态：
  - `.ai/PROJECT_STATE.md`
  - `.ai/CHANGE_SUMMARY.md`
  - `.ai/TODO.md`
  - `.ai/test-reports/2026-05-15-h5-foundation-architecture.md`
  - `docs/08_CHANGELOG.md`
  - `docs/09_DECISIONS.md`

### 实施步骤

1. 检查当前工作区和 `package.json`，确认现有 AI 脚本不被破坏。
2. 将包管理器切换到 `pnpm` 工作流，保留现有 `ai:*` 命令，并补充 `dev`、`build`、`typecheck`、`lint`、`test`。
3. 安装并配置 Next.js App Router、React、TypeScript、Tailwind CSS、PostCSS、Vitest 和 lint 依赖。
4. 创建 `src/app` 最小 App Shell：只保留项目身份和运行时占位，不加入业务页面或业务流程。
5. 创建 `src/styles/globals.css`，定义默认 CSS Variables、基础 body 样式和 Tailwind layers。
6. 配置 `tailwind.config.ts`，将 `bg`、`fg`、`primary`、`primary-fg`、`muted`、`muted-fg`、`border`、`radius-sm`、`radius-md` 映射到 CSS Variables。
7. 创建 `src/lib/bridge`、`src/lib/manifest`、`src/lib/theme`、`src/lib/api` 模块入口，导出最小类型或占位常量，避免实现具体行为。
8. 配置 Vitest，并添加最小测试，优先验证主题 token 或模块入口可被导入。
9. 运行验证命令，按实际结果修正配置问题，不扩大到业务实现。
10. 更新 `.ai/PROJECT_STATE.md`、`.ai/CHANGE_SUMMARY.md`、`.ai/TODO.md`、`docs/08_CHANGELOG.md` 和 `docs/09_DECISIONS.md`。
11. 生成 `.ai/test-reports/2026-05-15-h5-foundation-architecture.md`，记录构建、类型检查、lint、测试和工作流检查结果。

### 验证计划

- `pnpm install`
- `pnpm build`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test`
- `pnpm run ai:check-workflow --strict`

### 风险

- Next.js、ESLint 和 TypeScript 最新版本的推荐配置可能发生变化；实现时应优先选择简单、可维护、可解释的配置。
- `pnpm` 接入会新增 lockfile，并可能要求调整现有 `npm run ai:*` 使用习惯；文档和状态文件需要同步说明。
- App Router 最小页面容易滑向业务首页设计；实现时只保留工程可运行的占位页面。
- Tailwind 主题 token 第一版只覆盖默认值和映射，不代表最终品牌 token 已确认。
- Bridge、Manifest、API 目录入口可能被误解为已实现能力；导出命名和文档应明确它们只是边界占位。

### 待确认问题

- 后续实现时如 Next.js lint 推荐配置与当前依赖冲突，是否允许采用 ESLint flat config 的最小配置。
- 静态打包需要的 Next.js `output` 策略仍未确认，本任务不做决定。

### 实现记录

- 已采用 ESLint flat config，并排除既有 `scripts/ai/**` CommonJS 脚本；AI 脚本继续由工作流检查覆盖。
- `pnpm run ai:check-workflow -- --strict` 会把额外的 `--` 传给脚本并失败；pnpm 下使用 `pnpm run ai:check-workflow --strict`。
## 验证记录

- 状态：passed
- 摘要：Next.js App Router、pnpm、Tailwind、TypeScript、Vitest、lint 和 AI 工作流检查均通过；dev server 返回 200。
- 报告：.ai/test-reports/2026-05-15-2026-05-15-h5-foundation-architecture-verification.md
## 审查记录

- 状态：passed
- 摘要：变更范围匹配任务计划；未实现业务功能、Bridge 通信、manifest runtime 或 API client；相关文档、状态和验证记录已同步，可以归档。
- 报告：.ai/test-reports/2026-05-15-2026-05-15-h5-foundation-architecture-review.md

## 归档说明

### 已完成

- 初始化 H5 基础工程架构

### 验证

- pnpm install --frozen-lockfile、pnpm build、pnpm typecheck、pnpm lint、pnpm test、pnpm run ai:check-workflow --strict、dev server 200 均通过
