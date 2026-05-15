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
  "configVersion": "config-v12",
  "environment": "prod",
  "channel": "stable",
  "stableVersion": "2026.05.14-001",
  "grayVersion": "2026.05.14-002",
  "rollbackVersion": "0.0.0",
  "blacklistVersions": [],
  "grayRules": {
    "percentage": 0,
    "salt": "prod",
    "includeUserIds": [],
    "excludeUserIds": []
  },
  "assets": {
    "cdnBaseUrl": "https://cdn.example.com/h5/prod",
    "immutablePathPattern": "/h5/prod/{version}/",
    "latestPath": "/h5/prod/latest/"
  },
  "routes": {
    "/home": {
      "delivery": "remote",
      "path": "/home",
      "minAppVersion": "1.0.0",
      "requiredBridgeMethods": ["app.getVersion"]
    },
    "/offline": {
      "delivery": "local",
      "path": "/offline",
      "fallbackUrl": "https://cdn.example.com/h5/prod/latest/offline"
    }
  },
  "remoteConfig": {
    "appConfigUrl": "/config/app-config.json",
    "themeConfigUrl": "/theme/theme-light.json"
  }
}
```

## 版本类型

| 版本 | 示例 | 用途 |
| --- | --- | --- |
| App 原生版本 | `1.0.0` | 判断原生能力、Bridge 兼容性和静态包兼容性。 |
| H5 版本 | `2026.05.14-001` | 指向不可变 H5 资源目录。 |
| 配置版本 | `config-v12` | 标识 manifest、app config 或 theme config 的配置变更。 |

每次 H5 发布应生成不可变版本目录，例如 `/h5/prod/2026.05.14-001/`。`latest` 只能作为辅助指针，原生 App 不应直接写死 `latest` 作为生产加载目标。

## 本地版本解析规则

H5 本地版本解析函数位于 `src/config/manifest.ts`，输入字段为：

```ts
type RootManifest = {
  stableVersion: string;
  grayVersion?: string;
  forceVersion?: string;
  rollbackVersion?: string;
  blacklistVersions?: string[];
  grayRules?: GrayRules;
};
```

第一版解析优先级：

1. `stableVersion` 是默认安全版本。
2. `grayVersion` 仅在 `grayRules` 命中时生效。
3. `forceVersion` 优先级高于灰度和稳定版。
4. `rollbackVersion` 不因字段存在而自动生效，仅在当前版本或候选版本命中 `blacklistVersions` 时优先作为 fallback。
5. 候选版本命中 `blacklistVersions` 时，按 `rollbackVersion`、`stableVersion` 的顺序选择非黑名单版本。

第一版 `GrayRules` 支持用户 allow/exclude、平台、App 版本范围和百分比灰度。manifest schema 校验位于 `src/config/remote-config.ts`，远程拉取、缓存和发布服务集成由后续任务实现。

## 远程配置文件

### manifest.json

`manifest.json` 用于描述版本选择、资源目录、路由交付模式、灰度、回滚和远程配置入口。H5 侧类型为 `ManifestFile`，校验函数为 `validateManifestFile(input)`。

### app-config.json

`app-config.json` 只允许包含客户端可见的非敏感配置：

- `configVersion`
- `environment`
- `minAppVersion`
- `minH5Version`
- `publicApiBaseUrl`
- `featureFlags`
- `pageEntries`

不得包含 token、secret、password、private key、credential、api key 等敏感信息。H5 侧类型为 `AppConfigFile`，校验函数为 `validateAppConfigFile(input)`。

### theme.json

`theme.json` 用于远程主题配置。当前只定义 light/dark 文件结构，不在本任务中实现远程主题拉取或应用。H5 侧类型为 `ThemeConfigFile`，校验函数为 `validateThemeConfigFile(input)`。

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

## 当前模拟静态资源

当前已提供一组可随 App 内置或本地直接访问的静态缺省页：

| 场景 | 路径 | 用途 |
| --- | --- | --- |
| 离线 | `/static/fallback/offline.html` | WebView 无网络或远程 H5 不可达时展示。 |
| 404 | `/static/fallback/not-found.html` | 路由不存在或 manifest 未命中时展示。 |
| 异常 | `/static/fallback/error.html` | 页面加载异常、白屏兜底或运行时错误时展示。 |
| 维护 | `/static/fallback/maintenance.html` | 后台维护、强制下线或人工切流时展示。 |

以上页面是纯静态 HTML，不依赖 Next.js runtime，不调用 Bridge，不包含业务数据。

## 当前模拟电商路由

当前用于跑通 App Router 和 WebView H5 体验的模拟路由：

| Route | Delivery 建议 | 说明 |
| --- | --- | --- |
| `/` | remote | 模拟首页和推荐商品。 |
| `/category` | remote | 模拟分类和商品列表。 |
| `/product/[id]` | remote | 模拟商品详情；当前通过本地 mock 数据生成。 |
| `/cart` | remote | 模拟购物车，不持久化。 |
| `/profile` | remote | 模拟我的页面，不接登录态。 |

页面中的 icon 位置暂时使用色块占位，后续统一替换为正式 icon 体系。

## OSS 配置模板

当前 OSS 配置模板位于 `config/oss.config.example.json`，用于记录上传目标和缓存策略：

```json
{
  "provider": "aliyun-oss",
  "bucket": "<your-bucket>",
  "region": "<your-region>",
  "endpoint": "<your-endpoint>",
  "publicBaseUrl": "https://<your-cdn-domain>/h5",
  "remotePrefix": "h5/prod",
  "versionPathPattern": "{environment}/{version}",
  "latestPath": "{environment}/latest",
  "credentialStrategy": "read-from-ci-env"
}
```

敏感凭证不得写入该 JSON 文件。发布环境应通过 CI 或本地安全环境变量提供：

- `OSS_ACCESS_KEY_ID`
- `OSS_ACCESS_KEY_SECRET`

`.env.example` 只作为字段提示，不应提交真实值。`NEXT_PUBLIC_*` 变量会进入浏览器 bundle，只能放客户端可见信息。

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
- `manifest.json` 最终由 H5 拉取、原生拉取，还是二者都拉取？
