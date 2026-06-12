# 05 API 规范

## 目的

定义 H5 在原生 App WebView 中访问 API 的统一约定。

## 目标

- 保持不同页面的 API 行为一致。
- 统一请求、响应和错误处理。
- 支持原生提供鉴权和设备上下文。
- API 契约易测试、易 mock。

## API Client 职责

- 根据环境和 manifest 选择 base URL。
- 注入鉴权 header。
- 注入请求追踪信息。
- 归一化响应数据。
- 归一化错误结构。
- 管理超时、重试和取消。

## H5 BFF 鉴权模型

当前正式推荐模型是：

```text
原生 App 登录
  -> 写入 H5 域名 HttpOnly Cookie
  -> WebView 打开 H5

Next SSR / BFF
  -> 从 Cookie 读取 pythonToken / mallToken
  -> 请求 Python 后端时使用 pythonToken，转换为 Authorization: Bearer <pythonToken>
  -> 请求 Java / mall 后端时使用 mallToken，转换为 Authorization: <mallToken>

浏览器端 H5
  -> 不读取 token
  -> 只请求自身 /api/bff/**
```

Python / Java 后端不需要支持 Cookie 鉴权，仍继续按 `Authorization` 认证。Cookie 只作为原生 App 到 H5 服务端的安全登录态传递通道。注意 Java / mall 当前不接受 `Bearer` 前缀，BFF 调 Java 时直接把 `mallToken` 作为 `Authorization` 值。

### Cookie 约定

| Cookie | 说明 | JS 可读 | 建议属性 |
| --- | --- | --- | --- |
| `pythonToken` | 原生 App 写入的 Python 服务 token。 | 否 | `HttpOnly; Secure; Path=/; SameSite=Lax` |
| `mallToken` | 原生 App 写入的 Java / mall 服务 token。 | 否 | `HttpOnly; Secure; Path=/; SameSite=Lax` |
| `statusHeight` | 原生 App 写入的手机顶部状态栏高度，H5 按 px 处理。 | 可按需 | `Secure; Path=/; SameSite=Lax` |
| `meu_page_config` | 可选页面启动配置，禁止放敏感信息。 | 可按需 | `Secure; Path=/; SameSite=Lax` |

H5 浏览器端禁止通过 `document.cookie` 读取 token。服务端读取逻辑位于 `src/server/auth/cookie-auth.ts`。

### 本地 Token 兜底

本地开发可以在工作区根目录 `.env.local` 或 `hybird-meumall/.env.local` 放临时 token，避免每次都手动给浏览器写 Cookie。两个文件都存在时，`hybird-meumall/.env.local` 后加载，优先级更高：

```env
H5_LOCAL_JAVA_TOKEN=本地调试用 mallToken
H5_LOCAL_PYTHON_TOKEN=本地调试用 pythonToken
```

兜底规则：

| 场景 | 取 token 方式 |
| --- | --- |
| Cookie 中存在 `mallToken` / `pythonToken` | 永远优先使用 Cookie。 |
| `APP_ENV=local` 且 Cookie 缺失 | Java 使用 `H5_LOCAL_JAVA_TOKEN`，Python 使用 `H5_LOCAL_PYTHON_TOKEN`。 |
| `APP_ENV` 不是 `local` | 忽略 `H5_LOCAL_*_TOKEN`，必须由 Cookie 提供 token。 |

真实 token 不要写入 `config/env/h5.local.env`、`.env.example` 或任何会提交 Git 的文件；只放本机的 `.env.local`。这条兜底只用于本地联调，不改变测试和正式环境的 App Cookie 鉴权模型。

修改 `.env.local` 后必须重启 Next dev server；已运行的进程不会自动读取新 token。

### 独立 H5 调试 Token 登录页

线上或测试版本需要在浏览器里单独打开 H5 调试时，可以访问 `/debug-login`。该页面不是正式登录能力，只是调试 Cookie 写入工具：

| 条件 | 行为 |
| --- | --- |
| Cookie 中已同时存在 `mallToken` 和 `pythonToken` | 直接跳回目标页面。 |
| 缺少 token，且没有原生运行信号 | 展示 Java Token / Python Token 输入框，提交后写入调试 Cookie。 |
| 检测到原生运行信号 | 返回 404，不展示调试页。 |

原生运行信号包括 `statusHeight`、`meu_page_config`、`x-app-version`、`x-app-build`、`x-device-model`、`x-os-version`、`x-webview-version`，以及 `x-platform=ios/android`。原生 App WebView 应始终由 App 写入 `mallToken` 和 `pythonToken`，不依赖该页面。

`/` 首页在浏览器独立 H5、无 token、无原生信号时会跳转到 `/debug-login?redirect=/`，用于解决线上版本浏览器调试无法获取 token 的问题。调试页写入的 token Cookie 不是 HttpOnly，仅用于手动联调；不要把真实 token 写入代码、环境 profile、文档或日志。

### 服务端后端注册表

后端环境通过服务端环境变量注入，不进入浏览器 bundle：

