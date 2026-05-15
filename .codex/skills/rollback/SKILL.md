---
name: rollback
description: Use when preparing an emergency or planned Hybrid App H5 rollback by editing an existing manifest draft without rebuilding assets.
---

# Rollback

## 何时使用

当用户要求回滚、fallback、紧急切回或降低灰度比例时使用。

回滚只能修改 manifest 草案。不得重新构建资源、生成新业务包或修改业务代码。

## 输入

- `archives/releases/<version>/manifest.draft.json`。
- 目标回滚版本。
- 回滚原因。
- 受影响渠道。
- 受影响路由或灰度人群。
- `docs/03_RELEASE_SPEC.md`。

## 步骤

1. 读取：
   - `AGENTS.md`
   - `docs/03_RELEASE_SPEC.md`
   - 现有 manifest 草案
2. 确认回滚目标是已验证版本。
3. 只修改回滚需要的 manifest 草案字段：
   - `activeVersion`
   - `rollbackVersion`
   - `channel`
   - `rollout`
   - route `assetBaseUrl`
   - 必要的 route delivery metadata
4. 不运行 build 命令。
5. 不修改源码。
6. 不创建新的编译产物。
7. 在相关 release note 或 `archives/releases/` 下添加回滚说明。
8. manifest 草案变化时更新 `.ai/CHANGE_SUMMARY.md`。

## 输出

- 更新后的 `manifest.draft.json`。
- 回滚说明，包含：
  - 原 active version
  - 新 active version
  - 回滚原因
  - 受影响渠道
  - 受影响灰度或路由
  - 回滚目标验证状态
- 不生成 rebuild 产物。
- 不修改业务代码。

## 允许的 Manifest 变化

```json
{
  "channel": "rollback",
  "activeVersion": "<rollback-target-version>",
  "rollbackVersion": "<previous-active-version>",
  "rollout": {
    "type": "all",
    "percentage": 100,
    "includeUserIds": [],
    "excludeUserIds": []
  }
}
```

## 禁止动作

- 不运行 release build。
- 不修改 H5 源码。
- 不创建新的静态包资源。
- 不改变 API、Bridge、Theme 或业务行为。
- 未经单独批准，不发布 manifest。
