# 03 发布规范

## 目的

定义 H5 在 Next.js SSR 模式下的版本发布、灰度、缓存、回滚和 CI/CD 流程。

## 发布目标

- 远程 H5 只按 SSR 服务发布，不再维护 SSG/静态导出发布链路。
- 通过 manifest 选择稳定版本、灰度版本和回滚版本。
- 通过 `standalone` 产物部署 Node.js 或 Serverless 运行时。
- 回滚只切 manifest 指针，不重新构建、不重新发布原生 App。
- 保留可审查的 release archive、SSR release plan、manifest draft 和验证记录。

## 版本命名

H5 版本使用日期递增格式：

```text
YYYY.MM.DD-NNN
```

示例：

```text
2026.05.15-001
```

版本一旦进入候选发布，不再复用。失败版本通过 manifest 黑名单和 rollbackVersion 排除，不覆盖同名产物。

## SSR 产物结构

一次 SSR release 至少包含：

```text
h5-release-2026.05.15-001/
  .next/
    standalone/
      server.js
      .next/
      node_modules/
    static/
  public/
  archives/releases/2026.05.15-001/
    build.json
    release-note.md
    manifest.draft.json
    ssr-release-plan.json
```

运行时启动命令：

```bash
node .next/standalone/server.js
```

运行平台必须注入：

- `NODE_ENV=production`
- `PORT`
- `HOSTNAME`
- `H5_BASE_PATH=/hybird`

`H5_BASE_PATH` 是 SSR 服务挂载路径，必须在构建和运行环境保持一致。

## Manifest 模型

manifest 不再描述静态版本目录。SSR 模式下，manifest 的 `assets` 表示服务入口：

```json
{
  "schemaVersion": "1.0.0",
  "appId": "hybrid-h5",
  "configVersion": "config-2026.05.15-001",
  "environment": "prod",
  "stableVersion": "2026.05.15-001",
  "grayVersion": "2026.05.15-002",
  "rollbackVersion": "2026.05.14-001",
  "blacklistVersions": [],
  "grayRules": {
    "percentage": 0,
    "salt": "prod",
    "includeUserIds": [],
    "excludeUserIds": []
  },
  "assets": {
    "serviceBaseUrl": "https://h5.example.com",
    "basePath": "/hybird",
    "staticAssetPath": "/_next/static",
    "healthCheckPath": "/api/health"
  },
  "routes": {
    "/": {
      "delivery": "remote",
      "path": "/",
      "minAppVersion": "1.0.0",
      "requiredBridgeMethods": []
    },
    "/category": {
      "delivery": "remote",
      "path": "/category",
      "minAppVersion": "1.0.0",
      "requiredBridgeMethods": []
    }
  },
  "remoteConfig": {
    "appConfigUrl": "/config/app-config.json",
    "themeConfigUrl": "/theme/theme-light.json"
  }
}
```

客户端拼接远程 URL 的规则：

```text
assets.serviceBaseUrl + assets.basePath + routes[route].path
```

示例：

```text
https://h5.example.com/hybird/category
```

H5 版本号只用于发布选择、灰度和回滚，不参与拼接 HTML 静态目录。

## 当前已落地能力

- `next.config.ts`：使用 `output: "standalone"`，支持 `H5_BASE_PATH`。
- `src/app/layout.tsx`：当前路由强制动态渲染，避免 mock 页面被自动静态优化。
- `src/config/remote-config.ts`：校验 SSR manifest schema。
- `src/lib/manifest`：拉取 manifest、缓存 last-known-good、解析版本并返回 SSR 路由 URL。
- `scripts/ai/release-prepare.ts`：生成 SSR manifest draft、build metadata 和 release note。
- `scripts/ai/prepare-ssr-release.ts`：生成可审查的 SSR 部署计划。
- `scripts/ai/smoke-ssr-release.ts`：对 SSR 服务做 HTTP smoke。
- `scripts/ai/update-manifest.ts`：更新 SSR manifest 草案。
- `scripts/ai/rollback.ts`：只修改 manifest 草案完成回滚。
- `.github/workflows/h5-release.yml`：手动触发 SSR release workflow。

## 灰度发布

灰度发布时：

- `stableVersion` 保持上一稳定版本。
- `grayVersion` 指向新版本。
- `grayRules.percentage` 控制命中比例。
- `rollbackVersion` 指向已验证可回退版本。

全量发布时：

- `stableVersion` 指向新版本。
- 移除 `grayVersion`。
- `grayRules.percentage` 置 0。
- `rollbackVersion` 保持上一稳定版本。