| 环境变量 | 说明 |
| --- | --- |
| `APP_ENV` | 当前环境，例如 `test` / `prod`。 |
| `JAVA_API_BASE_URL` | Java 后端 base URL。 |
| `JAVA_OSS_ASSET_BASE_URL` | Java 返回相对图片路径时使用的 OSS/CDN base URL。当前为 `https://awu-mall-file.oss-cn-guangzhou.aliyuncs.com/`。 |
| `PYTHON_API_BASE_URL` | Python 后端 base URL。 |
| `H5_BFF_LOG_BACKEND_RESPONSE` | 是否在 BFF 后端调用日志里打印后端响应 body。`1/true` 打开，正式环境默认关闭。 |
| `H5_BFF_BACKEND_RESPONSE_LOG_LIMIT` | 后端响应 body 日志长度上限，超出后截断。当前默认 `30000`。 |
| `H5_LOCAL_JAVA_TOKEN` | 本地开发可选，只在 `APP_ENV=local` 且 Cookie 缺失时作为 Java token 兜底。 |
| `H5_LOCAL_PYTHON_TOKEN` | 本地开发可选，只在 `APP_ENV=local` 且 Cookie 缺失时作为 Python token 兜底。 |
| `H5_VERSION` | 当前 H5 版本，用于请求追踪。 |

服务端 registry 位于 `src/server/http/backend-registry.ts`。页面和业务代码不要直接读取这些环境变量。

### 环境配置文件

H5 当前维护三套可提交的环境 profile：

| profile | 用途 | H5 配置入口 | Java 后端 | Python 后端 |
| --- | --- | --- | --- | --- |
| `config/env/h5.local.env` | 本地 H5 调试 | `https://hybird.aigcpop.com` | `https://test.aigcpop.com/mini_h5` | `https://test.aigcpop.com/api` |
| `config/env/h5.test.env` | 测试环境 | `https://hybird.aigcpop.com` | `https://test.aigcpop.com/mini_h5` | `https://test.aigcpop.com/api` |
| `config/env/h5.prod.env` | 正式环境占位 | `https://hybird.aigcpop.com` | `https://test.aigcpop.com/mini_h5` | `https://test.aigcpop.com/api` |

Java 图片 OSS/CDN base URL 当前三套 profile 均为 `https://awu-mall-file.oss-cn-guangzhou.aliyuncs.com/`。Java 返回完整 `http(s)` 图片 URL 时 H5 原样使用；返回 `banner/a.png` 或 `/banner/a.png` 这类相对路径时，H5 BFF mapper 会拼接 `JAVA_OSS_ASSET_BASE_URL` 后再给浏览器端渲染。

BFF 后端响应 body 日志当前策略：

| profile | `H5_BFF_LOG_BACKEND_RESPONSE` | 说明 |
| --- | --- | --- |
| `h5.local.env` | `1` | 本地联调默认打印 Java / Python 响应快照。 |
| `h5.test.env` | `1` | 测试联调默认打印响应快照，便于区分 BFF mapper 问题和后端数据问题。 |
| `h5.prod.env` | `0` | 正式占位默认关闭，避免把用户数据打入日志。 |

正式服务器和域名尚未调试完成前，`h5.prod.env` 只代表“按正式环境方式启动”，不代表后端已经切到生产域名。后续正式域名确认后，只替换该 profile 中的 H5 / Java / Python base URL，不改页面调用方式。

正式环境迁移时，优先修改 `config/env/h5.prod.env`：

| 变量 | 迁移时怎么改 |
| --- | --- |
| `H5_SERVICE_BASE_URL` | 改成正式 H5 SSR 服务域名。 |
| `H5_RELEASE_SERVER_URL` | 改成正式 release / manifest 服务域名。 |
| `H5_MANIFEST_URL` | 改成正式服务端可访问的 active manifest URL。 |
| `NEXT_PUBLIC_H5_MANIFEST_URL` | 改成 WebView 可访问的 active manifest URL。 |
| `NEXT_PUBLIC_CONFIG_API_BASE_URL` | 改成 WebView 可访问的配置服务域名。 |
| `JAVA_API_BASE_URL` | 改成 Java 正式后端 base URL。 |
| `JAVA_OSS_ASSET_BASE_URL` | 改成 Java 正式图片 OSS/CDN base URL。 |
| `PYTHON_API_BASE_URL` | 改成 Python 正式后端 base URL。 |
| `H5_BFF_LOG_BACKEND_RESPONSE` | 正式环境建议保持 `0`；临时排查时可短期开启并控制日志采集范围。 |
| `APP_ENV` / `NEXT_PUBLIC_APP_ENV` | 保持 `prod`。 |

如果只是 Java / Python 域名变化，通常只改 profile 就够了；页面和 BFF 代码不需要改。如果正式环境的 H5 挂载路径、active manifest schema、Cookie domain、nginx 代理路径或版本容器路径变化，还要同步发布脚本、server-meumall active manifest、原生 App 打开 H5 的 URL 和回滚/smoke 文档。

本地启动推荐：

```bash
pnpm dev:h5
# 或
cd hybird-meumall
pnpm dev:local
```

如果切换过 profile，必须重启 Next dev server；已运行的 dev server 不会自动读取新的环境变量。

### 双层 HTTP Client

