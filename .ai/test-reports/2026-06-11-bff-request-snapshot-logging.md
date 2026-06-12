# 2026-06-11 BFF 后端请求快照日志验证

## 背景

首页 `/api/bff/home` 调 Java 后端时，终端日志显示 HTTP `backendStatus: 200`，但浏览器收到 BFF `401 / AUTH_FAILED`。已确认 Java body 可能是业务失败 envelope，例如 `success:false / code:A00004 / msg:Unauthorized`。

为继续定位 Java 鉴权失败原因，BFF 后端调用日志补充出站请求快照：

- `requestUrl`
- `requestQuery`
- `requestBody`
- `requestHeaders`
- `responseBody`
- `responseBodySize`
- `responseBodyTruncated`

敏感字段会掩码输出，不打印完整 token。本地和测试 profile 默认打开响应 body 快照，正式 profile 默认关闭。

控制台 logger 已改为格式化 JSON 输出，`responseBody` 内的 `banners`、`categoryTop8` 等嵌套数据会完整展开，不再显示为 Node 默认摘要 `[Array]` / `[Object]`。

本轮同时整合 `/Users/mac/Downloads/ResponseEnum.java` 中当前启用的 Java 返回码。H5 侧新增 `src/server/http/java-response-codes.ts`，当前重点处理：

- `A00004 / UNAUTHORIZED`：转为 `AUTH_FAILED`。
- `A00005 / EXCEPTION`：转为 `HTTP_ERROR`。

本轮还新增 `JAVA_OSS_ASSET_BASE_URL`，用于 Java 首页接口返回相对图片路径时拼接 OSS/CDN 完整地址。当前联调值为 `https://awu-mall-file.oss-cn-guangzhou.aliyuncs.com/`。

## 验证命令

```bash
pnpm test src/server/http/backend-client.test.ts src/server/http/bff-context.test.ts src/server/http/java-response-codes.test.ts src/features/home/home-real-api.test.ts
pnpm typecheck
pnpm lint
```

## 结果

- `pnpm test ...`：通过，4 files / 23 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，存在 4 条历史 `<img>` warning，无 error。

## 覆盖点

- 请求日志包含 Java 出站 URL、query、body 和请求头。
- Java / mall 出站请求使用裸 `Authorization: <mallToken>`，不拼接 `Bearer`。
- Python 出站请求继续使用 `Authorization: Bearer <pythonToken>`。
- `Authorization` 只输出掩码后的 `abcd...wxyz (length=xx)` 或 `Bearer abcd...wxyz (length=xx)` 形式。
- Java `ResponseEnum` 启用码表已沉淀到 H5，首页 `A00004` 和 `A00005` 映射有回归测试。
- Java 相对图片路径会拼接 `JAVA_OSS_ASSET_BASE_URL`，完整 URL 保持原样。
- 请求 body 中 `token` / `secret` 类字段会掩码。
- response body 日志只在开关开启时输出。
- response body 中 token、mobile、phone、address 等字段会掩码。
- response body 超出长度上限时会截断并设置 `responseBodyTruncated: true`。
- 控制台 logger 会展开嵌套数组和对象，避免联调时看不到 Java 原始响应明细。
- 首页聚合接口业务鉴权失败时，不继续请求推荐商品接口。

## 剩余风险

- 该日志只能确认 H5 BFF 出站请求内容；Java 后端是否接受该 token、是否期望其他鉴权 header，仍需要后端或有效测试 token 继续确认。
