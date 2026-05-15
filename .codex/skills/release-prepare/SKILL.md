---
name: release-prepare
description: Use when preparing a Hybrid App H5 release package, release notes, build metadata, and manifest draft before rollout or App bundling.
---

# Release Prepare

## 何时使用

准备远程 WebView 发布或 App 静态包发布时使用。

本 skill 可以创建发布草案和元数据，但不添加业务功能。

## 输入

- 目标 H5 版本。
- 发布渠道。
- 灰度策略。
- 路由交付模式列表。
- 静态包路由列表。
- 回滚目标版本。
- 验证结果。
- `docs/03_RELEASE_SPEC.md`。
- `.ai/PROJECT_STATE.md`。

## 步骤

1. 读取：
   - `AGENTS.md`
   - `docs/03_RELEASE_SPEC.md`
   - `.ai/PROJECT_STATE.md`
   - `.ai/CHANGE_SUMMARY.md`
2. 确认发布输入：
   - version
   - channel
   - rollout strategy
   - rollback version
   - remote asset base URL
   - static routes
   - min App versions
   - required bridge capabilities
3. 如果项目已定义构建命令，运行对应构建或打包命令。
4. 创建发布目录：`archives/releases/<version>/`。
5. 生成 `archives/releases/<version>/build.json`。
6. 生成 `archives/releases/<version>/release-note.md`。
7. 生成 `archives/releases/<version>/manifest.draft.json`。
8. 将验证结果写入 release note。
9. 不发布 manifest，除非另有明确任务要求。

## 输出

- `archives/releases/<version>/build.json`
- `archives/releases/<version>/release-note.md`
- `archives/releases/<version>/manifest.draft.json`
- 发布准备摘要、验证状态和风险。

## build.json 模板

```json
{
  "version": "0.0.0",
  "channel": "stable",
  "buildTime": "YYYY-MM-DDTHH:mm:ssZ",
  "gitCommit": null,
  "source": "local",
  "artifacts": [],
  "staticRoutes": [],
  "verification": {
    "commands": [],
    "status": "pending"
  }
}
```

## release-note.md 模板

```markdown
# Release <version>

## 摘要

## 渠道

## 灰度

## 路由

| Route | Delivery | Notes |
| --- | --- | --- |

## 静态包

## Manifest 草案

## 验证

## 回滚方案

## 风险
```

## manifest.draft.json 模板

```json
{
  "schemaVersion": "1.0.0",
  "appId": "hybrid-h5",
  "channel": "stable",
  "activeVersion": "0.0.0",
  "rollbackVersion": "0.0.0",
  "rollout": {
    "type": "percentage",
    "percentage": 0,
    "includeUserIds": [],
    "excludeUserIds": []
  },
  "routes": []
}
```

## 约束

- 每次发布都必须有回滚目标。
- 静态页面必须声明原生兼容性。
- manifest 输出默认是草案。
- 本 skill 不发布产物。