| 层级 | 位置 | 职责 |
| --- | --- | --- |
| 浏览器端 H5 client | `src/lib/http/h5-client.ts` | 请求自身 BFF，自动处理 basePath 和 `credentials: "include"`。 |
| feature API adapter | `src/features/**/api.ts` | 给页面提供业务方法，集中维护 BFF path 和 query 参数。 |
| 浏览器端请求诊断 | `src/lib/http/request-diagnostics.ts` | 维护页面会话、最近请求、最近失败 requestId 和诊断快照。 |
| BFF request context | `src/server/http/bff-context.ts` | 统一读取 Cookie auth、客户端上下文，并创建带日志的 backend client。 |
| 服务端 backend client | `src/server/http/backend-client.ts` | 请求 Java / Python 后端，注入 Authorization、requestId、H5 版本和环境；Java / mall 出站请求固定注入 `source: 1`。 |
| BFF response | `src/server/http/bff-response.ts` | 将后端结果转换为前端统一响应。 |

浏览器端调用示例：

```ts
const client = createH5Client();
const promotionApi = createPromotionApi(client);
const result = await promotionApi.getRanking("sales", { period: "week" });
```

BFF / Server service 调用示例：

```ts
const context = createBffRequestContext(request);

const result = await context.backendClient.request({
  backend: "java",
  path: "/api/user/profile",
  authRequired: true,
  authToken: context.getAuthToken("java"),
  clientContext: context.clientContext,
  route: "/mine"
});
```

`context.getAuthToken("python")` 返回 `pythonToken`；`context.getAuthToken("java")` 返回 `mallToken`。Java / mall 后端请求由 backend client 统一添加 `source: 1`，对应 Java 来源枚举 `1-app`、`2-小程序`、`3-h5`；当前 H5 运行在 App WebView 内，按 App 来源处理。

### Feature API Adapter 约定

页面组件不要直接写 `client.request("/api/bff/...")`。每个业务域优先建立或复用 `src/features/<domain>/api.ts`：

```ts
const runtimeApi = createRuntimeApi(createH5Client());
const result = await runtimeApi.getNativeRuntimeContext(window.location.search);
```

这样做有三个好处：

- 页面只表达业务动作，不关心 BFF path 和 query 编码。
- 后续真实后端接口替换 BFF mock 时，优先改 adapter / server service，不需要扫页面组件。
- 测试可以直接锁住业务方法到 BFF path 的映射，避免联调时路径或参数名悄悄漂移。

当前样板：

| 业务域 | 文件 | 方法示例 |
| --- | --- | --- |
| 首页 Runtime | `src/features/home/runtime-api.ts` | `getNativeRuntimeContext(sourceSearch)` |
| 首页业务 | `src/features/home/home-api.ts` | `getHome()`、`getRecommendProducts()`、`getForYouProducts()` |
| 推广模块 | `src/features/promotion/api.ts` | `getHome()`、`getActivities()`、`getRanking()`、`getBenefits()` |

### 请求诊断

`createH5Client()` 在浏览器环境下会合并默认客户端上下文，并在请求成功、业务失败或网络异常时记录最近请求。诊断记录只保留内存中的最近 10 条，不持久化 token、Cookie 或个人敏感信息。

可用于错误页、客服入口或内部调试面板的诊断快照：

```ts
const snapshot = createDiagnosticSnapshot();
```

快照里包含：

- `pageSessionId`：本次页面访问会话。
- `currentUrl` / `route`：当前页面位置。
- `userAgent`：WebView 基础 UA。
- `lastRequestIds` / `lastErrorRequestId`：最近请求和最近失败请求。
- `appVersion`、`osVersion`、`deviceModel` 等客户端上下文。

上线后，如果用户无法手动复制 requestId，可以通过反馈入口自动带上这份快照，帮助研发从 BFF 和后端日志反查。

### BFF 日志排查

BFF 侧有两类日志：

| 日志前缀 | 什么时候出现 | 主要字段 |
| --- | --- | --- |
| `[h5-bff-backend-call]` | BFF 已经发起 Java / Python 后端请求。 | `requestId`、`backend`、`backendPath`、`requestUrl`、`requestQuery`、`requestBody`、`requestHeaders`、`responseBody`、`responseBodySize`、`responseBodyTruncated`、`backendStatus`、`backendBusinessCode`、`backendBusinessSuccess`、`errorCode`、`durationMs`、`route`、设备/App 上下文。 |
| `[h5-bff-route-error]` | BFF route 自己异常，例如环境变量缺失、上下文创建失败或未被 backend client 捕获的错误。 | `requestId`、`route`、`message`。 |

本地调试时，日志直接出现在启动 H5 的终端：

```bash
pnpm dev:h5
# 另一个终端触发接口
curl -i http://localhost:3109/hybird/api/bff/home
```

看到 `success: false` 时，优先拿响应里的 `requestId` 查终端日志：

