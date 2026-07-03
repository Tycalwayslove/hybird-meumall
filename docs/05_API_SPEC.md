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
| `userInfo` | 原生 App 写入的用户基础信息 JSON，钱包汇总读取其中 `phone` 作为 Java `userMobile` 参数，钱包推广订单读取其中 `phone` 作为 Java `userId` 参数。 | 否 | `HttpOnly; Secure; Path=/; SameSite=Lax` |
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
| Cookie 中已同时存在 `mallToken`、`pythonToken` 和 `userInfo` | 直接跳回目标页面。 |
| 缺少 token，且没有原生运行信号 | 展示 Java Token / Python Token / UserInfo JSON 输入框，提交后写入调试 Cookie。 |
| 已有 `mallToken` 和 `pythonToken`，但缺少 `userInfo` | 直接访问 `/debug-login` 时仍展示表单，便于补写钱包联调所需 `userInfo.phone`；首页不会因此自动跳转到调试页。 |
| 检测到原生运行信号 | 返回 404，不展示调试页。 |

原生运行信号包括 `statusHeight`、`meu_page_config`、`x-app-version`、`x-app-build`、`x-device-model`、`x-os-version`、`x-webview-version`，以及 `x-platform=ios/android`。原生 App WebView 应始终由 App 写入 `mallToken` 和 `pythonToken`，不依赖该页面。

UserInfo JSON 可留空；如果填写，必须是包含非空 `phone` 的 JSON 对象，例如 `{"phone":"37"}`。`/` 首页在浏览器独立 H5、无 token、无原生信号时会跳转到 `/debug-login?redirect=/`，用于解决线上版本浏览器调试无法获取 token 的问题。调试页写入的 token 和 userInfo Cookie 不是 HttpOnly，仅用于手动联调；不要把真实 token、手机号或完整 userInfo 写入代码、环境 profile、文档或日志。

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

### 注册后实名认证 BFF

注册后认证流程新增认证业务 adapter `src/features/certification/api.ts`，页面仍只请求自身 BFF：

| BFF | 后端 | 鉴权 | 说明 |
| --- | --- | --- | --- |
| `GET /api/bff/certification/apply-url?name=<真实姓名>` | Java `GET /p/allinpay/member/getCreateMemberApplyUrl?name=<真实姓名>` | Java token | 获取通联个人会员开户 H5 链接，前端使用 `data.view.applyUrl` 打开外部认证页面。 |
| `GET /api/bff/certification/member-info` | Java `GET /p/allinpay/member/getMemberBasicInfoV2` | Java token | 查询会员信息，H5 按 `phone` 存在、`isRealNameAuth=1`、`isWithdraw=1` 判定认证成功。 |

认证页面可能由 App 内 Cookie 入口进入，也可能由独立 H5 URL 携带 `token` 进入。认证 BFF 的 Java token 优先级：

1. 前端从 URL query 读取 `token` 后，通过请求头 `x-meumall-auth-token` 传给自身 BFF。
2. 如果请求头没有 token，BFF 使用 Cookie 中的 `mallToken`。
3. 两者都缺失时，BFF 返回 token 缺失错误，由页面展示认证失败或重新进入提示。

`x-meumall-auth-token` 只用于 H5 到自身 BFF 的临时鉴权传递，不作为后端接口契约；BFF 到 Java 后端仍统一使用 `Authorization: <mallToken>`。

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
| Java | GET | `/p/app/home/index` | 首页聚合数据：banner 和 `navList` 首页导航入口。 |
| Java | GET | `/p/app/home/recommendProds?current=<current>&size=<size>` | 首页“为您推荐”首屏商品流，由 `/api/bff/home/recommend-products` 调用。 |
| Java | GET | `/p/app/home/forYouProds?current=<current>&size=<size>` | “相似推荐商品”更多页商品流，由 `/api/bff/home/for-you-products` 调用。 |

接口需要 `mallToken`。H5 浏览器端不读取 token，BFF 从 HttpOnly Cookie 读取 `mallToken` 并转成 `Authorization`。

首页 service 位于 `src/features/home/server/home-real-service.ts`。BFF 不直接透传 Java VO，也不再只返回被裁剪后的页面模型，而是返回三层结构：

```ts
type HomeBffData = {
  view: HomeExperienceData;
  modules: {
    banners: AppBannerVO[];
    navList: AppHomeNavVO[];
    hotCategory: ProdRankGroupDto | null;
    categoryTop8: CategoryDto[];
    seckillModule: AppSeckillModuleVO | null;
  };
  debugRaw?: {
    homeIndex: ServerResponseEntityAppHomeVO;
  };
};
```

- `view`：当前首页组件直接渲染的稳定视图模型。首页类目直接来自 Java `navList`；`navType=1` 进入热榜 `/search/ranking`，若 Java 同时返回 `rankType/categoryId` 则携带到完整榜单用于默认选中对应标签；`navType=2` 进入带 `categoryId` 的搜索结果 `/search?categoryId=<id>`；`navType=3` 进入完整分类页 `/category`。
- `modules`：保留首页业务模块和后端字段，方便后续首页增加字段、调整交互时直接查到对应数据，不必每次先回 BFF 里翻 mapper。`navList` 是当前分类展示来源；`hotCategory/categoryTop8` 如后端仍返回，仅作为兼容调试字段保留，不参与首页分类拼接。
- `debugRaw`：仅 `GET /api/bff/home?debugRaw=1` 且 `APP_ENV=local/test` 时返回，用于联调对比 Java 原始 envelope；正式环境不返回。

首页“限时秒杀”和“推广带货”入口卡是 H5 固定 UI，不再由 `/p/app/home/index` 或首页配置控制。两个入口分别固定跳转 `/seckill` 和 `/promotion/products`；进入对应页面后再由 `/api/bff/seckill/products` 和 `/api/bff/promotion/products` 请求真实商品列表。

推广首页 `/promotion` 已接入真实概览 BFF：浏览器端或 SSR 统一消费 `/api/bff/promotion/home`，BFF 调 Java `/p/distribution/home/overview`。接口返回 `userInfo`、`level`、`mySales`、`salesStats` 和 `ongoingIncentiveCount`，H5 mapper 映射为推广首页现有 `profile/theme/summary/quickEntries/metrics/tools` view model，并保留 `modules.overview` 便于联调排查。联调阶段 token 缺失、鉴权失败、接口失败或 `data` 缺失时展示错误态，不回退本地 mock 推广首页数据。

