# 03 发布规范

## 目的

定义 H5 在 Next.js SSR 模式下的版本发布、灰度、缓存、回滚和 CI/CD 流程。

## 发布目标

- 远程 H5 只按 SSR 服务发布，不再维护 SSG/静态导出发布链路。
- 通过 manifest 选择稳定版本、灰度版本和回滚版本。
- 通过 `standalone` 产物构建版本镜像，并以多容器方式保留当前版本、回滚版本和灰度版本。
- 回滚只切 manifest 指针，不重新构建、不重新发布原生 App。
- 保留可审查的 release archive、SSR release plan、manifest draft 和验证记录。

## 版本命名与 Git 绑定

H5 发布版本采用 `package.json` 语义化版本生成，版本源头只允许来自 `hybird-meumall/package.json` 的 `version` 字段：

```text
package.json version: 1.0.1
H5 release version: v1.0.1
Git tag: h5/v1.0.1
```

正式发布必须满足：

1. `hybird-meumall/package.json` 的 `version` 符合 npm 语义化版本，例如 `1.0.1`。
2. 当前 H5 工作区 HEAD 必须存在对应 tag：`h5/v1.0.1`。
3. Jenkins 发布时记录 `gitCommit`、`gitRef`、`gitTag`、`packageVersion`、`dockerImage` 和 `container`。
4. 版本一旦注册为 candidate，不复用、不覆盖；失败版本通过 manifest 黑名单或 release 状态排除。

推荐提交与打 tag 流程：

```bash
cd hybird-meumall
pnpm version patch --no-git-tag-version
git add package.json pnpm-lock.yaml
git commit -m "release(h5): v1.0.1"
git tag h5/v1.0.1
git push origin HEAD
git push origin h5/v1.0.1
```

## SSR 产物结构

一次 SSR release 至少包含：