```text
[h5-bff-backend-call] {
  requestId: "req_xxx",
  backend: "java",
  backendPath: "/p/app/home/index",
  requestUrl: "https://test.aigcpop.com/mini_h5/p/app/home/index",
  requestHeaders: {
    Authorization: "abcd...wxyz (length=36)",
    source: "1",
    "x-request-id": "req_xxx",
    "user-agent": "Mozilla/5.0 ..."
  },
  responseBody: {
    code: "A00004",
    msg: "Unauthorized",
    data: null,
    success: false
  },
  responseBodySize: 65,
  responseBodyTruncated: false,
  backendStatus: 401,
  errorCode: "AUTH_FAILED",
  durationMs: 83,
  route: "/"
}
```

`requestHeaders` 会打印真实出站 header，但 `Authorization`、Cookie、token、secret 等敏感字段会被掩码，只保留格式、首尾片段和长度。这个信息足够判断“有没有带 token、Java 是否误拼 Bearer、长度是否符合预期”，但不会在终端留下可直接复用的完整登录凭证。

`responseBody` 只在 `H5_BFF_LOG_BACKEND_RESPONSE=1` 时打印。打印前会对 `token`、`secret`、`mobile`、`phone`、`address` 等字段做掩码，并受 `H5_BFF_BACKEND_RESPONSE_LOG_LIMIT` 控制；超出上限时 `responseBodyTruncated` 为 `true`。本地和测试环境可以用它快速判断“Java 原始数据就是这样”还是“H5 mapper 转换错了”；正式环境默认关闭。

控制台里的 `[h5-bff-backend-call]` 使用格式化 JSON 输出，`banners`、`categoryTop8` 这类数组会展开打印，不会被 Node 默认控制台折叠成 `[Array]` / `[Object]`。

注意：`backendStatus` 是 HTTP 状态码，不等于业务成功。Java 后端可能返回 HTTP 200，但 body 是 `success:false / code:A00004`。这种情况日志会出现：

```text
backendStatus: 200,
backendBusinessSuccess: false,
backendBusinessCode: "A00004",
backendBusinessMessage: "Unauthorized"
```

此时 BFF 会把业务鉴权失败转换成前端更容易处理的 `401 / AUTH_FAILED`。

常见判断：

| 现象 | 优先看什么 |
| --- | --- |
| `TOKEN_MISSING` | App/WebView 是否写入 `mallToken` 或 `pythonToken` Cookie。 |
| `AUTH_FAILED` + `401/403` | token 是否过期、后端鉴权是否接受该 token。 |
| `HTTP_ERROR` + `backendStatus` | 后端接口路径、参数或服务端业务错误。 |
| `TIMEOUT` | 后端响应慢、网络链路或超时时间。 |
| `[h5-bff-route-error]` | H5 BFF 自身配置或代码异常，例如 `JAVA_API_BASE_URL is required.`。 |

线上部署后，这两类日志应进入 Node SSR 容器日志或平台日志系统。排查路径是：用户反馈 requestId -> 查 H5 SSR/BFF 日志 -> 根据同一个 `x-request-id` 查 Java / Python 后端日志。

### Java 业务码对照

Java 后端业务响应通常使用 `code`、`msg`、`success` envelope。H5 BFF 目前按 `ResponseEnum.java` 整理以下业务码，代码映射位于 `src/server/http/java-response-codes.ts`。

联调中最常见的是：

| Java code | Java enum | 含义 | H5 BFF 处理 |
| --- | --- | --- | --- |
| `A00004` | `UNAUTHORIZED` | 未授权 / token 无效。 | 转为 `AUTH_FAILED`，前端收到 HTTP 401。 |
| `A00005` | `EXCEPTION` | 服务器出了点小差。 | 转为 `HTTP_ERROR`，前端按可恢复后端错误处理。 |

当前已整理的完整启用码表：

| Java code | Java enum | msg / 说明 |
| --- | --- | --- |
| `00000` | `OK` | ok |
| `A00001` | `SHOW_FAIL` | 用于直接显示提示用户的错误，内容由输入内容决定 |
| `A00002` | `SHOW_SUCCESS` | 用于直接显示提示系统的成功，内容由输入内容决定 |
| `A00004` | `UNAUTHORIZED` | Unauthorized |
| `A00005` | `EXCEPTION` | 服务器出了点小差 |
| `A00007` | `DATA_ERROR` | 数据异常，请刷新后重新操作 |
| `A00012` | `TEMP_UID_ERROR` | TempUid Error |
| `A00013` | `NOT_FOUND` | 接口不存在 |
| `A00014` | `METHOD_ARGUMENT_NOT_VALID` | 方法参数没有校验 |
| `A00103` | `SHOW_DUPLICATE_USERS_FAIL` | 用户重复用户的错误，内容由输入内容决定 |
| `A03001` | `ORDER_DELIVERY_NOT_SUPPORTED` | The delivery method is not supported |
| `A03002` | `REPEAT_ORDER` | 订单已过期，请重新下单 |
| `A03003` | `COUPON_CANNOT_USE_TOGETHER` | 优惠券不能共用 |
| `A03010` | `NOT_STOCK` | not stock |
| `A04002` | `SOCIAL_ACCOUNT_BIND_BY_OTHER` | social account bind by other |
| `A07001` | `DELIVERY_OVER` | 用户收货地址超过配送范围 |
| `A10100` | `REVOKED_SHOP_USERS_FAIL` | 注销商家账号失败，内容由输入内容决定 |
| `A10101` | `REVOKED_DISTRIBUTION_USERS_FAIL` | 注销分销员账号失败，内容由输入内容决定 |
| `A10102` | `REVOKED_COUNT_FAIL` | 超过注销账号次数，内容由输入内容决定 |
| `66666` | `PROCESSING` | 处理中 |
| `66667` | `ACCEPTED` | 已受理 |