我的页 `/mine` 已接入真实概览 BFF：SSR 消费 `/api/bff/mine/summary`，BFF 聚合 Java `/p/app/profile/summary` 和 `/p/daren/level/myLevel`。`walletBalance/yearSavedAmount/couponCount` 映射为我的页三项指标，`banners` 取 `seq` 最小的一张作为个人中心 banner，当前等级映射为权益中心入口 `/promotion/benefits?level=<v>`。联调阶段接口失败、token 缺失或 `data` 缺失时展示错误态，不回退 `minePageData` mock。

钱包 `/wallet` 已接入真实 BFF，且钱包汇总和推广订单已拆分：浏览器端消费 `/api/bff/wallet/summary` 获取 Java `/p/distribution/wallet/infoV2?userMobile=<userInfo.phone>` 的分销钱包汇总；消费 `/api/bff/wallet/orders?state=settled|pending&current=1&size=10` 获取推广订单，BFF 从原生 Cookie `userInfo` 解析 `phone` 作为 `/p/distribution/api/queryPromotionOrder` 的 `userId` 参数；消费 `/api/bff/wallet/history-status` 获取 Python `/user/wallet_state` 的历史钱包状态，`state=1` 时才展示导航栏右侧“历史钱包”入口。点击该入口会通过 Native Bridge 发送 `router/navigate`，`payload.route=history-wallet`，由 App 打开原生历史钱包页。`state=settled` 映射 Java `state=2`，`state=pending` 映射 Java `state=1`。页面切换“已结算 / 待结算”时只重置订单列表并请求订单第一页，触底后按 `current + 1` 加载更多订单；钱包金额不随订单 tab 反复请求。钱包账户余额和可提现金额都展示 `canWithdrawAmount`，该字段后端尚未上线时 H5 按 `0` 展示；钱包汇总接口失败时只展示金额空占位，不额外展示页内错误卡或重试按钮。推广订单接口失败时展示订单空态组件，不展示接口错误文案。点击“提现”打开金额弹窗，页面先校验金额大于 0、最多两位小数且不超过 `canWithdrawAmount`；提交消费 `POST /api/bff/wallet/withdraw`，BFF 会再次读取 `/p/distribution/wallet/infoV2?userMobile=<userInfo.phone>` 校验 `amount <= canWithdrawAmount`，再转 Java `/p/allinpay/member/memberWithdrawApply`，body 只包含 `{ amount }`，不传 `signNum/notifyUrl`。点击“提现记录”进入 `/wallet/withdraw-records`，页面消费 `/api/bff/wallet/withdraw-records?current=1&size=10`，BFF 转 Java `/p/userWithdraw/pageDateUserWithdrawCash`，响应按 `date + withdrawCashVOs` 年月分组展示，并支持触底加载更多和空态。点击“帐户管理”进入 `/wallet/account`，当前只展示“认证信息”入口；点击后进入 `/wallet/account/certification`，页面消费 `/api/bff/wallet/member-info`，BFF 转 Java `/p/allinpay/member/getMemberBasicInfoV2` 获取会员姓名和身份证号，同时复用 `/api/bff/wallet/bank-cards` 获取银行卡列表并可跳转 `/wallet/bank-cards`。旧 `/api/bff/wallet` 仅保留为汇总兼容入口，不再聚合订单。银行卡管理 `/wallet/bank-cards` 消费 `/api/bff/wallet/bank-cards`，BFF 调 `/p/allinpay/member/queryBankCardV2` 并过滤已解除卡；添加银行卡 `/wallet/bank-cards/add` 消费 `POST /api/bff/wallet/bank-cards/apply`，BFF 转 Java `/p/allinpay/member/createMemberApply`，body 只包含 `{ acctNum, cerNum, phone }`，不传 `signNum/name`；添加成功后返回银行卡管理并展示“添加成功”提示。解绑银行卡消费 `POST /api/bff/wallet/bank-cards/unbind`，BFF 转 Java `/p/allinpay/member/unbindBankCardV2`，body 只包含 `{ acctNum }`，不传 `signNum`。提现申请、创建会员申请和解绑所需 `signNum/name` 等会员信息由后端自行获取，需要 App token 联调确认。

权益中心 `/promotion/benefits` 已接入真实等级 BFF：SSR 消费 `/api/bff/promotion/benefits`，BFF 聚合 Java `/p/daren/level/myLevel` 和 `/p/daren/level/list`。`myLevel` 用于当前等级、进度和佣金倍率，`level/list` 用于可切换等级列表和权益项。页面继续支持左右滑、箭头和等级轨道切换；等级列表为空或接口失败展示错误态，不回退本地 mock。Apifox description 中仍写旧 `/p/distribution/level/...`，当前 OpenAPI path 为 `/p/daren/level/...`，H5 以 OpenAPI path 为准。

推广排行榜销量榜和销售额榜已接入真实 BFF：`/promotion/ranking/sales` 和 `/api/bff/promotion/rankings/sales` 调 Java `/p/distribution/rank/list?rankType=1`；`/promotion/ranking/amount` 和 `/api/bff/promotion/rankings/amount` 调 Java `/p/distribution/rank/list?rankType=2`。H5 `period=day/week/month` 映射 Java `period=1/2/3`，可选 `statPeriod` 按原值透传；我的排名来自同一响应内 `myRank`。接口成功后只渲染真实 `rankList/myRank`，空数组展示榜单空态，失败或 token 缺失展示错误态，不回退 mock 榜单。榜单类型和周期切换只更新页面 state 与 BFF 请求，不调用 router、不更新 query、不追加 WebView history。达人激励榜当前路由为 `/promotion/ranking/incentive`，本阶段固定展示空态，不请求 `rankType=4`。

推广激励活动中心和详情已接入真实 BFF：`/promotion/activities` 和 `/api/bff/promotion/activities` 调 Java `/p/app/distribution/incentive/page`，支持 `current/size/orderBy/displayStates`；活动中心首屏分别传 `displayStates=[1,2,3,4]` 和 `[0]` 展示进行中、已暂停活动，顶部数量取 `ongoingActivityCount`；`/promotion/activities/history` 传 `displayStates=[6]` 展示历史活动且不展示底部历史入口。`/promotion/activities/[id]` 和 `/api/bff/promotion/activities/[id]` 当前只请求 Java `/p/app/distribution/incentive/detail/{id}`，用于活动基础信息、个人进度、奖励规则和规则页内容。详情页顶部不展示活动标题和 `ruleSummary` 摘要，导航栏右侧入口为“活动规则”，进入 `/promotion/activities/[id]/rules` 展示清洗后的 `ruleContent`；主按钮按 `displayState` 映射：`2` 为“去带货”并跳 `/promotion/products`，`4` 为“去领奖”并跳 `/promotion/activities/[id]/reward?mode=receive`，`5` 为“查看奖励”并跳 `/promotion/activities/[id]/reward?mode=view`，`0/1/3` 不展示按钮。奖励页 `/promotion/activities/[id]/reward` 通过 `/api/bff/promotion/activities/[id]/reward` 单独请求 Java `/p/app/distribution/incentive/reward/detail/{id}`，展示活动完成文案和 `details` 中所有奖励；`deliverState=0` 展示“领取”并调用 `PATCH /api/bff/promotion/activities/rewards/[recordId]/receive` 转发 Java `/p/app/distribution/incentive/reward/receive/{recordId}`，可选 `addressId`，`deliverState=1/2` 展示“查看”并打开奖励详情弹层。列表空数组展示活动空态，非法详情 id 走 404，接口失败或 token 缺失展示错误态，不回退本地 mock。

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

