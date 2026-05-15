# 03 发布规范

## 目的

定义 H5 版本、灰度、回滚、静态包和远程资源的控制方式。

## 发布目标

- 通过 manifest 选择 H5 版本。
- 支持按渠道、平台、App 版本、用户集合或百分比灰度。
- 支持快速回滚到已验证稳定版本。
- 兼容远程 H5 和 App 内置静态页面。
- 保留清晰的发布记录。

## Manifest 职责

manifest 应描述：

- H5 版本。
- 资源 base URL。
- 路由交付模式。
- 灰度策略。
- 回滚目标。
- 最低原生 App 版本。
- 所需 Bridge 能力。
- 缓存策略。
- 必要时的完整性校验信息。

## Manifest 模板

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

## 发布渠道

| 渠道 | 用途 | 用户 |
| --- | --- | --- |
| dev | 开发验证。 | 内部开发。 |
| qa | 测试验证。 | 测试用户。 |
| beta | 小范围试用。 | 指定用户。 |
| stable | 正式生产。 | 全量用户。 |
| rollback | 紧急回滚。 | 从异常版本切回的用户。 |

## 灰度策略

| 策略 | 说明 | 必填字段 |
| --- | --- | --- |
| all | 对所有符合条件用户发布。 | channel、version |
| percentage | 按百分比发布。 | percentage、salt |
| allowlist | 对指定用户发布。 | includeUserIds |
| appVersion | 按 App 版本发布。 | minAppVersion、maxAppVersion |
| platform | 按平台发布。 | ios、android |

## 回滚要求

- 每个生产发布必须声明 `rollbackVersion`。
- 回滚目标必须是已验证版本。
- 回滚不应依赖重新发布原生 App。
- 回滚操作记录到 `archives/releases/`。

## 静态包要求

静态页面必须记录：

- 路由路径。
- 构建产物路径。
- 原生 App 资源路径。
- 最低原生 App 版本。
- 所需 Bridge 能力。
- 远程 fallback URL。
- 已知限制。

## 发布记录模板

```markdown
# Release <version>

## 摘要

## Manifest

- 版本：
- 渠道：
- 灰度：
- 回滚目标：

## 路由

| Route | Delivery | Notes |
| --- | --- | --- |

## 验证

- Build：
- Tests：
- Manual checks：

## 回滚方案

## 结果
```

## 待确认问题

- manifest 托管在哪里？
- 原生 App 是否缓存 manifest？
- 谁负责灰度分组决策？
- 是否需要资源完整性校验？