### 客户端上下文 Header

H5 请求链路需要保留设备、系统和 App 上下文，方便线上按机型、系统版本或 App 版本定位问题。

浏览器请求 BFF 时，浏览器或 WebView 会自动携带标准 `User-Agent`。H5 client 不手动设置 `User-Agent`，避免触碰浏览器禁止 header；App / 设备 / 系统信息通过稳定的 `x-*` header 补充。

| Header | 来源 | 说明 |
| --- | --- | --- |
| `user-agent` | WebView 自动携带，BFF 透传给后端 | WebView / 浏览器基础 UA。 |
| `x-request-id` | H5 client 或 BFF | 单次请求追踪号。 |
| `x-page-session-id` | H5 页面运行时 | 单次页面访问会话号。 |
| `x-h5-version` | H5 运行时 / 服务端环境 | H5 版本。 |
| `x-h5-route` | H5 页面运行时 | 当前 H5 页面路由。 |
| `x-app-name` | 原生 App / H5 启动上下文 | 应用名称，例如 `MeuMall`。 |
| `x-app-version` | 原生 App / H5 启动上下文 | App 版本号。 |
| `x-app-build` | 原生 App / H5 启动上下文 | App build 号。 |
| `x-platform` | 原生 App / H5 启动上下文 | `ios` / `android` / `web`。 |
| `x-os-version` | 原生 App / H5 启动上下文 | 系统版本。 |
| `x-device-model` | 原生 App / H5 启动上下文 | 设备型号。 |
| `x-webview-version` | 原生 App / H5 启动上下文 | WebView / WebKit 版本。 |

这些 header 不得包含 token、手机号、用户姓名、定位、完整地址、支付敏感信息或完整 Cookie。

H5 BFF 调 Java / Python 后端时应继续透传 `x-request-id` 和客户端上下文。Java / Python 后端第一阶段至少需要接收并记录这些字段；后续如接入 OpenTelemetry，再补 `traceparent`。

### SSR / BFF / CSR 边界

| 场景 | 推荐方式 | 说明 |
| --- | --- | --- |
| 首屏关键数据 | Server Component / SSR 直接调用 server service。 | 减少白屏，token 不进入浏览器 JS。 |
| 浏览器交互 | Client Component 调 `/api/bff/**`。 | 收藏、翻页、提交等操作。 |
| 高敏感数据 | BFF / Server Action。 | 不向浏览器暴露 token。 |
| 无需登录公共数据 | SSR 或 CSR 均可。 | 按缓存和性能决定。 |

### BFF 统一响应

```ts
type H5BffResult<T> =
  | { success: true; data: T; requestId: string }
  | {
      success: false;
      code: string;
      message: string;
      requestId?: string;
      recoverable: boolean;
    };
```

当前已提供示例 route：`src/app/api/bff/user/profile/route.ts`。它只展示调用链路，真实用户接口路径和字段仍需后续按业务 API 契约确认。

### 首页真实接口

首页首批真实接口通过 H5 BFF 接入：

```http
GET /api/bff/home
GET /api/bff/home/recommend-products?current=1&size=10
GET /api/bff/home/for-you-products?current=1&size=10
```

BFF 后端调用：

| 后端 | Method | Path | 说明 |
| --- | --- | --- | --- |
| Java | GET | `/p/app/home/index` | 首页聚合数据：banner、分类、热榜和秒杀模块。 |
| Java | GET | `/p/app/home/recommendProds?current=<current>&size=<size>` | 首页“为您推荐”首屏商品流，由 `/api/bff/home/recommend-products` 调用。 |
| Java | GET | `/p/app/home/forYouProds?current=<current>&size=<size>` | “相似推荐商品”更多页商品流，由 `/api/bff/home/for-you-products` 调用。 |

接口需要 `mallToken`。H5 浏览器端不读取 token，BFF 从 HttpOnly Cookie 读取 `mallToken` 并转成 `Authorization`。

首页 service 位于 `src/features/home/server/home-real-service.ts`。BFF 不直接透传 Java VO，也不再只返回被裁剪后的页面模型，而是返回三层结构：

```ts
type HomeBffData = {
  view: HomeExperienceData;
  modules: {
    banners: AppBannerVO[];
    hotCategory: ProdRankGroupDto | null;
    categoryTop8: CategoryDto[];
    seckillModule: AppSeckillModuleVO | null;
  };
  debugRaw?: {
    homeIndex: ServerResponseEntityAppHomeVO;
  };
};
```