浏览器端通过 `createHomeApi(createH5Client()).getHome()` 请求首页核心 BFF，通过 `getRecommendProducts({ current, size })` 请求首页推荐商品。当前首页渲染使用 `home.data.view`，推荐商品成功时合并 `recommend.data.view.products`。任一接口失败时，只展示错误/空业务态，不使用 `homeExperienceData` 补齐 banner、分类或推荐商品；首页固定活动入口不属于接口 fallback。首页商品区底部进入视口后继续按 `current + 1` 请求 `/api/bff/home/recommend-products`，成功后追加商品；加载到第 2 页后展示“顶部”按钮，点击后平滑回到页面顶部。

首页“为您推荐”的“更多”按钮跳转 `/home/recommend-products`，新页面标题为“相似推荐商品”，页面结构参考 `/search`：顶部导航、搜索栏、筛选条件、商品列表。该页面通过 `getForYouProducts({ current, size })` 请求 `/api/bff/home/for-you-products`，再由 BFF 调 Java `/p/app/home/forYouProds`。页面底部进入视口时自动按 `current + 1` 加载下一页并追加商品；请求失败时保留已加载商品，用户可在底部继续触发加载。

首页不再请求旧的 `GET /api/h5/home/config/active?environment=prod`。获取当前 H5 active 版本使用 `GET /api/h5/manifest/active?environment=prod`；首页核心数据使用 `GET /api/bff/home`，首页推荐商品分页使用 `GET /api/bff/home/recommend-products`，相似推荐商品更多页分页使用 `GET /api/bff/home/for-you-products`。

### 搜索热门词真实接口

搜索首页热门搜索词通过 H5 BFF 接入：

```http
GET /api/bff/search/hot-keywords?type=1
```

BFF 后端调用：

| 后端 | Method | Path | 说明 |
| --- | --- | --- | --- |
| Java | GET | `/search/hotSearch?type=1` | 查看全局热搜，商品热词，来自后台 `tz_hot_search` 配置，最多 7 条。 |

接口需要 `mallToken`。H5 浏览器端不读取 token，BFF 从 HttpOnly Cookie 读取 `mallToken` 并转成 Java `Authorization: <mallToken>`。

Apifox `HotSearchDto` 字段：

```ts
type HotSearchDto = {
  hotSearchId?: number;
  title?: string;
  content?: string;
  status?: number;
  type?: number;
  seq?: number;
  shopId?: number;
  jumpType?: number;
  jumpValue?: string;
};
```

H5 BFF 响应：

```ts
type SearchHotKeywordsBffData = {
  view: {
    hotKeywords: string[];
  };
  modules: {
    hotSearches: HotSearchDto[];
  };
  debugRaw?: {
    hotSearch: ServerResponseEntityHotSearchDtoArray;
  };
};
```

映射规则：

- `view.hotKeywords` 优先取 `title`，缺失时取 `content`。
- `status=0` 的热词不进入视图。
- 按 `seq` 升序展示，最多 7 条。
- Java 返回空数组时展示“暂无热门搜索”，不拼接本地 mock 热词。
- BFF 失败时展示“热门搜索加载失败”，不回退 mock。

搜索历史不走后端接口，保存在浏览器 localStorage，key 为 `meumall.search.history`；提交搜索或点击热词会写入本地历史，顶部删除按钮清空全部历史，单个历史标签右侧删除按钮只删除对应关键词。

根级契约：`.ai-workspace/contracts/api/h5-search-hot-keywords-contract.md`。

### 搜索热榜真实接口

搜索首页下方热榜模块和完整热榜页通过 H5 BFF 接入：

```http
GET /api/bff/search/ranking?categoryBoardCount=4
GET /api/bff/search/ranking
GET /api/bff/search/ranking?rankType=2&categoryId=<categoryId>
```

BFF 后端调用：

| 后端 | Method | Path | 说明 |
| --- | --- | --- | --- |
| Java | GET | `/search/rankTabs?categoryBoardCount=<n>` 或 `/search/rankTabs` | 商品分类排行榜顶部标签；搜索首页传 `categoryBoardCount=4`，完整榜单页不传。 |
| Java | GET | `/search/rank/{rankType}` | 查询商品排行榜商品列表；品类热榜额外传 `categoryId`。 |

接口需要 `mallToken`。H5 浏览器端不读取 token，BFF 从 HttpOnly Cookie 读取 `mallToken` 并转成 Java `Authorization: <mallToken>`；Java 出站请求统一携带 `source: 1`。

Apifox 字段：

```ts
type ProdRankTabDto = {
  rankType?: number; // 1=喵呜热榜，2=品类热榜
  rankName?: string;
  categoryId?: number | string;
};

type ProductCardVO = {
  prodId?: number | string;
  prodName?: string;
  pic?: string;
  price?: number;
  displayPrice?: number;
  oriPrice?: number;
  soldNum?: number;
  activityType?: number; // 0=普通商品，1=秒杀
  isHot?: boolean;
  isRecommend?: boolean;
};
```

H5 BFF 响应：

```ts
type SearchRankingBffData = {
  view: {
    tabs: Array<{ id: string; label: string; rankType: 1 | 2; categoryId?: string }>;
    activeTabId: string;
    notice: string;
    products: Array<{
      id: string;
      href: string;
      title: string;
      feature: string;
      price: number;
      originalPrice: number;
      soldText: string;
      imageUrl?: string;
      badge?: { type: "seckill" | "hot" | "recommend"; label: string };
    }>;
  };
  modules: {
    rankTabs: ProdRankTabDto[];
    products: ProductCardVO[];
  };
};
```

映射规则：