## 缓存策略

| 资源 | Cache-Control | 说明 |
| --- | --- | --- |
| SSR HTML | `private, no-cache, no-store, max-age=0, must-revalidate` | HTML 由服务端渲染，不缓存跨用户页面。 |
| `/_next/static/*` | `public, max-age=31536000, immutable` | Next hash 静态资源可长缓存。 |
| `manifest.json` | `no-cache, max-age=0, must-revalidate` | 控制面入口，必须能快速切流和回滚。 |
| `app-config.json` / `theme.json` | `no-cache` | 配置可以短缓存，但必须可回源校验。 |
| fallback HTML | `no-cache` | 离线、错误、维护兜底页应快速更新。 |

## CI/CD 流程

正式 SSR 发布分为以下阶段：

1. 安装依赖：`pnpm install --frozen-lockfile`。
2. 质量门禁：`pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm run ai:check-workflow --strict`。
3. 构建：`H5_BASE_PATH=/hybird pnpm build`。
4. 生成 manifest 草案：

```bash
pnpm run ai:release-prepare \
  --version 2026.05.15-001 \
  --channel stable \
  --rollback-version 2026.05.14-001 \
  --rollout-percentage 0 \
  --routes "/,/category,/cart,/profile" \
  --service-base-url "https://h5.example.com" \
  --base-path "/hybird"
```

5. 校验 SSR 产物：

```bash
test -f .next/standalone/server.js
test -d .next/static
test -d public
```

6. 生成 SSR 发布计划：

```bash
pnpm run ai:prepare-ssr-release \
  --version 2026.05.15-001 \
  --environment prod \
  --service-base-url "https://h5.example.com" \
  --base-path "/hybird"
```

7. 上传 release archive：`.next/standalone`、`.next/static`、`public`、`archives/releases/<version>`。
8. 部署到 SSR 运行平台。
9. 部署后 smoke：

```bash
pnpm run ai:smoke-ssr-release --plan archives/releases/2026.05.15-001/ssr-release-plan.json
```

10. 发布 candidate manifest，完成 WebView 验证。
11. 审批后覆盖 active manifest。
12. 监控白屏、JS error、接口错误、首屏性能和核心路径打开率。
13. 按灰度结果提升比例或回滚。

## 回滚流程

回滚前置条件：

- 目标版本已经成功部署过 SSR 服务。
- 目标版本通过 smoke 和基础监控验证。
- 当前异常版本尚未被原生 App 写死 URL，只通过 manifest 选择。

回滚命令：

```bash
pnpm run ai:rollback \
  --manifest archives/releases/2026.05.15-002/manifest.draft.json \
  --target-version 2026.05.14-001 \
  --reason "white screen rate exceeded threshold" \
  --note archives/releases/2026.05.15-002/release-note.md
```

回滚脚本行为：

- 将 `stableVersion` 切到目标版本。
- 删除 `grayVersion` 和 `forceVersion`。
- 将 `grayRules.percentage` 置 0。
- 将异常版本写入 `blacklistVersions`。
- 保留 `assets.serviceBaseUrl`、`assets.basePath` 和路由配置。
- 追加 release note 回滚记录。

回滚发布行为：

1. 校验回滚后的 manifest。
2. 发布 candidate manifest。
3. 验证 WebView 重新解析到目标版本。
4. 审批后覆盖 active manifest。
5. 观察异常指标是否恢复。

回滚不重新构建 SSR 产物，不上传静态 HTML，不刷新静态版本目录。

## 客户端加载策略

真实 App Shell 推荐流程：

1. 拉取 active `manifest.json`。
2. 使用 `validateManifestFile(input)` 校验 schema。
3. 校验通过后写入 last-known-good 缓存。
4. 网络失败或 manifest 非法时读取缓存。
5. 使用 `resolveH5Version(ctx, manifest)` 计算目标版本。
6. 读取 `routes[route]` 并拼接 SSR URL。
7. WebView 加载 `serviceBaseUrl + basePath + path`。
8. 路由不存在时打开内置 fallback 或错误页。

runtime 只返回结构化结果，不直接操作 WebView 或 DOM。

## 待确认问题

- active manifest 的最终托管服务和审批系统。
- SSR 运行平台的健康检查接口路径是否固定为 `/api/health`。
- 灰度命中结果由原生 App 固定缓存，还是每次启动重新解析。
- 监控阈值触发自动回滚的审批边界。