- `view`：当前首页组件直接渲染的稳定视图模型。Java 字段名或包裹结构调整，但页面语义不变时，优先只改 BFF mapper。
- `modules`：保留首页业务模块和后端字段，方便后续首页增加字段、调整交互时直接查到对应数据，不必每次先回 BFF 里翻 mapper。`hotCategory.top3`、`seckillModule.products`、分类图标等字段即使当前页面暂时不用，也保留在模块对象内。
- `debugRaw`：仅 `GET /api/bff/home?debugRaw=1` 且 `APP_ENV=local/test` 时返回，用于联调对比 Java 原始 envelope；正式环境不返回。

首页推荐商品分页 BFF 返回：

```ts
type HomeRecommendProductsBffData = {
  view: {
    products: HomeProductCard[];
  };
  page: {
    current: number;
    size: number;
    total?: number;
    pages?: number;
    hasMore: boolean;
  };
  modules: {
    recommendProducts: AppRecommendProdVO[];
    recommendPage: IPageAppRecommendProdVO;
  };
  debugRaw?: {
    recommendProds: ServerResponseEntityIPageAppRecommendProdVO;
  };
};
```

“相似推荐商品”更多页分页 BFF 返回：

```ts
type HomeForYouProductsBffData = {
  view: {
    products: HomeProductCard[];
  };
  page: {
    current: number;
    size: number;
    total?: number;
    pages?: number;
    hasMore: boolean;
  };
  modules: {
    forYouProducts: AppRecommendProdVO[];
    forYouPage: IPageAppRecommendProdVO;
  };
  debugRaw?: {
    forYouProds: ServerResponseEntityIPageAppRecommendProdVO;
  };
};
```

浏览器端通过 `createHomeApi(createH5Client()).getHome()` 请求首页核心 BFF，通过 `getRecommendProducts({ current, size })` 请求首页推荐商品。当前首页渲染使用 `home.data.view`，推荐商品成功时合并 `recommend.data.view.products`。任一接口失败时，只回落对应区域，不让推荐分页拖慢或拖垮首页首屏。首页商品区底部进入视口后继续按 `current + 1` 请求 `/api/bff/home/recommend-products`，成功后追加商品；加载到第 2 页后展示“顶部”按钮，点击后平滑回到页面顶部。

首页“为您推荐”的“更多”按钮跳转 `/home/recommend-products`，新页面标题为“相似推荐商品”，页面结构参考 `/search`：顶部导航、搜索栏、筛选条件、商品列表。该页面通过 `getForYouProducts({ current, size })` 请求 `/api/bff/home/for-you-products`，再由 BFF 调 Java `/p/app/home/forYouProds`。页面底部进入视口时自动按 `current + 1` 加载下一页并追加商品；请求失败时保留已加载商品，用户可在底部继续触发加载。

首页不再请求旧的 `GET /api/h5/home/config/active?environment=prod`。获取当前 H5 active 版本使用 `GET /api/h5/manifest/active?environment=prod`；首页核心数据使用 `GET /api/bff/home`，首页推荐商品分页使用 `GET /api/bff/home/recommend-products`，相似推荐商品更多页分页使用 `GET /api/bff/home/for-you-products`。

### 商品详情真实接口

商品详情真实接口通过 H5 BFF 接入，本期只覆盖普通商品、快递配送、SKU 和立即购买到订单确认实时校验：

```http
GET /api/bff/product-detail?prodId=1000054
GET /api/bff/order-confirm?productId=1000054&skuId=<skuId>&quantity=1
```

BFF 后端调用：

| 后端 | Method | Path | 说明 |
| --- | --- | --- | --- |
| Java | GET | `/prod/prodInfo?prodId=<prodId>&addrId=0&dvyType=1` | 普通商品快递详情、SKU、价格、库存、图片和详情内容。 |
| Java | GET | `/shop/headInfo?shopId=<shopId>` | 店铺头部信息；主商品接口成功且存在 `shopId` 后尽量请求。 |
| Java | GET | `/prod/prodCommData?prodId=<prodId>&stationId=` | 评论统计；用于评价数量、好评率和评价标签。 |
| Java | GET | `/prod/prodCommPageByProd?prodId=<prodId>&size=10&current=1&evaluate=-1&stationId=` | 评论分页；首屏只取前两条作为概要。 |

接口需要 `mallToken`。H5 浏览器端不读取 token，BFF 从 HttpOnly Cookie 读取 `mallToken` 并转成 Java `Authorization: <mallToken>`。本地开发可使用 `APP_ENV=local` 下的 `H5_LOCAL_JAVA_TOKEN` 兜底。

`/prod/prodInfo.content` 是商品详情富文本 HTML 字符串。H5 BFF mapper 会先对富文本执行白名单清洗，再把清洗后的 HTML 放入 `view.detail.richContentHtml`；页面组件使用 `ProductRichContent` 将 HTML 解析为 React 节点。当前富文本规则：

- 使用 `sanitize-html` 移除 `script`、`iframe`、事件属性和危险协议。
- 使用 `html-react-parser` 将清洗后的 HTML 渲染为 React 节点，不直接使用未清洗的 `dangerouslySetInnerHTML`。
- 允许常规段落、标题、列表、表格、链接和图片标签。
- 富文本图片相对路径按 `JAVA_OSS_ASSET_BASE_URL` 拼接，完整 `http(s)` 或 `data:` URL 保持原样。
- `content` 缺失或清洗后为空时，详情区展示商品描述兜底。