```text
h5-release-v1.0.1/
  .next/
    standalone/
      server.js
      .next/
      node_modules/
    static/
  public/
  archives/releases/v1.0.1/
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
- `H5_RELEASE_VARIANT`，本地多版本演练可用 `blue`、`green`、`rose`。
- `H5_RELEASE_LABEL`，显示在 H5 右上角的版本标识。

`H5_BASE_PATH` 是 SSR 服务挂载路径，必须在构建和运行环境保持一致。

## 多容器版本并存

线上测试环境采用多容器承载 H5 SSR 版本：

```text
https://hybird.aigcpop.com/h5-v/v1.0.1/
```

每个版本对应一个独立镜像和容器：

```text
meu-mall/h5:v1.0.1
meu-mall-h5-v1.0.1
```

构建该版本时必须注入与线上访问路径一致的 `H5_BASE_PATH`：

```bash
H5_BASE_PATH=/h5-v/v1.0.1
H5_VERSION=v1.0.1
H5_RELEASE_LABEL=v1.0.1
```

原因是 Next.js `basePath` 是构建期配置。版本容器不能只靠运行时变量切换挂载路径。

发布脚本会自动从 `package.json` 和 Git tag 派生版本；不再手动输入 `H5_VERSION` 或 `ROLLBACK_VERSION`：

```bash
PROMOTE_RELEASE=false \
pnpm run deploy:h5-version
```

脚本会执行：

1. 同步 H5 构建上下文到测试服务器。
2. 构建 `meu-mall/h5:<version>` 镜像。
3. 启动 `meu-mall-h5-<version>` 容器。
4. 在 nginx 中写入 `/h5-v/<version>/` 代理入口。
5. 访问版本 URL smoke。
6. 从 active manifest 读取当前 stable version，作为新 candidate 的 `rollbackVersion`。
7. 生成并注册 candidate release，写入 Git/Jenkins 构建元数据。

manifest 指向版本路径：

```json
{
  "stableVersion": "v1.0.1",
  "assets": {
    "serviceBaseUrl": "https://hybird.aigcpop.com",
    "basePath": "/h5-v/v1.0.1",
    "staticAssetPath": "/_next/static",
    "healthCheckPath": "/api/health"
  }
}
```

App 拼接首页时得到：

```text
https://hybird.aigcpop.com/h5-v/v1.0.1/
```

运行保留策略：

| 类型 | 是否运行 | 说明 |
| --- | --- | --- |
| active 当前版本 | 是 | App 当前加载目标。 |
| rollbackVersion | 是 | 保证回滚只切 manifest。 |
| grayVersion | 灰度期间是 | 灰度结束后按结果保留或停止。 |
| 更老版本 | 否 | 保留镜像、release 记录和归档，必要时再启动。 |

测试服务器建议常驻 2 到 3 个 H5 容器。长期运行 5 个以上版本时，建议至少 4C8G，并给容器设置资源上限。

## CDN 接入阶段

多容器负责 SSR HTML 和版本服务入口；CDN 负责静态资源加速。后续接入 CDN 时，HTML 仍由版本容器提供：

```text
https://hybird.aigcpop.com/h5-v/v1.0.1/
```

静态资源切到 CDN：

```text
https://cdn.aigcpop.com/meumall/h5/v1.0.1/_next/static/*
https://cdn.aigcpop.com/meumall/h5/v1.0.1/assets/*
```

构建时注入：

```bash
H5_ASSET_PREFIX=https://cdn.aigcpop.com/meumall/h5/v1.0.1
NEXT_PUBLIC_H5_ASSET_BASE_URL=https://cdn.aigcpop.com/meumall/h5/v1.0.1
```

manifest 可保留同一 `serviceBaseUrl/basePath`，并通过 `publicAssetBaseUrl` 标记静态资源 CDN 位置：

```json
{
  "assets": {
    "serviceBaseUrl": "https://hybird.aigcpop.com",
    "basePath": "/h5-v/v1.0.1",
    "staticAssetPath": "/_next/static",
    "publicAssetBaseUrl": "https://cdn.aigcpop.com/meumall/h5/v1.0.1/assets",
    "healthCheckPath": "/api/health"
  }
}
```

CDN 阶段上线前必须保证旧版本 CDN 目录不删除，否则 manifest 回滚到旧版本时会出现 HTML 可访问但 JS/CSS 404。

## 本地多版本演练

为了在原生 App WebView 中肉眼确认 active manifest 切换效果，可以将同一份 standalone 产物复制成多份，并用不同运行时变量启动：

```bash
H5_BASE_PATH=/hybird pnpm build
pnpm run ai:prepare-standalone-assets

cp -R .next/standalone .next/variant-packages/blue
cp -R .next/standalone .next/variant-packages/green
cp -R .next/standalone .next/variant-packages/rose

PORT=3109 H5_RELEASE_VARIANT=blue H5_RELEASE_LABEL="BLUE v1.0.1" node .next/variant-packages/blue/server.js
PORT=3110 H5_RELEASE_VARIANT=green H5_RELEASE_LABEL="GREEN v1.0.1" node .next/variant-packages/green/server.js
PORT=3111 H5_RELEASE_VARIANT=rose H5_RELEASE_LABEL="ROSE v1.0.1" node .next/variant-packages/rose/server.js
```

然后在 `server-meumall` 中创建三份 manifest 配置：

| 版本 | `assets.serviceBaseUrl` |
| --- | --- |
| `v1.0.1-blue` | `http://127.0.0.1:3109` |
| `v1.0.1-green` | `http://127.0.0.1:3110` |
| `v1.0.1-rose` | `http://127.0.0.1:3111` |

在 `admin-meumall` 发布不同 active manifest 后，iOS App 点击“刷新配置”即可重新拉取 active manifest 并加载对应 H5 版本。

## Manifest 模型

SSR 模式下，manifest 的 `assets` 表示服务入口。多容器版本并存时，`basePath` 指向当前版本容器的 nginx 路径，而不是静态 HTML 目录：

