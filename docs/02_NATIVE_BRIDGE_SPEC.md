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

H5 每次通过 `router/navigate` 向 App 发起路由跳转前，都会在浏览器控制台打印 `[MeuMall][bridge-router:navigate]` 和完整 `payload`，用于判断跳转问题发生在 H5 传参阶段还是 App 接收/分发阶段。

`NEXT_PUBLIC_APP_ENV=local` 或 `test` 时，H5 会默认启用页面内 Eruda 调试面板，可在 App WebView 内直接查看上述 H5 console 日志；`prod` 环境不启用该面板。

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
| rpc/address.* | 调试中 | 地址能力 RPC，H5 商品详情、订单确认和地址管理页优先使用；原生 debug receiver 当前返回调试地址。 |
| rpc/paymentStartAlipay | 待 App 接入 | H5 收银台请求原生发起支付宝支付；普通支付宝和通联支付宝 URL 都走该 action，`sdkPayload` 透传 `/p/order/pay` 完整 `data`。 |
| rpc/paymentStartWechat | 待 App 接入 | H5 收银台请求原生发起微信支付；普通微信和通联微信小程序收银台都走该 action，`sdkPayload` 透传 `/p/order/pay` 完整 `data`。 |
| rpc/paymentStartCashier | 兼容中 | 旧 App fallback action；新 App 应优先实现 `paymentStartAlipay/paymentStartWechat`。 |
| rpc/payment.openUrl | 历史兼容 | H5 收银台请求原生打开外部支付 URL；通联支付宝主链路已迁到 `paymentStartAlipay`。 |
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
- 地址选择流不新增 Bridge 方法。商品详情和订单确认进入 `/address?select=1&from=<source>&flowId=<id>` 时使用普通 H5 push；用户选择地址后 H5 写入一次性 `sessionStorage` 结果并执行 `history.back()`，来源页消费结果后用 `history.replaceState` 修正 URL 和重新请求接口。App 导航栏返回和系统手势返回继续沿用 `route=back` / WebView history 语义，不需要原生拦截地址选择。

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
| `history-wallet` | 钱包页右上角历史钱包入口。 | 打开原生历史钱包页。 |
| `<native-page-route>` | H5 打开其它原生页面。 | route 直接使用原生页面名，如 `address`、`login`；参数放在 `params`。 |
| `product_detail` | 兼容商品详情语义跳转。 | 根据商品 id 拼接 H5 商品详情 URL 并新开 WebView。 |

### 注册后实名认证流程

注册成功后的 `/register/certification` 流程复用现有 `router/navigate`：

| 场景 | H5 发送 | 原生处理 |
| --- | --- | --- |
| 打开通联实名认证 H5 | `route=webview`，`params.url=<regInviteLink>`，`params.title=实名认证`，`params.source=register-certification` | 新开 WebView 打开外部认证链接；用户完成后关闭该 WebView。 |
| 认证成功后打开喵呜商城 App | `route=tab`，`params.tab=home`，`params.closeCurrentWebView=true` | 切换首页 Tab，并关闭当前认证结果页所在 WebView。 |

H5 在发出外部认证 `webview` 跳转后，会将当前页面 `replace` 到 `/register/certification/result`。因此外部认证 WebView 关闭后，底层页面会查询会员信息并展示成功或失败结果。

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

## rpc/address.* 地址能力

商品详情和地址管理的地址来源优先级：

1. App Native Bridge `rpc/address.*`。
2. H5 BFF `/api/bff/address/*`。

Bridge 和 BFF 都没有返回地址时，H5 展示空态或错误提示；不得展示本地样例地址。

地址 RPC 清单：

| action | payload | resolve data | H5 使用场景 |
| --- | --- | --- | --- |
| `address.getDefault` | 无 | `{ address: Address \| null }` | 商品详情配送行、订单确认默认地址。 |
| `address.getList` | 无 | `{ addresses: Address[] }` | `/address` 地址列表。 |
| `address.getInfo` | `{ addrId }` | `{ address: Address \| null }` | `/address/edit` 编辑回填。 |
| `address.save` | `Address` | `{ addrId?, message? }` | 新增/编辑地址。 |
| `address.setDefault` | `{ addrId }` | `{ message? }` | 设置默认地址。 |
| `address.delete` | `{ addrId }` | `{ message? }` | 删除地址。 |
| `address.chooseLocation` | 无 | `{ location: AddressLocation \| null }` | 定位选点预留；App 后续接入真实定位。 |

`Address` 字段沿用旧 Java 地址对象核心字段：`addrId`、`receiver`、`mobile`、`province`、`provinceId`、`city`、`cityId`、`area`、`areaId`、`addr`、`commonAddr`、`lat`、`lng`。订单确认和提交 BFF 仍会调用 Java `/p/address/addrInfo/{addrId}` 校验地址，不能只信任 Bridge 快照。

