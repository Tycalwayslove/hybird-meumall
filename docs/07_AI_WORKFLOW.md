# 07 AI 工作流

## 目的

定义 Codex 和其他 AI Agent 在本项目中的协作方式。

## 工作流目标

- 跨会话保留项目上下文。
- 每个任务可追踪。
- 实现、验证和文档保持同步。
- 避免在初始化或规划阶段误写业务功能。
- 通过 `ai:*` 辅助脚本补充可重复的本地检查和记录。

## 核心文件

| 文件 | 用途 |
| --- | --- |
| `AGENTS.md` | Agent 工作约定。 |
| `.ai/AI_CONTEXT.md` | AI 持久上下文。 |
| `.ai/PROJECT_STATE.md` | 当前状态、已实现内容和已知缺口。 |
| `.ai/TODO.md` | 当前待办。 |
| `.ai/CHANGE_SUMMARY.md` | 最近变更摘要和涉及文件。 |
| `.ai/tasks/` | 活跃任务。 |
| `.ai/test-reports/` | 验证记录。 |
| `archives/tasks/` | 已完成任务归档。 |
| `archives/releases/` | 发布记录。 |

## 任务开始检查清单

- [ ] 读取 `AGENTS.md`。
- [ ] 读取 `.ai/AI_CONTEXT.md`。
- [ ] 读取 `.ai/PROJECT_STATE.md`。
- [ ] 读取 `.ai/TODO.md`。
- [ ] 读取相关 `docs/*.md`。
- [ ] 判断任务是文档变更还是实现变更。
- [ ] 确认不在范围内的事项。

## 完整任务闭环

推荐按以下顺序执行：

1. `task-create`
   - 用户可自然语言描述需求。
   - AI 多轮澄清并输出任务草案。
   - 用户确认后创建 `.ai/tasks/*.md`。
2. `task-plan`
   - 为任务文件补充计划、影响文件、验证方式和风险。
   - 可使用 `npm run ai:plan-task -- --task <task-file>` 生成基础计划结构。
3. `task-implement`
   - 按计划完成实现或文档变更。
   - 不扩大范围，不写未请求业务功能。
4. `task-test`
   - 运行最小有意义验证。
   - 可使用 `npm run ai:test-task -- --task <task-file> --status passed --summary <summary>` 记录验证。
5. `task-review`
   - 审查范围、文档同步和验证证据。
   - 可使用 `npm run ai:review-task -- --task <task-file> --status passed --summary <summary>` 记录审查。
6. `task-archive`
   - 仅在验收项完成、验证通过、审查通过后归档。
   - 使用 `npm run ai:archive-task -- --task <task-file> --summary <summary> --verification-status passed --review-status passed`。

## 辅助脚本

| 命令 | 用途 |
| --- | --- |
| `npm run ai:create-task` | 根据参数创建基础任务文件。对话式任务创建仍由 `task-create` Skill 主导。 |
| `npm run ai:plan-task` | 为任务文件追加基础计划章节。 |
| `npm run ai:test-task` | 生成任务验证记录并回写任务文件。 |
| `npm run ai:review-task` | 生成任务审查记录并回写任务文件。 |
| `npm run ai:archive-task` | 校验通过后归档任务，并更新状态文件。 |
| `npm run ai:check-docs-sync` | 检查核心文档是否存在，严格模式下检查非空。 |
| `npm run ai:check-workflow` | 检查文档、Skills、活跃任务、package scripts 和脚本文件是否同步。 |
| `npm run ai:release-prepare` | 本地生成 `build.json`、`release-note.md`、`manifest.draft.json` 草案。 |
| `npm run ai:prepare-ssr-release` | 基于 standalone 产物生成 SSR 发布计划，包含运行入口、artifact、服务地址、健康检查和回滚策略。 |
| `npm run ai:prepare-standalone-assets` | 将 `.next/static` 和 `public` 复制到 `.next/standalone` 运行目录，避免 standalone SSR 服务静态资源 404。 |
| `npm run ai:smoke-ssr-release` | 基于 SSR 发布计划检查健康检查和核心页面 HTTP 响应。 |
| `npm run ai:register-release` | 生成 release 注册草案，或在 `--execute` 时将 candidate release 注册到 server-meumall。 |
| `npm run ai:resolve-manifest` | 本地解析 manifest 在指定用户、路由和当前版本下命中的 H5 版本与 SSR URL。 |
| `npm run ai:update-manifest` | 更新本地 manifest 草案。 |
| `npm run ai:rollback` | 只修改 manifest 草案生成回滚记录，不重新构建。 |

项目应用工程使用 `pnpm` 管理依赖和运行脚本。AI 辅助脚本仍可通过 `npm run` 或 `pnpm run` 执行；使用 `pnpm run` 传参时直接追加参数，例如 `pnpm run ai:check-workflow --strict`。

`.github/workflows/h5-release.yml` 提供手动触发的 H5 SSR 发布流水线。流水线运行质量门禁、`pnpm build`、release 草案生成、standalone 静态资源准备、SSR 发布计划生成，并上传 `.next/standalone`、`.next/static`、`public` 与 `archives/releases/<version>` 作为发布归档。当 `register_release=true` 且配置了 `H5_RELEASE_SERVER_URL` secret 时，流水线会调用 `ai:register-release --execute` 将 candidate release 注册到 server-meumall。active、灰度和回滚仍由 admin-meumall 或受保护发布环境审批后执行。

## 提交信息检查

项目使用 `commitlint` 和 `husky` 检查 Git 提交信息。提交信息应遵循 Conventional Commits：

```text
<type>(<scope>): <中文描述>
```

示例：

```text
chore(git): 接入提交信息规范检查
```

本地提交时 `commit-msg` hook 会自动执行 `pnpm exec commitlint --edit "$1"`。也可以运行 `pnpm run lint:commit` 检查最近一次提交。

## 任务结束检查清单

- [ ] 运行相关验证。
- [ ] 更新 `.ai/PROJECT_STATE.md`。
- [ ] 更新 `.ai/CHANGE_SUMMARY.md`。
- [ ] 更新 `.ai/TODO.md`。
- [ ] 必要时更新 `docs/08_CHANGELOG.md`。
- [ ] 有决策时更新 `docs/09_DECISIONS.md`。
- [ ] 必要时在 `.ai/test-reports/` 添加验证记录。
- [ ] 必要时归档完成的任务文件。
- [ ] 运行 `npm run ai:check-workflow -- --strict` 检查工作流一致性。

## 任务命名

```text
.ai/tasks/YYYY-MM-DD-short-title.md
```

归档任务：

```text
archives/tasks/YYYY-MM-DD-short-title.md
```

## 任务标签

| 标签 | 含义 |
| --- | --- |
| docs | 仅文档。 |
| bridge | Native Bridge 契约或实现。 |
| release | Manifest、打包、灰度或回滚。 |
| theme | Tailwind、CSS Variables 或主题。 |
| api | API 客户端或接口契约。 |
| ui | 用户界面或页面。 |
| infra | 工具、CI、构建或工作流。 |

## 验证记录模板

```markdown
# 验证：<任务标题>

## 日期

YYYY-MM-DD

## 范围

## 命令

```bash
<command>
```

## 结果

## 备注
```

## 变更摘要模板

```markdown
## YYYY-MM-DD - <任务标题>

### 变更

- 

### 验证

- 

### 后续

- 
```

## AI 安全规则

- 不猜测未写明的业务需求。
- 影响原生兼容、发布安全或用户数据时先澄清。
- 风险较高的假设记录为 TODO，不静默决定。
- 生成代码和文档必须保持一致。