```json
{
  "schemaVersion": "1.0.0",
  "appId": "hybrid-h5",
  "configVersion": "config-v1.0.1",
  "environment": "prod",
  "stableVersion": "v1.0.1",
  "grayVersion": "v1.0.2",
  "rollbackVersion": "v1.0.0",
  "blacklistVersions": [],
  "grayRules": {
    "percentage": 0,
    "salt": "prod",
    "includeUserIds": [],
    "excludeUserIds": []
  },
  "assets": {
    "serviceBaseUrl": "https://hybird.aigcpop.com",
    "basePath": "/h5-v/v1.0.1",
    "staticAssetPath": "/_next/static",
    "publicAssetBaseUrl": "https://cdn.example.com/meumall/h5/v1.0.1",
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
https://hybird.aigcpop.com/h5-v/v1.0.1/category
```

H5 版本号用于发布选择、灰度和回滚；在多容器模型下也会体现在 `basePath` 中，用于让 nginx 转发到对应版本容器。

## 静态资源模型

H5 静态资源分三类管理：

| 类型 | 存放位置 | 引用方式 | 发布方式 |
| --- | --- | --- | --- |
| Next 构建资源 | `.next/static` | Next 自动生成 `/_next/static/*` | 随 SSR release 归档，可上传 CDN，强缓存。 |
| H5 内置公共资源 | `public/assets` | `assetUrl("/assets/...")` | 随 `public` 进入 release，可由 `publicAssetBaseUrl` 指向 CDN。 |
| 业务动态图片 | 对象存储/CDN | 后端接口返回完整 URL | 由后台、CMS 或业务服务管理，不进入 H5 仓库。 |

`public/assets` 只放随 H5 版本一起发布的稳定资源，例如品牌图、固定 icon、默认头像、默认商品图和兜底图。真实商品图、用户头像、后台配置 banner、达人素材和可运营替换活动图不放入 H5 仓库。

组件内禁止裸写 `/assets/...`，必须通过 `src/lib/assets` 的 `assetUrl()` 获取地址：

```ts
import { assetUrl } from "@/lib/assets";

const bannerUrl = assetUrl("/assets/home/banner-renewal.webp");
```

路径解析规则：

1. 传入 `https://`、`data:` 等绝对地址时原样返回。
2. 配置 `NEXT_PUBLIC_H5_ASSET_BASE_URL` 或调用时传入 `assetBaseUrl` 时，返回 `assetBaseUrl + /assets/...`。
3. 未配置 CDN 时，返回 `H5_BASE_PATH + /assets/...`，例如 `/hybird/assets/home/banner-renewal.webp`。

生产推荐以 CDN 为主：

```text
NEXT_PUBLIC_H5_ASSET_BASE_URL=https://cdn.example.com/meumall/h5/v1.0.1
```

原生离线包可以把 `public/assets` 和 `.next/static` 作为预下载资源，但它是缓存/兜底层，不作为默认业务页面发布链路。WebView 优先命中本地资源，缺失或校验失败时回源 CDN/SSR。

## Active Manifest 来源

active manifest 由 `server-meumall` 提供，不再要求 H5 只能通过本地注入 fetcher 消费 manifest。默认本地联调 endpoint：

```text
http://127.0.0.1:4100/api/h5/manifest/active?environment=prod
```

H5 侧通过环境变量配置 active manifest URL：

| 变量 | 用途 |
| --- | --- |
| `NEXT_PUBLIC_H5_MANIFEST_URL` | 浏览器/WebView 中可见的 active manifest URL，适用于 App Shell 客户端拉取。 |
| `H5_MANIFEST_URL` | SSR 或服务端上下文使用的 active manifest URL，不应暴露敏感服务内网信息到浏览器 bundle。 |

`src/lib/manifest/server-fetcher.ts` 提供 `createHttpManifestFetcher(options)`：

