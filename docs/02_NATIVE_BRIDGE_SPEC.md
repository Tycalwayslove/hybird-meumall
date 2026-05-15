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
| getAppInfo | 计划中 | App 版本、平台、渠道。 |
| getDeviceInfo | 计划中 | 设备和系统信息。 |
| getAuthToken | 计划中 | 原生向 H5 传递认证信息。 |
| setNavigationBar | 计划中 | 控制原生导航栏。 |
| openNativePage | 计划中 | 打开原生页面。 |
| closeWebView | 计划中 | 关闭当前 WebView。 |
| share | 计划中 | 调起原生分享。 |
| scanQRCode | 计划中 | 调起扫码。 |
| selectImage | 计划中 | 调起图片选择。 |
| trackEvent | 计划中 | 通过原生埋点。 |

## 安全要求

- 不执行原生传入的字符串代码。
- 使用前校验 Bridge 响应结构。
- 敏感 token 不写入日志。
- 原生支持时限制可信 WebView origin。

## 待确认问题

- 原生暴露的 Bridge namespace 是什么？
- Bridge 是 Promise、callback-id 还是 message-channel 模式？
- 原生如何暴露能力版本？
- 首版必须支持哪些 Bridge 方法？
