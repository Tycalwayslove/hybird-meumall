# 任务：Theme Runtime 与 Light/Dark 切换

## 目标

在现有 CSS Variables 和 Tailwind token 映射基础上，实现 light/dark 主题 runtime，支持安全变量 allowlist、fallback 和运行时切换。

## 标签

- theme
- infra

## 范围

### 包含

- 定义 light/dark 两套主题 token。
- 实现 `applyTheme(theme)` 或等价主题应用函数。
- 定义主题变量 allowlist，忽略未知或不安全变量。
- 支持无效主题 fallback 到默认 light 主题。
- 支持 `data-theme="light"` 和 `data-theme="dark"`。
- 提供主题读取和切换的最小 runtime API。
- 增加单元测试覆盖 light、dark、fallback、allowlist 和变量应用。
- 更新 `docs/04_THEME_SPEC.md`。
- 更新 `.ai/PROJECT_STATE.md`、`.ai/CHANGE_SUMMARY.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。
- 生成 `.ai/test-reports/` 验证记录。

### 不包含

- 不实现品牌主题。
- 不接入远程 theme JSON 拉取。
- 不实现复杂设计系统组件。
- 不创建业务页面。

## 上下文

- 相关文档：
  - `AGENTS.md`
  - `docs/01_ARCHITECTURE.md`
  - `docs/04_THEME_SPEC.md`
  - `docs/06_CODING_RULES.md`
  - `docs/07_AI_WORKFLOW.md`
- 相关文件：
  - `src/lib/theme/index.ts`
  - `src/lib/theme/tokens.ts`
  - `src/styles/globals.css`
  - 待创建：`src/lib/theme/**/*.test.ts`
  - `.ai/PROJECT_STATE.md`
  - `.ai/CHANGE_SUMMARY.md`
  - `.ai/TODO.md`
  - `docs/08_CHANGELOG.md`

## 验收标准

- [x] light/dark token 已定义。
- [x] 主题应用函数已实现。
- [x] 主题变量 allowlist 已实现。
- [x] 无效主题可 fallback 到默认主题。
- [x] `data-theme` 可标识当前主题。
- [x] 单元测试覆盖 light、dark、fallback、allowlist 和变量应用。
- [x] `docs/04_THEME_SPEC.md` 已同步 light/dark runtime 行为。

## 验证

- 命令或人工检查：
  - `pnpm test`
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm run ai:check-workflow --strict`
- 预期结果：
  - 测试、类型检查、lint 和工作流检查通过。

## 风险和假设

- 第一版只支持 light/dark，不支持品牌主题。
- 原生或 manifest 首屏注入主题能力尚未确认；本任务先实现 H5 runtime API。
- 主题对比度自动检查可作为后续任务扩展。

## 计划

### 影响范围

- Theme：新增 light/dark token、主题 allowlist、主题应用函数和最小 runtime API。
- Native Bridge：不涉及。
- Manifest 和发布：不接远程 theme JSON，只保留后续接入空间。
- API：不涉及。
- Static Bundle：不涉及。
- UI：不新增业务页面。
- AI Workflow：更新任务状态、变更摘要、changelog、验证记录和归档记录。

### 行为约定

- 第一版仅支持 `light` 和 `dark`。
- 默认 fallback 为 `light`。
- `applyTheme(theme, target?)` 将 allowlist 内的 CSS Variables 应用到目标 root，并设置 `data-theme`。
- `getThemeConfig(mode)` 返回 light/dark 主题配置；未知 mode fallback 到 light。
- 未知变量名、不以 `--` 开头的变量名和不在 allowlist 中的变量名必须被忽略。
- 本任务不读取 localStorage、不读取系统色彩模式、不拉取远程主题。

### 文件影响

- 新增或修改源码：
  - `src/lib/theme/tokens.ts`
  - `src/lib/theme/runtime.ts`
  - `src/lib/theme/runtime.test.ts`
  - `src/lib/theme/index.ts`
  - `src/styles/globals.css`
- 更新文档和 AI 状态：
  - `docs/04_THEME_SPEC.md`
  - `.ai/PROJECT_STATE.md`
  - `.ai/CHANGE_SUMMARY.md`
  - `.ai/TODO.md`
  - `.ai/test-reports/2026-05-15-theme-runtime-light-dark.md`
  - `docs/08_CHANGELOG.md`

### 实施步骤

1. 先写 `src/lib/theme/runtime.test.ts`，覆盖 light/dark token、fallback、allowlist、未知变量忽略和 `data-theme`。
2. 运行 theme runtime 单测，确认因 runtime API 缺失失败。
3. 扩展 `tokens.ts`，定义 `lightThemeVariables`、`darkThemeVariables` 和 `themeVariableNames`。
4. 实现 `runtime.ts`，导出 `getThemeConfig`、`sanitizeThemeVariables`、`applyTheme`。
5. 更新 `index.ts` 统一导出 runtime API 和类型。
6. 如需要，更新 `globals.css` 增加 `[data-theme="dark"]` 默认变量，保证无 JS 时也有基本主题表达。
7. 运行 targeted test、全量测试、类型检查、lint 和工作流检查。
8. 更新 `docs/04_THEME_SPEC.md`，记录 light/dark runtime、allowlist 和 fallback。
9. 更新 `.ai/PROJECT_STATE.md`、`.ai/CHANGE_SUMMARY.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。
10. 生成 `.ai/test-reports/2026-05-15-theme-runtime-light-dark.md`。

### 验证计划

- `pnpm test -- src/lib/theme/runtime.test.ts`
- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm run ai:check-workflow --strict`

### 风险

- 当前不做自动对比度检查，可能需要后续设计 token 审核任务补齐。
- 首屏主题来源尚未确定；本任务只提供运行时 API 和 CSS fallback。
- 远程主题 JSON 的校验已在配置任务定义结构，但本任务不做拉取。

### 待确认问题

- 原生 App 是否需要在首屏渲染前同步注入 `data-theme`。
- 后续是否需要持久化用户主题偏好。
## 验证记录

- 状态：passed
- 摘要：TDD 红绿流程完成；theme runtime 单测、全量测试、类型检查、lint 和工作流检查均通过。
- 报告：.ai/test-reports/2026-05-15-2026-05-15-theme-runtime-light-dark-verification.md
## 审查记录

- 状态：passed
- 摘要：变更范围匹配任务计划；只实现 light/dark runtime、allowlist 和 CSS fallback，未实现品牌主题、远程拉取或业务 UI；主题文档和 AI 状态已同步，可以归档。
- 报告：.ai/test-reports/2026-05-15-2026-05-15-theme-runtime-light-dark-review.md

## 归档说明

### 已完成

- 实现 Theme Runtime 与 Light/Dark 切换

### 验证

- pnpm test -- src/lib/theme/runtime.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过