- `url` 可显式传入 server-meumall active manifest URL。
- `fetchImpl` 可注入，便于单元测试或 WebView 容器替换请求实现。
- 未传 `url` 时会依次读取 `NEXT_PUBLIC_H5_MANIFEST_URL`、`H5_MANIFEST_URL`。
- HTTP 非 2xx 会抛错，JSON 解析失败会抛错，由既有 manifest runtime 继续执行 last-known-good 缓存 fallback。

后台发布流程：

1. 后台或发布平台完成 SSR 版本部署和 smoke。
2. H5 CI 调用 `server-meumall` 的 `POST /api/releases` 注册 candidate release。
3. admin-meumall 在“正式发版”列表中展示 candidate release。
4. 发布人员在 admin-meumall 中执行灰度、全量或回滚操作。
5. server-meumall 更新 active manifest 指针或 active manifest 的灰度字段。
6. hybird App Shell 使用 `createHttpManifestFetcher()` 拉取 active manifest JSON。
7. 既有 manifest runtime 执行 schema 校验、last-known-good 缓存、版本解析和路由 URL 构造。
8. 后台执行回滚时只更新 server-meumall active manifest 指针；hybird 下一次拉取后按相同 runtime 逻辑切回目标版本。

`POST /api/releases` 推荐由 CI 使用参数式 payload，server-meumall 会生成兼容 `ManifestFile` 的 manifest：

```json
{
  "version": "v1.0.1",
  "environment": "prod",
  "serviceBaseUrl": "https://hybird.aigcpop.com",
  "basePath": "/h5-v/v1.0.1",
  "rollbackVersion": "v1.0.0",
  "rolloutPercentage": 0,
  "routes": ["/", "/promotion", "/mine", "/category"],
  "source": "hybird-ci",
  "buildMeta": {
    "renderMode": "ssr",
    "runtime": "next-standalone",
    "gitCommit": "1234567890abcdef",
    "gitRef": "h5/v1.0.1",
    "gitTag": "h5/v1.0.1",
    "packageVersion": "1.0.1",
    "jenkinsBuildNumber": "18",
    "dockerImage": "meu-mall/h5:v1.0.1",
    "container": "meu-mall-h5-v1.0.1"
  }
}
```

服务端也兼容提交完整 `manifest`，用于后台手工修正或特殊版本导入。

## 当前已落地能力

- `next.config.ts`：使用 `output: "standalone"`，支持 `H5_BASE_PATH`。
- `src/app/layout.tsx`：当前路由强制动态渲染，避免 mock 页面被自动静态优化。
- `src/config/remote-config.ts`：校验 SSR manifest schema。
- `src/lib/manifest`：拉取 manifest、缓存 last-known-good、解析版本并返回 SSR 路由 URL。
- `src/lib/manifest/server-fetcher.ts`：通过 server-meumall active manifest URL 拉取 JSON，并保持可注入 `fetchImpl`。
- `scripts/ai/release-prepare.ts`：生成 SSR manifest draft、build metadata 和 release note。
- `scripts/ai/prepare-ssr-release.ts`：生成可审查的 SSR 部署计划。
- `scripts/ai/smoke-ssr-release.ts`：对 SSR 服务做 HTTP smoke。
- `scripts/ai/update-manifest.ts`：更新 SSR manifest 草案。
- `scripts/ai/rollback.ts`：只修改 manifest 草案完成回滚。
- 根目录 `scripts/deploy/h5-version-deploy.sh`：构建并启动独立 H5 版本容器，写入 nginx 版本入口，注册 candidate release。
- 本地 Jenkins `meu-mall-h5-version-deploy`：通过 `GIT_REF` 触发 H5 多版本容器发布，版本由 `package.json` 和 `h5/vX.Y.Z` tag 确定。
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
| `/assets/*` | `public, max-age=31536000, immutable` | H5 内置公共资源建议使用版本目录或 hash 文件名。 |
| `manifest.json` | `no-cache, max-age=0, must-revalidate` | 控制面入口，必须能快速切流和回滚。 |
| `app-config.json` / `theme.json` | `no-cache` | 配置可以短缓存，但必须可回源校验。 |
| fallback HTML | `no-cache` | 离线、错误、维护兜底页应快速更新。 |

