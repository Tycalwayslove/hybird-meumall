# 任务：实现 Root Manifest 类型和版本解析函数

## 目标

实现 Root Manifest 类型定义和 `resolveH5Version(ctx, manifest)` 函数，用于根据 stable、gray、force、blacklist 和 rollback 字段解析最终生效的 H5 版本。

## 标签

- release
- infra

## 范围

### 包含

- 新增 `src/config/manifest.ts`。
- 定义并导出 `RootManifest` 类型。
- 定义并导出 `GrayRules` 类型。
- 为 `resolveH5Version(ctx, manifest)` 定义类型化上下文。
- 实现并导出 `resolveH5Version(ctx, manifest)`。
- 支持以下 manifest 字段：
  - `stableVersion`
  - `grayVersion`
  - `forceVersion`
  - `blacklistVersions`
  - `rollbackVersion`
- 增加版本解析函数的单元测试。
- 更新 `docs/08_CHANGELOG.md`。
- 更新 `.ai/CHANGE_SUMMARY.md`。

### 不包含

- 业务页面或业务 UI。
- 真实 CDN 集成。
- manifest 拉取、缓存或发布。
- 原生 App 集成。
- 静态包构建流水线。
- 灰度服务集成。
- 运行时埋点。

## 上下文

- 相关文档：
  - `AGENTS.md`
  - `docs/03_RELEASE_SPEC.md`
  - `docs/06_CODING_RULES.md`
  - `docs/07_AI_WORKFLOW.md`
- 相关文件：
  - 待创建：`src/config/manifest.ts`
  - 待创建：单元测试文件，具体路径按后续选定测试运行器和目录约定决定
  - `docs/08_CHANGELOG.md`
  - `.ai/CHANGE_SUMMARY.md`
  - `.ai/PROJECT_STATE.md`，如果实现改变项目状态
  - `.ai/TODO.md`，如果发现后续任务

## 验收标准

- [ ] `src/config/manifest.ts` 存在。
- [ ] `RootManifest` 类型已导出。
- [ ] `GrayRules` 类型已导出。
- [ ] `resolveH5Version(ctx, manifest)` 已导出。
- [ ] resolver 支持 `stableVersion`。
- [ ] resolver 支持 `grayVersion`。
- [ ] resolver 支持 `forceVersion`。
- [ ] resolver 支持 `blacklistVersions`。
- [ ] resolver 支持 `rollbackVersion`。
- [ ] 单元测试覆盖 stable、gray、force、blacklist、rollback 和 fallback 行为。
- [ ] `docs/08_CHANGELOG.md` 已更新。
- [ ] `.ai/CHANGE_SUMMARY.md` 已记录变更文件和验证结果。

## 验证

- 命令或人工检查：
  - 运行 manifest resolver 的单元测试命令。
  - 如果项目已有 TypeScript 检查命令，运行类型检查。
- 预期结果：
  - manifest resolver 测试通过。
  - 可用时类型检查通过。
  - 文档更新存在。

## 风险和假设

- 项目尚未建立正式测试运行器；实现前应选择最小合理测试方案，或记录为阻塞。
- 灰度规则匹配维度尚未最终确定；规划时保持 `GrayRules` 最小化并记录假设。
- `forceVersion` 相对 gray 和 stable 的优先级需要在规划时明确。
- `blacklistVersions` 命中时应选择哪个版本，需要在规划时明确。
- `rollbackVersion` 是主动生效，还是仅在目标版本非法或命中黑名单时使用，需要在规划时明确。