商品详情 BFF 成功响应：

```ts
type ProductDetailBffData = {
  view: ProductDetailData;
  modules: {
    commentPage?: JavaProductCommentPage;
    commentSummary?: JavaProductCommentSummary;
    productInfo: JavaProductInfo;
    shopInfo?: JavaShopHeadInfo;
    skuList: JavaProductSku[];
  };
  debugRaw?: {
    prodInfo: JavaEnvelope<JavaProductInfo>;
  };
};
```

订单确认 BFF 成功响应：

```ts
type OrderConfirmBffData = {
  view: OrderConfirmData;
  modules: {
    productInfo: JavaProductInfo;
    selectedSku: JavaProductSku;
  };
  debugRaw?: {
    prodInfo: JavaEnvelope<JavaProductInfo>;
  };
};
```

页面使用方式：

- `/product/[id]` 数字 ID 会渲染远程商品加载壳，客户端通过 `createProductApi(createH5Client()).getProductDetail()` 请求 BFF。
- 本地 mock 商品 `p-1001` 不自动请求真实接口，用于静态高保真和本地回归验证。
- 商品详情区优先展示 `view.detail.richContentHtml`，没有富文本时回退到 `view.detail.description` 和现有详情占位图。
- 商品主图使用 `view.mediaItems`，支持 `video` + `imgs` 混合轮播；视频存在时作为第一项，封面使用 OSS `video/snapshot` 首帧规则。
- 售后保障按 Java `afterSaleType`、`afterSaleContent` 映射；资质条按 `prodCertificateRecordDtoList` 映射；无字段时不展示静态兜底。
- 商品主数据成功后，BFF 会尽量聚合店铺头部、评论统计和评论分页；店铺头部仅保留在 modules，详情页不展示店铺卡片；评论辅助接口失败时展示评价空态，不影响商品基础信息、SKU 和立即购买。
- 评论分页只用于首屏概要，`view.reviewSummary.reviews` 最多保留前两条；完整评论列表后续单独实现。
- 购买弹窗确认时只携带 `productId`、`skuId`、`quantity`，不携带价格快照。
- `/order-confirm` 会通过 `getOrderConfirm()` 重新请求商品详情并校验 SKU、库存和价格；校验失败时禁止继续交易。

本期明确不包含：

- 秒杀、拼团、自提、同城、门店定位。
- 购物车数量和加入购物车；喵呜无购物车。
- 正式创建订单、支付 Bridge、收藏、优惠券领取、分享海报。

根级契约：`.ai-workspace/contracts/api/h5-product-detail-real-flow-contract.md`。

本地联调需要设置：

```bash
JAVA_API_BASE_URL=https://test.aigcpop.com/mini_h5
JAVA_OSS_ASSET_BASE_URL=https://awu-mall-file.oss-cn-guangzhou.aliyuncs.com/
PYTHON_API_BASE_URL=https://test.aigcpop.com/api
H5_BFF_LOG_BACKEND_RESPONSE=1
H5_BFF_BACKEND_RESPONSE_LOG_LIMIT=30000
```

### 首页原生传参展示

首页已增加原生传参展示面板，调用 `/api/bff/runtime/context` 获取服务端调试信息：

- `pythonToken`：展示是否存在、长度和完整值。
- `mallToken`：展示是否存在、长度和完整值。
- `statusHeight`：展示原生传入的状态栏高度，并写入 `--native-status-height` CSS 变量。
- `meu_page_config`：展示可解析的页面配置。
- 其它 Cookie：展示完整值。
- URL 参数：展示 App 打开 H5 时附带的启动参数。
- 环境信息：展示 `APP_ENV` 和 `H5_VERSION` / `H5_RELEASE_LABEL`。

该面板仅用于当前内部开发联调，线上正式业务开放前必须删除或增加服务端开关关闭。Cookie 完整值不得进入日志、埋点和长期文档截图。

## 首版 API Client

首版实现位于 `src/lib/api`，只提供共享请求边界，不包含任何业务接口。

```ts
const client = createApiClient({
  baseUrl: "/api/bff",
  h5Version: "2026.05.15-001"
});

const result = await client.request<UserProfile>("/profile", {
  auth: true,
  route: "/profile"
});
```

### 配置

| 字段 | 说明 |
| --- | --- |
| `baseUrl` | 必填，API 请求基础地址。 |
| `fetcher` | 可选，默认使用 `globalThis.fetch`，测试中可注入 mock。 |
| `bridge` | 可选，默认使用项目 Native Bridge；用于读取 `user.getToken`。 |
| `tokenProvider` | 可选，覆盖默认 Bridge token 来源。 |
| `requestIdFactory` | 可选，默认使用 `crypto.randomUUID()`，测试中可固定。 |
| `timeoutMs` | 可选，默认 `10000`。 |
| `h5Version`、`appVersion`、`platform`、`channel`、`route` | 可选，请求追踪上下文。 |

### 请求规则

