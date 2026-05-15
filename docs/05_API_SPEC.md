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
  code: string;
  message: string;
  httpStatus?: number;
  requestId?: string;
  recoverable: boolean;
  details?: Record<string, unknown>;
};
```

## 鉴权规则

- 未明确批准时，H5 不持久化长生命周期 token。
- 原生提供的鉴权信息必须通过 Bridge 契约处理。
- 鉴权失败应有统一重新登录或刷新策略。
- 敏感信息不得写入日志。

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
