# 02 Native Bridge 规范

## 目的

定义 H5 与原生 App WebView 容器之间的通信契约。

## 设计原则

- H5 调用前必须检测 Bridge 可用性。
- Bridge API 必须类型化和版本化。
- Bridge 失败必须返回统一错误。
- 每个方法都要定义平台支持和 fallback。
- 原生变更应尽量向后兼容。

## Bridge Runtime 模板

| 字段 | 说明 |
| --- | --- |
| Bridge namespace | 暴露在 `window` 上的命名空间。 |
| 支持平台 | iOS、Android 或两者。 |
| 最低 App 版本 | 支持该 Bridge 的最早 App 版本。 |
| 请求格式 | H5 如何发送 method、params 和 callback id。 |
| 响应格式 | 原生如何返回成功或失败。 |
| 超时策略 | H5 等待原生响应的最长时间。 |

## 首版 H5 Adapter

当前 H5 侧 Bridge adapter 位于 `src/lib/bridge`。

| 字段 | 当前约定 |
| --- | --- |
| H5 调用入口 | `nativeBridge.call(method, payload, options?)` |
| 默认原生 namespace | `window.MeumallNativeBridge` |
| 原生方法入口 | `MeumallNativeBridge.call(method, payload)` |
| Web Mock | `createWebBridgeAdapter()` |
| 默认超时 | 3000ms |
| 响应结构 | `BridgeResult<T>` |

真实 iOS/Android namespace 和通信模式仍需原生团队确认。当前实现通过 adapter 隔离差异，后续如改为 callback-id 或 message-channel，可替换 adapter 而不改变业务调用入口。

## 方法定义模板

```markdown
### <methodName>

**描述**

<该方法提供的原生能力。>

**平台**

- iOS：
- Android：

**最低 App 版本**

- iOS：
- Android：

**请求**

```ts
type Request = {};
```

**响应**

```ts
type Response = {};
```

**错误码**

| Code | 含义 | H5 处理 |
| --- | --- | --- |
| BRIDGE_UNAVAILABLE | Bridge 不可用。 | 使用 fallback。 |
| METHOD_NOT_FOUND | 原生方法不存在。 | 禁用功能或 fallback。 |
| TIMEOUT | 原生响应超时。 | 提示重试或 fallback。 |

**Fallback**

<该方法不可用时 H5 的处理方式。>
```

## 标准错误结构

```ts
type BridgeError = {
  code: string;
  message: string;
  nativeCode?: string;
  recoverable: boolean;
  details?: Record<string, unknown>;
};
```

## 标准响应结构

```ts
type BridgeResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: BridgeError };
```

## 初始方法清单

| 方法 | 状态 | 说明 |
| --- | --- | --- |
| app.getVersion | 已定义 | App 版本、平台、渠道。 |
| user.getToken | 已定义 | 原生向 H5 传递认证 token。 |
| webview.close | 已定义 | 关闭当前 WebView。 |
| webview.setTitle | 已定义 | 设置 WebView 标题。 |

## 首批方法

### app.getVersion

**描述**

获取原生 App 版本、平台和渠道。

**请求**

```ts
type Request = undefined;
```

**响应**

```ts
type Response = {
  appVersion: string;
  platform: "ios" | "android" | "web";
  channel: string;
  bridgeVersion?: string;
};
```

**Fallback**

Web mock 返回本地可预测版本信息。

### user.getToken

**描述**

获取原生提供的短期鉴权 token。

**请求**

```ts
type Request = undefined;
```

**响应**

```ts
type Response = {
  token: string | null;
  expiresAt: string | null;
};
```

**Fallback**

Web mock 默认返回 `token: null`，可在测试或本地开发中注入 mock token。H5 不持久化长生命周期 token。

### webview.close

**描述**

请求原生关闭当前 WebView。

**请求**

```ts
type Request = undefined;
```

**响应**

```ts
type Response = {
  closed: boolean;
};
```

**Fallback**

能力不可用时返回统一错误，由调用方决定是否隐藏关闭按钮或使用浏览器历史回退。

### webview.setTitle

**描述**

设置当前 WebView 标题。

**请求**

```ts
type Request = {
  title: string;
};
```

**响应**

```ts
type Response = {
  applied: boolean;
};
```

**Fallback**

能力不可用时返回统一错误，可退化为 H5 内标题展示。

## 安全要求

- 不执行原生传入的字符串代码。
- 使用前校验 Bridge 响应结构。
- 敏感 token 不写入日志。
- 原生支持时限制可信 WebView origin。

## 待确认问题

- 原生是否采用 `window.MeumallNativeBridge` 作为 namespace？
- Bridge 真实协议是 Promise、callback-id 还是 message-channel 模式？
- 原生如何暴露能力版本？
- 首版四个方法的最低 App 版本分别是多少？
