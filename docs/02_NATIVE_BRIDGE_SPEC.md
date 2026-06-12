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

## 当前 H5 Adapter

当前 H5 侧 Bridge adapter 位于 `src/lib/bridge`。

| 字段 | 当前约定 |
| --- | --- |
| 旧调用入口 | `nativeBridge.call(method, payload, options?)` |
| 新调试入口 | `bridge.navigate(payload)`、`bridge.emit(event, payload)`、`bridge.rpc(action)`、`bridge.on(event, handler)` |
| H5 -> iOS | `window.webkit.messageHandlers.bridgeHandler.postMessage(message)` |
| H5 -> Android | `window.bridgeHandler.postMessage(JSON.stringify(message))` |
| Native -> H5 | `window.__bridgeHandler.resolve/reject/emit(...)` |
| Web Mock | `createWebBridgeAdapter()` 和首页 Bridge 调试面板 |
| 默认超时 | 3000ms |
| 调试协议 | `{ module, action, payload?, callbackId? }` |

当前已按 `.ai-workspace/contracts/native-bridge/meumall-bridge-protocol.md` 增加统一信封调试 runtime。旧 `nativeBridge.call` 暂不删除；后续正式业务优先走新语义化入口。

首页已经提供 Bridge 调试面板，用于测试 P0/P1 草案能力是否能被原生容器收到。该面板只用于联调，不代表真实 token、导航、分享等业务能力已经由原生完成。

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
| rpc/getTokens | 调试中 | 统一信封 RPC，原生当前只返回 debug token。 |
| rpc/getDeviceInfo | 调试中 | 统一信封 RPC，原生当前只返回 debug 设备信息。 |
| router/navigate | 调试中 | H5 发出导航信封，原生当前只接收记录。 |
| event/token_expired | 调试中 | H5 发出 token 失效事件，原生当前只接收记录。 |
| event/share | 调试中 | H5 发出分享事件，原生当前只接收记录。 |
| event/route_changed | 调试中 | H5 路由变化上报，用于原生记录当前路径、标题和 fallback Tab。 |

## H5 跳转封装

H5 业务页面不要直接拼 Bridge 信封。正式页面跳转统一从 `src/lib/navigation` 进入：

| 入口 | 用途 |
| --- | --- |
| `HybridLink` | 业务 JSX 中使用的跳转组件，支持普通 H5 push、新开 H5 WebView、切 Tab、打开原生页和关闭当前 WebView。 |
| `createHybridNavigator()` | 非 JSX 场景使用的命令式跳转 helper。 |
| `HybridRouteReporter` | 挂在根 layout 中，自动上报当前 H5 路由变化。 |

当前策略：

- Tab 根页面：`/`、`/promotion`、`/mine` 由原生 Tab WebView 常驻缓存。
- Tab 根页面进入 H5 二级页面：默认使用 `HybridLink strategy="new-webview"`，由原生新开 H5 WebView。
- 二级页面内部继续下钻：默认使用普通 Next Link 或 `strategy="push"`，在当前 WebView 内 push。
- 二级页面返回 Tab 根页面：调用 `router/navigate route=tab` 并让原生关闭当前二级 WebView，不在当前 WebView 内直接打开根路由。
- 导航栏返回：`TopNavigation` 通过 `router/navigate route=back` 交给原生；原生优先执行当前 WebView history back，退不动再关闭当前 WebView。

## router/navigate 路由清单

```ts
type BridgeRoute =
  | "home"
  | "back"
  | "product_detail"
  | "webview"
  | "tab"
  | "close_webview"
  | string;
```

| route | H5 发起场景 | 原生处理 |
| --- | --- | --- |
| `webview` | 从首页、推广首页、我的页打开 H5 二级页。 | 校验 URL 后新开 H5 WebView，根 Tab WebView 保持缓存。 |
| `tab` | 二级页需要回到首页、推广首页或我的 Tab 根页面。 | 切换目标 Tab；若 `closeCurrentWebView=true`，关闭当前二级 WebView。 |
| `back` | H5 顶部导航返回或 H5 请求原生返回。 | 当前 WebView 可回退则 `goBack()`；否则关闭当前二级 WebView。 |
| `close_webview` | H5 明确要求关闭当前二级容器。 | 关闭当前栈顶 H5 WebView。 |
| `settings` | 我的页设置入口。 | 打开原生设置页。 |
| `<native-page-route>` | H5 打开其它原生页面。 | route 直接使用原生页面名，如 `address`、`login`；参数放在 `params`。 |
| `product_detail` | 兼容商品详情语义跳转。 | 根据商品 id 拼接 H5 商品详情 URL 并新开 WebView。 |

原生页不再通过 `route: "native_page"` + `params.name` 包装；H5 `HybridLink strategy="native-page" nativePage="<name>"` 会直接发送 `payload.route="<name>"`。

`event/route_changed` payload：

```ts
type RouteChangedPayload = {
  path: string;
  title?: string;
  canGoBack?: boolean;
  fallbackTab?: "home" | "promotion" | "mine";
};
```

原生可用它记录当前 H5 页面信息，辅助调试、导航标题、手势返回和异常恢复。

`event/share` payload：

```ts
type SharePayload = {
  productId: string;
  title?: string;
  source?: "promotion_products" | string;
};
```

当前 H5 使用场景：

- 推广商品页点击“推广”按钮时发出 `event/share`。
- 原生 App 负责接收该事件并打开平台分享面板或内部推广分享流程。
- Web 环境无 Bridge 时 H5 安全 no-op，不弹错误。

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