`address.chooseLocation` 当前只做 Bridge 能力预留：H5 发起 RPC 并输出 `[MeuMall][address-location]` console 日志；App 未接入时页面提示“定位能力等待 App Bridge 接入”，不会伪造定位结果。

## rpc/payment* 支付能力

收银台 `/pay-way` 点击“确定支付”后，H5 先请求自身 BFF 创建后端支付参数，再按 BFF 返回的 `execution.type` 调 Native Bridge：

| action | payload | resolve data | H5 使用场景 |
| --- | --- | --- | --- |
| `paymentStartAlipay` | `{ provider, payType: 7, orderNumbers, sdkPayload, paymentMode?, settlementProvider?, paymentUrl?, bizOrderNo? }` | `{ status, message? }` | 支付宝专属支付入口；普通支付宝 App SDK 或通联支付宝 URL 均走该 action。 |
| `paymentStartWechat` | `{ provider, payType: 8, orderNumbers, sdkPayload, paymentMode?, settlementProvider?, chnlFrontParamInfo?, miniProgram?, bizOrderNo? }` | `{ status, message? }` | 微信专属支付入口；普通微信 App SDK 或通联微信小程序收银台均走该 action。 |
| `paymentStartCashier` | 同上 | `{ status, message? }` | 旧 App 兼容 fallback；新 App 应优先实现 `paymentStartAlipay/paymentStartWechat`。 |
| `payment.openUrl` | `{ provider: "allinpay", url, orderNumbers, bizOrderNo? }` | `{ opened, status, message? }` | 历史支付 URL 打开能力；通联支付宝主链路已改为 `paymentStartAlipay` 携带 `paymentUrl`。 |

`paymentStartAlipay` 请求示例：

```json
{
  "module": "rpc",
  "action": "paymentStartAlipay",
  "callbackId": "cb_xxx",
  "payload": {
    "provider": "alipay",
    "paymentMode": "app-sdk",
    "payType": 7,
    "orderNumbers": "NO202606290001",
    "sdkPayload": {
      "bizOrderNo": "PAY202606290001",
      "orderInfo": "alipay_sdk_order_info"
    }
  }
}
```

通联支付宝 URL 请求示例：

```json
{
  "module": "rpc",
  "action": "paymentStartAlipay",
  "callbackId": "cb_xxx",
  "payload": {
    "provider": "allinpay",
    "settlementProvider": "allinpay",
    "paymentMode": "allinpay-url",
    "payType": 7,
    "orderNumbers": "NO202606290001",
    "bizOrderNo": "TL202606290001",
    "paymentUrl": "alipays://platformapi/startapp?appId=20000067",
    "sdkPayload": {
      "bizOrderNo": "TL202606290001",
      "miniprogramPayInfo_VSP": "{\"token\":\"pay-token\"}"
    }
  }
}
```

通联微信小程序收银台请求示例：

```json
{
  "module": "rpc",
  "action": "paymentStartWechat",
  "callbackId": "cb_xxx",
  "payload": {
    "provider": "allinpay",
    "settlementProvider": "allinpay",
    "paymentMode": "allinpay-mini-program-bridge",
    "payType": 8,
    "orderNumbers": "NO202606300001",
    "bizOrderNo": "2606300000012651",
    "sdkPayload": {
      "result": "0",
      "reqTraceNum": "2606300000012651",
      "respTraceNum": "20260630173754208901021131",
      "chnlFrontParamInfo": "{\"appletPayParams\":\"{\\\"reqsn\\\":\\\"20260630173754208901021131\\\",\\\"cusid\\\":\\\"660584053996480\\\",\\\"trxamt\\\":\\\"1\\\"}\"}",
      "respCode": "66666",
      "respMsg": "业务已受理"
    },
    "chnlFrontParamInfo": {
      "appletPayParams": "{\"reqsn\":\"20260630173754208901021131\",\"cusid\":\"660584053996480\",\"trxamt\":\"1\"}"
    },
    "miniProgram": {
      "type": "wechat",
      "appId": "wx264f4850dc92b03d",
      "cashierAppId": "wxef277996acc166c3",
      "launchMode": "embedded-mini-program",
      "path": "package-pay/pages/allinpay-bridge/allinpay-bridge",
      "extraData": {
        "allinpayParams": {
          "appletPayParams": "{\"reqsn\":\"20260630173754208901021131\",\"cusid\":\"660584053996480\",\"trxamt\":\"1\"}"
        },
        "orderNumbers": "NO202606300001",
        "bizOrderNo": "2606300000012651",
        "reqsn": "20260630173754208901021131",
        "returnToCaller": true
      }
    }
  }
}
```

通联微信处理规则：