- `rankType=1` 生成 `rank-1`；`rankType=2 + categoryId` 生成 `rank-2-<categoryId>`。
- `/search` 首页热榜标签请求 `categoryBoardCount=4`，商品列表只展示前三条。
- `/search/ranking` 完整榜单页不传 `categoryBoardCount`，商品列表按接口返回完整展示。
- `/search` 点击“查看完整榜单”时携带当前标签：喵呜热榜进入 `/search/ranking?rankType=1`，品类榜进入 `/search/ranking?rankType=2&categoryId=<categoryId>`。
- `/search/ranking` 首屏读取 URL `rankType/categoryId` 作为初始标签和首个商品请求；页内切换标签只更新组件 state 和 BFF 请求，不调用 router、不更新 query。
- 从 `/search` 点击商品详情或“查看完整榜单”离开搜索上下文时，H5 使用 `window.location.replace(buildClientHref(...))` 替换当前搜索 history；原生返回按钮或 App 滑动返回应回到搜索页之前的首页，而不是回到搜索页。
- 切换品类热榜时，H5 BFF 请求 `/search/rank/2?categoryId=<categoryId>`。
- 商品卡点击进入 `/product/<prodId>`，不携带价格快照。
- `displayPrice` 优先作为展示价，缺失时回退 `price`；`oriPrice` 缺失时回退展示价。
- `activityType=1` 展示“限时秒杀”，`isHot=true` 展示“热销”，`isRecommend=true` 展示“推荐”。
- 图片相对路径通过 `JAVA_OSS_ASSET_BASE_URL` 拼接；完整 `http(s)` URL 原样使用。
- 标签或商品为空时展示空态；搜索页热榜区域使用绿色背景，空态外层必须保持透明，不使用白底卡片；接口失败时展示“热榜加载失败”；不回退本地 mock 商品。

根级契约：`.ai-workspace/contracts/api/h5-search-ranking-contract.md`。

### 搜索结果商品真实接口

搜索结果页通过 H5 BFF 接入 Java 商品分页接口：

```http
GET /api/bff/search/products?keyword=<keyword>&orderBy=<orderBy>&categoryId=<categoryId>
```

BFF 后端调用：

| 后端 | Method | Path | 说明 |
| --- | --- | --- | --- |
| Java | GET | `/p/app/prod/page` | 自购商城 App 分页查询商品；支持 `current/size/orderBy/keyword/categoryId`。 |
| Java | GET | `/category/list?parentId=<parentId>&shopId=0` | 获取分类筛选项；搜索筛选场景默认不传 `depth`，让后端返回当前类目的所有子孙类目；无分类入口时 `parentId=0`。 |
| Java | GET | `/category/list?parentId=0&shopId=0` | 无分类入口时获取全局分类树。 |

接口需要 `mallToken`。H5 浏览器端不读取 token，BFF 从 HttpOnly Cookie 读取 `mallToken` 并转成 Java `Authorization: <mallToken>`；Java 出站请求统一携带 `source: 1`。

H5 BFF Query：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `current` | number | 页码，默认 `1`。 |
| `size` | number | 每页条数，默认 `10`。 |
| `orderBy` | string | 排序，H5 只透传 `soldNum`、`price`、`createTime` 白名单字段，格式 `+field` 或 `-field`。 |
| `keyword` | string | 搜索词；为空时不传给 Java。 |
| `categoryId` | number/string | 当前商品分类筛选 ID；为空时不传给 Java，表示全局搜索。 |
| `scopeCategoryId` | number/string | 分类入口 scope，仅用于获取子分类筛选项。 |
| `categoryOptionsParentId` | number/string | 当前展开分类的父级类目 ID；点击分类筛选项后用于继续获取子孙类目。 |

入口规则：

- 首页 `navType=2` 或分类页 leaf 进入 `/search?categoryId=<categoryId>`，无关键词也展示搜索结果页。
- 搜索框、热门搜索、搜索历史进入 `/search?q=<keyword>`，不带 `categoryId`，表示全局搜索。
- 分类入口下再次搜索进入 `/search?q=<keyword>&categoryId=<categoryId>`，在当前分类 scope 内搜索。
- 排序只展示“销量”和“价格”两个条件；两者互斥，同一条件重复点击在升序/降序间切换，并高亮对应上下箭头。
- 销量降序映射 `orderBy=-soldNum`，销量升序映射 `orderBy=+soldNum`；价格从低到高映射 `orderBy=+price`，价格从高到低映射 `orderBy=-price`。
- 带 `categoryId` 的分类入口，后续分类筛选通过 `/category/list?parentId=<categoryId>&shopId=0` 获取当前类目的所有子孙类目；不带 `categoryId` 时从 `parentId=0` 获取全局分类树。
- 搜索结果页分类接口默认不传 `depth`；BFF 递归保留 Java 返回项中的 `children/categories` 子孙树，分类筛选点击后优先直接展示当前节点已返回的 `children`，并继续传 `categoryOptionsParentId=<clickedCategoryId>` 按需刷新当前类目子孙；接口无子级时停在当前层级，不展示本地兜底。
- 搜索结果筛选区展示“综合筛选”摘要、销量/价格分段按钮和分类层级标题；排序/分类切换只更新页面 state 与 BFF 请求，不修改 URL。
- 分类面板展开时展示蒙层并锁定页面滚动；点击分类项只更新待确认状态，不请求商品接口；点击“确认”后应用分类并请求 BFF；点击“重置”清空分类并重新请求当前 scope。
- 搜索结果页内再次提交搜索词或清空搜索词时，只更新当前页面关键词 state，并用 `history.replaceState` 同步 URL；排序和分类筛选 state 必须保留。
- 搜索输入框使用 `type=text` 和 H5 自定义清空按钮，避免浏览器原生 search 清除按钮与自定义清空按钮重复。
- 搜索结果商品有下一页时，底部哨兵进入视口自动请求下一页并追加，不再展示手动“加载更多”按钮。
- 商品为空时展示通用 `EmptyState`，不拼接本地 mock 商品。
- 搜索结果页首屏只展示骨架屏；商品或分类接口失败时展示错误态，不回退本地 mock 商品或分类。
- 商品卡点击进入 `/product/<prodId>`，使用 replace 式离开搜索页，避免 App 返回或滑动返回停回搜索页。

根级契约：`.ai-workspace/contracts/api/h5-search-products-contract.md`。

### 商品分类列表真实接口

商品分类页通过 H5 BFF 接入：

```http
GET /api/bff/category/list
```

BFF 后端调用：

| 后端 | Method | Path | 说明 |
| --- | --- | --- | --- |
| Java | GET | `/category/list?parentId=-1&shopId=0&depth=3` | 获取平台一级、二级、三级分类树；当前 Java 联调口径 `depth` 必传，分类页固定传 `3`。 |

接口需要 `mallToken`。H5 浏览器端不读取 token，BFF 从 HttpOnly Cookie 读取 `mallToken` 并转成 Java `Authorization: <mallToken>`。

Apifox `CategoryListTreeVO` 字段：

