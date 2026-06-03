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
  -> 从 Cookie 读取 token
  -> 请求 Python / Java 后端时转换为 Authorization: Bearer <token>

浏览器端 H5
  -> 不读取 token
  -> 只请求自身 /api/bff/**
```

Python / Java 后端不需要支持 Cookie 鉴权，仍继续按 `Authorization` 认证。Cookie 只作为原生 App 到 H5 服务端的安全登录态传递通道。

### Cookie 约定

| Cookie | 说明 | JS 可读 | 建议属性 |
| --- | --- | --- | --- |
| `meu_access_token` | 原生 App 写入的访问 token。 | 否 | `HttpOnly; Secure; Path=/; SameSite=Lax` |
| `meu_page_config` | 可选页面启动配置，禁止放敏感信息。 | 可按需 | `Secure; Path=/; SameSite=Lax` |

H5 浏览器端禁止通过 `document.cookie` 读取 token。服务端读取逻辑位于 `src/server/auth/cookie-auth.ts`。

### 服务端后端注册表

后端环境通过服务端环境变量注入，不进入浏览器 bundle：

| 环境变量 | 说明 |
| --- | --- |
| `APP_ENV` | 当前环境，例如 `test` / `prod`。 |
| `JAVA_API_BASE_URL` | Java 后端 base URL。 |
| `PYTHON_API_BASE_URL` | Python 后端 base URL。 |
| `H5_VERSION` | 当前 H5 版本，用于请求追踪。 |

服务端 registry 位于 `src/server/http/backend-registry.ts`。页面和业务代码不要直接读取这些环境变量。

### 双层 HTTP Client

| 层级 | 位置 | 职责 |
| --- | --- | --- |
| 浏览器端 H5 client | `src/lib/http/h5-client.ts` | 请求自身 BFF，自动处理 basePath 和 `credentials: "include"`。 |
| 服务端 backend client | `src/server/http/backend-client.ts` | 请求 Java / Python 后端，注入 Authorization、requestId、H5 版本和环境。 |
| BFF response | `src/server/http/bff-response.ts` | 将后端结果转换为前端统一响应。 |

浏览器端调用示例：

```ts
const client = createH5Client();
const result = await client.request<UserProfile>("/api/bff/user/profile");
```

BFF / Server service 调用示例：

```ts
const auth = readCookieAuthFromRequest(request);
const backendClient = createBackendClient({
  registry: createBackendRegistry(),
  h5Version: process.env.H5_VERSION
});

const result = await backendClient.request({
  backend: "java",
  path: "/api/user/profile",
  authRequired: true,
  authToken: auth.token,
  route: "/mine"
});
```

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

### 首页原生传参展示

首页已增加原生传参展示面板，调用 `/api/bff/runtime/context` 获取服务端调试信息：

- `meu_access_token`：展示是否存在、长度和完整值。
- `meu_page_config`：展示可解析的页面配置。
- 其它 Cookie：展示完整值。
- URL 参数：展示 App 打开 H5 时附带的启动参数。
- 环境信息：展示 `APP_ENV` 和 `H5_VERSION` / `H5_RELEASE_LABEL`。

该面板仅用于当前内部开发联调，线上正式业务开放前必须删除或增加服务端开关关闭。Cookie 完整值不得进入日志、埋点和长期文档截图。

## 首版 API Client

首版实现位于 `src/lib/api`，只提供共享请求边界，不包含任何业务接口。

```ts
const client = createApiClient({
  baseUrl: "https://api.example.com",
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