- H5 优先在 Java `/p/order/pay` 返回 `result=0` 且 `chnlFrontParamInfo` 可解析时生成 `paymentMode="allinpay-mini-program-bridge"`。
- App 收到该模式时，不走普通微信 App 支付参数解析；当前联调方案以 `sdkPayload` 与 `chnlFrontParamInfo` 为准，直接打开通联微信小程序收银台。
- `sdkPayload` 固定透传 Java `/p/order/pay` 返回的完整 `data`，不是 H5 提取后的子集；`chnlFrontParamInfo` 是 H5 对 `sdkPayload.chnlFrontParamInfo` 执行 JSON.parse 后得到的对象，会把该对象内所有顶层参数都传给原生。`miniProgram` 仍作为历史兼容辅助字段保留，原生新实现不应依赖喵呜小程序支付桥页。需要日志排查时可和 H5 console 中 `[MeuMall][order-pay][h5-response]` 对照。
- 通联微信小程序收银台打开成功不等同于支付成功。App 若只能确认“已打开”，建议 resolve `{ "status": "unknown", "message": "已打开通联收银台" }`；H5 已在发起 Bridge 后立即进入结果页并回查订单状态，因此该 resolve 只作为日志和兼容用途。
- 通联微信小程序收银台参考通联文档：<https://prodoc.allinpay.com/doc/732/>。

`payment.openUrl` 请求示例：

```json
{
  "module": "rpc",
  "action": "payment.openUrl",
  "callbackId": "cb_xxx",
  "payload": {
    "provider": "allinpay",
    "orderNumbers": "NO202606290001",
    "bizOrderNo": "NO202606290001",
    "url": "https://..."
  }
}
```

H5 处理规则：

- H5 会按 `payType` 优先调用 `paymentStartAlipay` 或 `paymentStartWechat`；如果原生返回 `unsupported`，H5 自动 fallback 到旧 action `paymentStartCashier`。
- `paymentStartAlipay/paymentStartWechat` 普通 SDK resolve `status=success/paid` 后使用 `window.location.replace()` 进入 `/pay-result?sts=1`；`status=cancelled/failed/unknown` 进入结果页并展示待确认或未支付状态。
- `paymentStartAlipay` 通联支付宝分支发起 Bridge 后，H5 立即使用 `window.location.replace()` 进入 `/pay-result?sts=pending&bizOrderNo=<bizOrderNo>&orderNumbers=<orderNumbers>`，最终由订单号状态接口确认。
- `paymentStartWechat` 通联微信分支发起 Bridge 后，H5 立即使用 `window.location.replace()` 进入 `/pay-result?sts=pending&orderNumbers=<orderNumbers>`，不等待 App 返回最终支付结果。
- `/pay-result` 统一调用 H5 BFF `/api/bff/order-is-paid?payEntry=0&orderNumbers=<orderNumbers>`，BFF 对应 Java `/p/order/isPay/{payEntry}/{orderNumbers}`；返回 `data=true` 展示支付成功，`data=false` 展示暂未支付成功。页面按钮固定为“查看支付状态”和“查看订单”。
- Bridge 不可用时，普通 App 内 SDK 支付无法降级，H5 展示“请在 App 内完成支付”；通联 URL 支付可临时使用 `window.location.assign(url)` 作为浏览器调试兜底。
- App 生产实现必须校验支付 URL scheme / host 白名单，不应打开任意 URL。

### 地址选择流路由约定

地址页同时服务“我的地址管理”和“交易链路选择地址”。H5 通过 URL query 保存轻量上下文：

```text
/address
/address?select=1&from=order-confirm&flowId=<id>&productId=<id>&skuId=<id>&quantity=<n>&addressId=<addrId>
/address?select=1&from=product-detail&flowId=<id>&productId=<id>&addressId=<addrId>
/address/edit?select=1&from=<source>&flowId=<id>&...
```

字段说明：

| 字段 | 说明 |
| --- | --- |
| `select=1` | 选择态，地址卡展示“使用”。缺省为管理态。 |
| `from` | 来源页，当前支持 `order-confirm`、`product-detail`、`mine`。 |
| `flowId` | 当前地址流稳定 ID，用于一次性选择结果隔离。 |
| `productId/skuId/quantity` | 订单确认返回时重新校验商品/SKU/数量。 |
| `addressId` | 当前已选地址，用于列表高亮、返回 fallback 和来源页重新请求。 |

选择态行为：

- 从订单确认进入地址列表，选择地址后来源页重新调用 `/api/bff/order-confirm`，再由提交订单链路调用 Java `/p/address/addrInfo/{addrId}` 做服务端校验。
- 从商品详情进入地址列表，选择地址后商品详情重新调用 `/api/bff/product-detail?prodId=<id>&addrId=<addrId>` 刷新配送文案。
- 新增/编辑地址保存成功后先回到地址列表并刷新，用户仍需明确点击“使用”才切换交易地址。

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