```ts
type CategoryListTreeVO = {
  categoryId?: number;
  shopId?: number;
  baseCategoryId?: number;
  parentId?: number;
  categoryName?: string;
  icon?: string;
  pic?: string;
  seq?: number;
  deductionRate?: number;
  status?: number;
  recTime?: string;
  grade?: number;
  updateTime?: string;
  actualDeductionRate?: number;
  children?: CategoryListTreeVO[];
};
```

H5 BFF 响应：

```ts
type CategoryListBffData = {
  view: CategoryPageData;
  modules: {
    categories: CategoryListTreeVO[];
  };
  debugRaw?: {
    categoryList: ServerResponseEntityCategoryListTreeVOArray;
  };
};
```

映射规则：

- 顶层 `data[]` 映射为左侧一级分类。
- 一级分类的 `children[]` 映射为右侧二级 section。
- 二级分类的 `children[]` 映射为三级宫格；没有三级时将二级分类自身作为 leaf。
- `status=0` 分类不展示。
- 分类按 `seq` 升序展示。
- leaf 点击与首页 `navType=2` 同口径，进入 `/search?categoryId=<categoryId>`。
- `pic` / `icon` 相对路径通过 `JAVA_OSS_ASSET_BASE_URL` 拼接为完整图片 URL。

`/category` 首屏展示骨架屏，不渲染本地 mock 分类；Java 空数组展示“暂无分类”，失败展示“分类加载失败”，均不回退 mock。

根级契约：`.ai-workspace/contracts/api/h5-category-list-contract.md`。

### 商品详情真实接口

商品详情真实接口通过 H5 BFF 接入，本期覆盖普通商品、快递配送、SKU、立即购买到订单确认实时校验、普通快递订单创建，以及创建订单后的收银台支付信息展示和真实发起支付：

```http
GET /api/bff/product-detail?prodId=1000054
GET /api/bff/order-confirm?productId=1000054&skuId=<skuId>&quantity=1&addrId=<addrId>
POST /api/bff/order-submit
GET /api/bff/order-pay-info?orderNumbers=<orderNumbers>&dvyType=1&isPurePoints=0&orderType=0&ordermold=0
POST /api/bff/order-pay
GET /api/bff/order-is-paid?payEntry=0&orderNumbers=<orderNumbers>
GET /api/bff/allinpay-order-status?bizOrderNo=<bizOrderNo>&orderNumbers=<orderNumbers>
```

BFF 后端调用：