## CI/CD 流程

正式 SSR 发布分为以下阶段：

1. 安装依赖：`pnpm install --frozen-lockfile`。
2. 质量门禁：`pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm run ai:check-workflow --strict`。
3. 构建：部署脚本按 `H5_BASE_PATH=/h5-v/vX.Y.Z` 构建版本容器。版本容器必须使用版本路径构建。
4. 生成 manifest 草案：

```bash
pnpm run ai:release-prepare \
  --version v1.0.1 \
  --channel stable \
  --rollback-version v1.0.0 \
  --rollout-percentage 0 \
  --routes "/,/promotion,/mine,/category" \
  --service-base-url "https://hybird.aigcpop.com" \
  --base-path "/h5-v/v1.0.1" \
  --public-asset-base-url "https://cdn.example.com/meumall/h5/v1.0.1"
```

5. 校验 SSR 产物：

```bash
test -f .next/standalone/server.js
test -d .next/static
test -d public
```

6. 准备 standalone 运行目录静态资源：

```bash
pnpm run ai:prepare-standalone-assets
```

说明：Next.js standalone 输出不会自动把 `.next/static` 和 `public` 放进 `.next/standalone`。本地或平台直接运行 `.next/standalone/server.js` 时，必须确保：

```text
.next/standalone/.next/static
.next/standalone/public
```

存在，否则 SSR HTML 可以返回，但 `/_next/static/*` CSS/JS 会 404。

7. 生成 SSR 发布计划：

```bash
pnpm run ai:prepare-ssr-release \
  --version v1.0.1 \
  --environment prod \
  --service-base-url "https://hybird.aigcpop.com" \
  --base-path "/h5-v/v1.0.1"
```

8. 构建并启动版本容器：

```bash
REGISTER_RELEASE=true \
PROMOTE_RELEASE=false \
pnpm run deploy:h5-version
```

说明：该命令不再接收手填 `H5_VERSION` 和 `ROLLBACK_VERSION`。版本来自 `hybird-meumall/package.json`，回滚目标来自 active manifest。

9. 保留 release archive：`.next/standalone`、`.next/static`、`public`、`archives/releases/vX.Y.Z`。
10. 部署后 smoke：

```bash
pnpm run ai:smoke-ssr-release --plan archives/releases/v1.0.1/ssr-release-plan.json
```

11. 发布 candidate manifest，完成 WebView 验证。
12. 注册 candidate release：

```bash
pnpm run ai:register-release \
  --version v1.0.1 \
  --environment prod \
  --service-base-url "https://hybird.aigcpop.com" \
  --base-path "/h5-v/v1.0.1" \
  --public-asset-base-url "https://cdn.example.com/meumall/h5/v1.0.1" \
  --rollback-version v1.0.0 \
  --rollout-percentage 0 \
  --routes "/,/promotion,/mine,/category" \
  --server-url "https://release.example.com" \
  --execute
```

未追加 `--execute` 时，脚本只生成 `archives/releases/<version>/release-registration.json` 草案，不提交服务端。

13. admin-meumall 展示 candidate release，审批后执行灰度或发布 active。
14. 监控白屏、JS error、接口错误、首屏性能和核心路径打开率。
15. 按灰度结果提升比例或回滚。

## 回滚流程

回滚前置条件：

- 目标版本已经成功部署过 SSR 服务。
- 目标版本通过 smoke 和基础监控验证。
- 当前异常版本尚未被原生 App 写死 URL，只通过 manifest 选择。

回滚命令：

```bash
pnpm run ai:rollback \
  --manifest archives/releases/v1.0.2/manifest.draft.json \
  --target-version v1.0.1 \
  --reason "white screen rate exceeded threshold" \
  --note archives/releases/v1.0.2/release-note.md
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

1. 从 server-meumall active manifest endpoint 拉取 manifest JSON。
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