- `path` 会和 `baseUrl` 做安全拼接，避免重复或缺失 `/`。
- 默认方法为 `GET`；存在 `body` 时默认方法为 `POST`。
- `body` 以 JSON 发送，并自动补充 `content-type: application/json`。
- `auth: true` 时必须拿到 token，否则不发起网络请求。
- 首版不实现自动重试，避免在幂等性策略未确认前重复请求。
- 首版不持久化 token，不实现 token 刷新闭环。

### 请求头

首版固定注入以下 header：

| Header | 来源 |
| --- | --- |
| `x-request-id` | `requestIdFactory` 或默认 requestId 生成器。 |
| `x-h5-version` | `createApiClient` 的 `h5Version`，缺省为 `unknown`。 |
| `x-route` | 单次请求 `route`、client 默认 `route` 或 `unknown`。 |
| `authorization` | `auth: true` 时注入 `Bearer <token>`。 |

### 鉴权 token 来源

默认 token 来源预留给 Native Bridge：

```ts
nativeBridge.call("user.getToken")
```

若 Bridge 不可用、方法不存在、调用失败或返回空 token，`auth: true` 请求返回 `TOKEN_MISSING`，不会继续请求后端。

> 注意：旧 `src/lib/api/createApiClient` 仍保留，用于兼容早期 Bridge token 方案和本地测试。正式业务接口优先使用 H5 BFF / server services，不再让浏览器端直接持有 token 调后端。

## 请求元信息模板

```ts
type RequestMeta = {
  requestId: string;
  route: string;
  h5Version: string;
  appVersion?: string;
  platform?: "ios" | "android" | "web";
  channel?: string;
};
```

## 标准 API 结果

```ts
type ApiResult<T> =
  | { ok: true; data: T; meta?: Record<string, unknown> }
  | { ok: false; error: ApiError };
```

## 标准 API 错误

```ts
type ApiError = {
  code:
    | "TOKEN_MISSING"
    | "AUTH_FAILED"
    | "NETWORK_ERROR"
    | "TIMEOUT"
    | "HTTP_ERROR"
    | "PARSE_ERROR";
  message: string;
  httpStatus?: number;
  requestId?: string;
  recoverable: boolean;
  details?: Record<string, unknown>;
};
```

## 首版错误归一化

| Code | 触发条件 | recoverable | 备注 |
| --- | --- | --- | --- |
| `TOKEN_MISSING` | `auth: true` 但 token 不可用。 | `true` | 不发起网络请求，不暴露敏感信息。 |
| `AUTH_FAILED` | HTTP `401` 或 `403`。 | `true` | 后续接入统一重新登录或刷新策略。 |
| `NETWORK_ERROR` | `fetch` reject 或网络异常。 | `true` | `details.message` 只记录安全错误信息。 |
| `TIMEOUT` | 请求超过 `timeoutMs`。 | `true` | 通过 `AbortController` 取消请求。 |
| `HTTP_ERROR` | 非 `2xx` 且非鉴权失败。 | `true` | 保留 `httpStatus` 和安全响应体摘要。 |
| `PARSE_ERROR` | 响应体无法按预期解析。 | `false` | 当前作为预留错误码。 |

## Active Manifest 请求

active manifest 属于发布控制面请求，不走业务 `createApiClient`，避免鉴权、业务 base URL 和重试策略影响发布切流。

H5 通过 `src/lib/manifest/server-fetcher.ts` 拉取 server-meumall 提供的 active manifest：

```ts
const fetchManifest = createHttpManifestFetcher({
  url: process.env.NEXT_PUBLIC_H5_MANIFEST_URL
});
```

请求规则：

- 默认 endpoint 由 `NEXT_PUBLIC_H5_MANIFEST_URL` 或 `H5_MANIFEST_URL` 提供。
- 默认发送 `accept: application/json`。
- HTTP 非 2xx 直接抛错。
- JSON 解析失败直接抛错。
- schema 校验、last-known-good 缓存和路由解析仍由 manifest runtime 负责。

## 鉴权规则

- 未明确批准时，H5 不持久化长生命周期 token。
- 原生提供的鉴权信息优先通过 HttpOnly Cookie 传给 H5 服务端；Bridge token 只作为后续明确确认的补充方案。
- 鉴权失败应有统一重新登录或刷新策略。
- 敏感信息不得写入日志。
- H5 不负责注册和登录；401/403 时应通知原生 App 处理登录态刷新、重新登录或退出。

## 环境模板

| 环境 | Base URL | 说明 |
| --- | --- | --- |
| local |  | 本地开发。 |
| dev |  | 开发环境。 |
| qa |  | 测试环境。 |
| prod |  | 生产环境。 |

## API 定义模板

```markdown
### <接口名称>

**方法与路径**

`GET /api/example`

**描述**

**请求**

```ts
type Request = {};
```

**响应**

```ts
type Response = {};
```

**错误**

| Code | 含义 | UI 处理 |
| --- | --- | --- |

**备注**
```

## 待确认问题

- API 流量由 H5 直接请求，还是由原生代理？
- token 刷新流程是什么？
- 必须携带哪些请求追踪 header？
- 本地开发使用什么 mock 策略？
- 原生 App 最终 Cookie 属性、SameSite 取值和 iOS / Android WebView 写入方式是什么？
- Java / Python 测试和正式 base URL 分别是什么？