| 后端 | Method | Path | 说明 |
| --- | --- | --- | --- |
| Java | GET | `/prod/prodInfo?prodId=<prodId>&addrId=0&dvyType=1` | 普通商品快递详情、SKU、价格、库存、图片和详情内容。 |
| Java | GET | `/p/address/addrInfo/{addrId}` | 订单确认和提交前解析默认/选中收货地址；`addrId=0` 表示默认地址。 |
| Java | POST | `/p/order/confirm` | 普通商品快递订单确认；订单确认页加载阶段和最终提交前都会调用，用于生成后端确认上下文和返回真实金额。 |
| Java | POST | `/p/order/submit` | 普通商品快递订单提交；创建待支付订单并返回 `orderNumbers`。 |
| Java | GET | `/p/order/getOrderPayInfoByOrderNumber?orderNumbers=<orderNumbers>` | 收银台读取待支付订单金额、过期时间、积分和支付状态。 |
| Java | GET | `/sys/config/info/getSysPaySwitch` | 收银台读取支付方式开关，当前只展示支付宝和微信支付方式。 |
| Java | GET | `/sys/config/paySettlementType` | 收银台读取当前支付结算类型；`1` 表示通联支付。 |
| Java | POST | `/p/order/pay` | 确认付款时创建后端支付参数；H5 BFF 传 `payType/orderNumbers/returnUrl/systemType`，通联时补 `allinPaySystemType=1`。 |
| Java | GET | `/p/allinpay/order/getAliAppPayUrl` | 通联支付宝支付 URL 获取；参数来自 `/p/order/pay` 返回的 `miniprogramPayInfo_VSP`。 |
| Java | GET | `/p/order/isPay/{payEntry}/{orderNumbers}?orderNumbers=<orderNumbers>` | `/pay-result` 按订单号查询最终是否已支付；当前 H5 固定 `payEntry=0`。 |
| Java | GET | `/p/allinpay/order/getOrderStatus` | `/pay-result` 按 `bizOrderNo` 回查通联支付状态。 |
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
    orderConfirm?: JavaOrderConfirmInfo;
    productInfo: JavaProductInfo;
    selectedSku: JavaProductSku;
    userAddress?: JavaUserAddress;
  };
  debugRaw?: {
    orderConfirm?: JavaEnvelope<JavaOrderConfirmInfo>;
    prodInfo: JavaEnvelope<JavaProductInfo>;
  };
};
```

普通商品快递订单确认请求体按旧 uni-app 立即购买流程保持以下形态：

```ts
type JavaOrderConfirmRequest = {
  addrId: number;
  dvyTypes: Array<{
    dvyType: 1;
    lat: null;
    lng: null;
    shopId: number;
    stationId: 0;
  }>;
  isScorePay: 0;
  orderItem: {
    prodCount: number;
    prodId: string;
    shopId: number;
    skuId: string;
  };
  prodCount: number;
  userChangeCoupon: 0;
  userUseScore: 0;
};
```

普通商品快递订单提交请求体按旧 uni-app 确认页提交结构保持以下形态；`orderShopParams` 优先由 `/p/order/confirm` 返回的 `shopCartOrders` 生成：

```ts
type JavaOrderSubmitRequest = {
  isScorePay: 0;
  orderFlowLogParam: {
    step: 1;
    visitType: 1;
  };
  orderInvoiceList: null;
  orderSelfStationDto: {
    stationId: 0;
    stationTime: "";
    stationUserMobile: "";
    stationUserName: "";
  };
  orderShopParams: Array<{
    remarks: "";
    shopId: number;
    stationId: 0;
  }>;
  virtualRemarkList: [];
};
```

订单提交 BFF 成功响应：

```ts
type OrderSubmitBffData = {
  view: {
    message: string;
    orderNumbers: string;
    status: "created";
  };
  modules: {
    orderConfirm?: JavaOrderConfirmInfo;
    orderSubmit: JavaOrderSubmitInfo;
    productInfo: JavaProductInfo;
    selectedSku: JavaProductSku;
    userAddress: JavaUserAddress;
  };
};
```

收银台支付信息 BFF 成功响应：

```ts
type OrderPayInfoData = {
  view: {
    amountText: string;
    defaultPayType: 7 | 8;
    dvyType: string;
    endTime: string;
    isPurePoints: boolean;
    methods: Array<{
      id: "aliPay" | "wechatPay";
      label: string;
      payType: 7 | 8;
    }>;
    orderNumbers: string;
    orderType?: string;
    ordermold?: string;
    paySettlementType: number;
    status: "failed" | "paid" | "pending" | "unknown";
    statusText: string;
    totalAmount: number;
    totalScore: number;
  };
  modules: {
    orderPayInfo: JavaOrderPayInfo;
    paySwitch?: JavaPaymentSwitchInfo;
    paySettlementType: number;
  };
};
```

确认付款 BFF 请求体：

```ts
type OrderPayRequest = {
  orderNumbers: string;
  payType: 7 | 8 | 0;
  dvyType?: string;
  isPurePoints?: boolean;
  orderType?: string;
  ordermold?: string;
};
```

确认付款 BFF 成功响应：

```ts
type OrderPaymentData = {
  view: {
    orderNumbers: string;
    payType: 7 | 8 | 0;
    paySettlementType: number;
    execution:
      | {
          type: "native-sdk";
          bridgeAction: "paymentStartAlipay" | "paymentStartWechat";
          provider: "alipay" | "wechat" | "allinpay";
          paymentMode?: "app-sdk" | "allinpay-mini-program-bridge" | "allinpay-url";
          paymentPayload: unknown;
          paymentUrl?: string;
          chnlFrontParamInfo?: Record<string, string>;
          miniProgram?: {
            appId: string;
            cashierAppId?: string;
            extraData?: {
              allinpayParams?: Record<string, string>;
              orderNumbers?: string;
              bizOrderNo?: string;
              reqsn?: string;
              returnToCaller?: boolean;
            };
            launchMode?: "embedded-mini-program";
            path: string;
            type: "wechat";
          };
          settlementProvider?: "allinpay";
          bizOrderNo?: string;
        }
      | {
          type: "open-url";
          provider: "allinpay";
          url: string;
          bizOrderNo?: string;
        }
      | {
          type: "paid";
          provider: "none";
          message: string;
        };
  };
  modules: {
    orderPay: JavaOrderPayResult;
    paySettlementType: number;
  };
};
```

通联状态回查 BFF 成功响应：

```ts
type AllinpayOrderStatusData = {
  view: {
    bizOrderNo: string;
    orderNumbers?: string;
    paid: boolean;
    status: "paid" | "pending" | "failed" | "unknown";
    statusText: string;
  };
  modules: {
    orderStatus: JavaAllinpayOrderStatus;
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
- 商品详情页会先通过 URL `addressId` 或地址选择流结果确认选中地址；没有选中地址时再通过 Bridge `address.getDefault` 获取默认地址，有 `addrId` 时传给 `/api/bff/product-detail` 刷新配送相关状态；Bridge 不可用时继续用 BFF 默认 `addrId=0`。
- 购买弹窗确认时携带 `productId`、`skuId`、`quantity`，不携带价格快照。
- `/order-confirm` 会先通过 Bridge `address.getDefault` 获取默认地址；再通过 `getOrderConfirm()` 请求 Java `/p/address/addrInfo/{addrId|0}` 解析默认/选中收货地址，重新请求商品详情校验 SKU、库存和价格，并调用 Java `/p/order/confirm` 生成后端确认上下文；如果 URL 中包含 `addressId`，会优先作为 `addrId` 传给 BFF；校验失败或无收货地址时禁止继续交易。普通快递链路对齐旧 uni-app，不因确认响应 `submitOrder=0` 在 H5 层置灰或阻断。
- `/order-confirm` 地址卡会跳转 `/address?select=1&from=order-confirm&flowId=<flowId>&productId=<productId>&skuId=<skuId>&quantity=<quantity>&addressId=<addrId>`；地址列表“使用”会写入一次性地址选择结果并 `history.back()` 回订单确认页，订单确认页消费结果后用 `history.replaceState` 更新为 `/order-confirm?...&addressId=<addrId>` 并重新请求确认接口。无 JS 或无法回退 history 时，地址卡 href 兜底到同等参数的 `/order-confirm`。
- `/order-confirm` 提交订单时调用 `/api/bff/order-submit`，BFF 会再次解析收货地址并拉取 `/prod/prodInfo` 校验商品和 SKU，然后依次调用 Java `/p/order/confirm` 与 `/p/order/submit` 创建待支付订单；无法解析收货地址时返回 409，不创建订单；成功后使用 `window.location.replace()` 跳转 `/pay-way?orderNumbers=<orderNumbers>&dvyType=1&isPurePoints=0&orderType=0&ordermold=0`。
- `/pay-way` 加载阶段调用 `/api/bff/order-pay-info`，BFF 读取 Java `/p/order/getOrderPayInfoByOrderNumber`、`/sys/config/info/getSysPaySwitch` 和 `/sys/config/paySettlementType` 后展示金额、倒计时、支付状态、支付方式和结算通道。
- `/pay-way` 点击“确定支付”调用 `/api/bff/order-pay`。BFF 传 Java `/p/order/pay` 的基础参数为 `payType/orderNumbers/returnUrl/systemType`；`systemType` 按客户端平台映射，Android 为 `4`，iOS/默认 App 为 `5`；当 `paySettlementType=1` 时补 `allinPaySystemType=1`。
- 普通支付宝/微信支付返回 `execution.type="native-sdk"` 和 `paymentMode="app-sdk"`，H5 按 `payType=7/8` 分别调用 `rpc/paymentStartAlipay` 或 `rpc/paymentStartWechat`，把 `provider/payType/orderNumbers/sdkPayload` 交给 App 拉起 SDK；其中 `sdkPayload` 固定等于 Java `/p/order/pay` 返回的完整 `data`。若原生返回 `unsupported`，H5 自动 fallback 到旧 action `rpc/paymentStartCashier`。
- 测试环境当前 `paySettlementType=1`，通联支付宝会先从 `/p/order/pay` 读取完整 `data`，再用 `/p/allinpay/order/getAliAppPayUrl` 换取 `paymentUrl`；H5 通过 `rpc/paymentStartAlipay` 把完整 `sdkPayload`、`paymentMode="allinpay-url"`、`paymentUrl` 和 `bizOrderNo` 交给 App，随后使用 `window.location.replace()` 进入 `/pay-result?sts=pending&bizOrderNo=<bizOrderNo>&orderNumbers=<orderNumbers>`。
- 测试环境当前 `paySettlementType=1` 且选择微信 `payType=8` 时，H5 会把 `/p/order/pay` 返回的完整 `data` 放入 `sdkPayload`；当 `data.result == 0` 且 `data.chnlFrontParamInfo` 可解析时，H5 会把该 JSON 字符串解析成 `chnlFrontParamInfo` 对象并把对象所有顶层参数传给 App，同时保留兼容字段 `miniProgram.extraData.allinpayParams`。App 当前实现以 `sdkPayload/chnlFrontParamInfo` 为准直接打开通联微信小程序收银台；H5 在发出 `rpc/paymentStartWechat` 后立即使用 `window.location.replace()` 进入 `/pay-result?sts=pending&orderNumbers=<orderNumbers>`，不等待 App 回传最终支付结果。
- `/pay-result` 首屏会自动调用 `/api/bff/order-is-paid?payEntry=0&orderNumbers=<orderNumbers>`；用户点击“查看支付状态”也调用同一接口。接口返回 `data=true` 展示支付成功，`data=false` 展示暂未支付成功；最终展示以订单号支付状态为准，不再依赖 `bizOrderNo` 作为主判断。

### 订单列表、退货退款和订单详情

订单列表、退货退款和订单详情真实接口迁移当前为 `implemented，待 App token 联调验证`。详细实施结果见 `docs/10_ORDER_LIST_DETAIL_MIGRATION_PLAN.md`，根级契约见 `.ai-workspace/contracts/api/h5-order-list-detail-real-api-contract.md`。

已新增 H5 BFF：

```http
GET /api/bff/orders?status=all&current=1&size=10&keyword=
GET /api/bff/orders/refunds?current=1&size=10
GET /api/bff/orders/detail?orderNumber=<orderNumber>
PUT /api/bff/orders/cancel
PUT /api/bff/orders/receipt
DELETE /api/bff/orders/delete?orderNumber=<orderNumber>
POST /api/bff/orders/contact-message
GET /api/bff/orders/refund-detail?refundSn=<refundSn>
```

状态映射：

| H5 `status` | 页面入口 | Java 接口与参数 |
| --- | --- | --- |
| `all` | 全部订单 | `/p/myOrder/myOrder status=0` |
| `pending-payment` | 待付款 | `/p/myOrder/myOrder status=1` |
| `pending-shipment` | 待发货 | `/p/myOrder/myOrder status=2` |
| `pending-receipt` | 待收货 | `/p/myOrder/myOrder status=3` |
| `completed` | 已完成 | `/p/myOrder/myOrder status=5` |
| `refund` | 退货退款 | `/p/orderRefund/list` |

普通订单列表 Java 参数：

```ts
{
  current: number;
  size: number;
  status: 0 | 1 | 2 | 3 | 5;
  prodName?: string;
}
```

退货退款列表 Java 参数：

```ts
{
  current: number;
  size: number;
  startTime: string;
  endTime: string;
}
```

普通订单详情会聚合 Java `/p/myOrder/orderDetail?orderNumber=<orderNumber>` 和 `/p/myDelivery/orderInfo/{orderNumber}`。首期只覆盖普通快递订单；旧项目中 `orderMold === 1` 虚拟订单和 `dvyType === 2` 自提订单会跳专属页面，H5 首期展示后置提示或兼容状态，不误渲染为普通快递详情。

页面路由：

```http
GET /orders?status=all
GET /orders?status=pending-payment
GET /orders?status=pending-shipment
GET /orders?status=pending-receipt
GET /orders?status=completed
GET /refunds
GET /orders/<orderNumber>
GET /refunds/<refundSn>
```

首批操作接口：

| 动作 | Java 接口 | 参数 |
| --- | --- | --- |
| 取消订单 | `PUT /p/myOrder/cancel/{orderNumber}` | 当前订单号 |
| 确认收货 | `PUT /p/myOrder/receipt/{orderNumber}` | 当前订单号 |
| 删除订单 | `DELETE /p/myOrder/{orderNumber}` | 当前订单号 |
| 联系商家留言 | `POST /p/myOrder/submitMessage` | `orderNumber/userMobile/messageContent` |
| 继续付款 | 复用 `/api/bff/order-pay-info` | `orderNumbers/orderType/dvyType` |
| 退款详情 | `GET /p/orderRefund/info` | `refundSn` |

注意：退货退款是独立页面 `/refunds`，不是 `/orders` 的 tab；`refund` 也不是 `/p/myOrder/myOrder` 的普通订单状态。

### 我的收藏和我的足迹

我的收藏商品和我的足迹真实接口迁移当前为 `implemented，待 App token 联调验证`。根级契约见 `.ai-workspace/contracts/api/h5-favorites-footprints-real-api-contract.md`。

已新增 H5 BFF：

```http
GET /api/bff/favorites/products?current=1&size=20
POST /api/bff/favorites/products/cancel
GET /api/bff/footprints?current=1&size=20
DELETE /api/bff/footprints/delete
```

Java 接口和参数：

| 页面/动作 | Java 接口 | 参数 |
| --- | --- | --- |
| 我的收藏商品列表 | `GET /p/user/collection/prods` | `current/size` |
| 取消商品收藏 | `POST /p/user/collection/addOrCancel` | body 为原始 `prodId` |
| 我的足迹列表 | `GET /p/prodBrowseLog/page` | `current/size` |
| 批量删除足迹 | `DELETE /p/prodBrowseLog` | body 为 `prodBrowseLogId` 数组 |

实现口径：

- `/favorites/products` 首屏只展示 loading，成功后渲染 Java `records[0].products` 映射的商品卡；接口失败展示错误和重试，空数组展示通用 `EmptyState`。
- `/footprints` 首屏只展示 loading，成功后渲染 Java `records` 映射的足迹商品卡；BFF 保留 `prodBrowseLogId` 作为页面选择和删除 ID。
- 商品卡统一进入 `/product/<prodId>`，商品图缺失时使用 `ProductImagePlaceholder`。
- 编辑态支持选择、全选和确认删除；收藏页会逐个调用取消收藏接口，足迹页会一次传 ID 数组删除。
- 联调阶段不使用 `collectionProducts` mock 兜底。

### 收货地址模块

地址模块优先通过 App Native Bridge 接入地址能力；Bridge 不可用或老版本 App 不支持时，通过 H5 BFF 接入旧 Java 地址接口。地址和省市区数据必须来自 Bridge、H5 BFF 或 Java 接口；接口无数据时展示空态、错误或空选项，不使用本地业务数据兜底：

```http
GET /address
GET /address?select=1&from=order-confirm&flowId=<flowId>&productId=<productId>&skuId=<skuId>&quantity=<quantity>&addressId=<addrId>
GET /address?select=1&from=product-detail&flowId=<flowId>&productId=<productId>&addressId=<addrId>
GET /address/edit
GET /address/edit?addrId=<addrId>
GET /address/edit?select=1&from=<source>&flowId=<flowId>&...
```

当前实现：

- `/address` 展示地址列表、默认地址、编辑、删除和新增入口；进入页面后优先请求 Bridge `address.getList`，失败时请求 `/api/bff/address/list` 同步真实地址；Bridge/BFF 都没有返回地址时展示空态，不展示本地样例地址。
- `/address?select=1` 展示“使用”按钮，用于订单确认页和商品详情页选择地址；query 通过 `from/flowId/productId/skuId/quantity/addressId` 保存来源上下文。
- 地址列表“使用”会写入 `sessionStorage` 一次性选择结果并执行 `history.back()`；来源页消费后用 `history.replaceState` 更新当前 URL，再重新请求商品详情或订单确认接口。该设计兼容 App 导航栏返回和系统手势返回，不新增 Native Bridge 方法。
- `/address/edit` 展示收货人、手机号码、所在地区、详细地址、定位、设为默认地址和保存按钮；省市区通过 `/api/bff/address/regions` -> Java `/p/area/listByPid` 获取，接口未返回时不展示本地选项；回填和保存优先调用 Bridge `address.getInfo/address.save`，失败时调用 `/api/bff/address/info` 和 `/api/bff/address/save`。新增/编辑地址保存成功后先回到地址列表并刷新，用户仍需明确点击“使用”才切换交易地址。
- 定位按钮预留 Bridge `address.chooseLocation`，本地会输出 `[MeuMall][address-location]` console 日志；App 未接入时提示“定位能力等待 App Bridge 接入”，不写入假地址。
- 地址空态图和定位图标来自旧 uni-app 项目，并注册为 `address.empty`、`address.location` 本地资源 key。
- 我的页“地址管理”入口已指向 `/address`。
- 地址列表设默认和删除优先调用 Bridge `address.setDefault/address.delete`，失败时分别调用 `/api/bff/address/default` 与 `/api/bff/address/delete`。

Bridge RPC：

| 功能 | Bridge action | H5 fallback |
| --- | --- | --- |
| 默认地址 | `address.getDefault` | `/api/bff/address/list` 取默认/首个地址 |
| 地址列表 | `address.getList` | `/api/bff/address/list` |
| 地址详情 | `address.getInfo` | `/api/bff/address/info` |
| 新增/编辑 | `address.save` | `/api/bff/address/save` |
| 设默认 | `address.setDefault` | `/api/bff/address/default` |
| 删除 | `address.delete` | `/api/bff/address/delete` |
| 定位选点 | `address.chooseLocation` | 无 BFF fallback，App 后续接入 |

H5 BFF：

| 功能 | H5 BFF | Method | Java 依赖 |
| --- | --- | --- | --- |
| 地址列表 | `/api/bff/address/list` | GET | `/p/address/list?isDefaultFirst=false` |
| 地址详情 | `/api/bff/address/info?addrId=<addrId>` | GET | `/p/address/addrInfo/{addrId}` |
| 新增地址 | `/api/bff/address/save` | POST | `/p/address/addAddr` |
| 编辑地址 | `/api/bff/address/save` | PUT | `/p/address/updateAddr` |
| 设默认 | `/api/bff/address/default` | PUT | `/p/address/defaultAddr/{addrId}` |
| 删除地址 | `/api/bff/address/delete` | DELETE | `/p/address/deleteAddr/{addrId}` |
| 省市区 | `/api/bff/address/regions?parentId=<areaId>` | GET | `/p/area/listByPid?level=1` 或 `/p/area/listByPid?pid=<areaId>` |

Java 接口：

| 功能 | Java 接口 | Method | 说明 |
| --- | --- | --- | --- |
| 地址列表 | `/p/address/list` | GET | 旧项目入参包含 `isDefaultFirst`。 |
| 地址详情/默认地址 | `/p/address/addrInfo/{addrId}` | GET | 编辑页回填；订单确认/提交使用 `addrId=0` 解析默认地址，返回空时禁止提交。 |
| 新增地址 | `/p/address/addAddr` | POST | 保存新增地址。 |
| 修改地址 | `/p/address/updateAddr` | PUT | 保存编辑地址。 |
| 设置默认地址 | `/p/address/defaultAddr/{addrId}` | PUT | 地址列表默认地址切换。 |
| 删除地址 | `/p/address/deleteAddr/{addrId}` | DELETE | 地址列表删除非默认地址。 |
| 省市区 | `/p/area/listByPid` | GET | `level=1` 获取省份；`pid=<areaId>` 获取下级市/区。 |

本期明确不包含：

- 秒杀、拼团、自提、同城、门店定位。
- 购物车数量和加入购物车；喵呜无购物车。
- 支付 Bridge、收藏、优惠券领取、分享海报。
- 地图选点和 App 真实定位实现。当前 H5 仅预留 `address.chooseLocation` Bridge；省市区数据只消费 Java `/p/area/listByPid`，不保留本地轻量兜底数据。

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

## 已接卖手活动 BFF

| H5 BFF | Java 接口 | 页面 | 说明 |
| --- | --- | --- | --- |
| `/api/bff/seller-activities` | `GET /p/sellerActivity/availableList` | `/seller/activities` | 查询平台可参加营销活动，空数组展示空态 |
| `/api/bff/seller-activities/[activityId]/products` | `GET /p/sellerActivity/page` | `/seller/activities/[activityId]` | 活动商品分页，`status=1` 进行中，`status=0` 已暂停 |
| `/api/bff/seller-activities/[activityId]/available-products` | `GET /p/distribution/prod/productPage` | `/seller/activities/[activityId]/products` | 新增活动商品来源，传 `incentiveId=<activityId>` |
| `/api/bff/seller-activities/[activityId]/products/[prodId]` | `GET /p/sellerActivity/detail` | `/seller/activities/[activityId]/products/[prodId]` | 活动商品设置详情 |
| `/api/bff/seller-activities/save-or-update` | `POST /p/sellerActivity/saveOrUpdate` | 商品设置页 | 保存活动时间、限购和 SKU 活动价 |
| `/api/bff/seller-activities/batch-status` | `POST /p/sellerActivity/batchStatus` | 活动配置页 | `-1` 删除，`0` 暂停，`1` 开始 |

卖手活动页面进入真实接口联调阶段，不使用本地 mock 业务数据兜底。接口失败、鉴权失败或超时时展示错误/重试；列表为空时展示 `EmptyState`。

## 待确认问题

- API 流量由 H5 直接请求，还是由原生代理？
- token 刷新流程是什么？
- 必须携带哪些请求追踪 header？
- 本地开发使用什么 mock 策略？
- 原生 App 最终 Cookie 属性、SameSite 取值和 iOS / Android WebView 写入方式是什么？
- Java / Python 测试和正式 base URL 分别是什么？
