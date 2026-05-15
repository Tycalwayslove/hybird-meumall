# 01 架构

## 架构目标

- 支持 H5 在原生 App WebView 中运行。
- 支持远程加载和 App 内置静态包两种交付方式。
- 明确 Native Bridge、manifest、主题、API 和业务 UI 的边界。
- 让后续 AI 任务容易规划、验证和交接。

## 高层结构

```text
Native App
  -> WebView Container
    -> H5 App
      -> Next.js Routes
      -> React Components
      -> Tailwind CSS + CSS Variables
      -> Native Bridge Adapter
      -> API Client
      -> Manifest Runtime Config
      -> Telemetry
```

## 推荐模块边界

| 模块 | 职责 |
| --- | --- |
| App Shell | 全局 Provider、布局和运行时初始化。 |
| Native Bridge | 能力检测、调用分发、响应归一化和 fallback。 |
| Manifest | 版本、渠道、灰度、回滚和资源路由。 |
| Theme | CSS Variables、Tailwind token 映射和运行时切换。 |
| API | 请求客户端、错误归一化、鉴权和追踪。 |
| Telemetry | 错误事件、性能事件、白屏检测、通用埋点和 reporter 接入边界。 |
| Business Features | 页面和领域业务逻辑。 |
| AI Workflow | 任务状态、变更摘要、决策和验证记录。 |

## 当前源码边界

首版工程骨架采用 Next.js App Router 和 `src/` 目录：

```text
src/
  app/
  components/
  lib/
    bridge/
    manifest/
    theme/
    api/
    telemetry/
  styles/
```

业务页面和业务逻辑必须在后续明确任务中补充。

## 交付模型

### 远程交付

适用于可以依赖网络、需要快速发布和回滚的页面。

待定义：

- 远程资源域名：
- 路由前缀：
- CDN 缓存策略：
- manifest 获取策略：
- 回滚触发方式：

### 静态包交付

适用于必须随 App 包可用的页面。

待定义：

- 静态路由列表：
- 导出命令：
- 原生资源路径：
- 所需原生能力：
- fallback 路由：

### 当前模拟业务壳

当前项目提供一组本地 mock 电商页面，用于验证 H5 App Router、WebView 页面结构和静态兜底资源：

- 首页 `/`
- 分类 `/category`
- 商品详情 `/product/[id]`
- 购物车 `/cart`
- 我的 `/profile`

这些页面只使用 `src/lib/commerce/mock-data.ts` 中的本地模拟数据，不接真实 API、登录、购物车、订单或支付。页面中需要 icon 的位置先使用色块占位，后续统一替换正式 icon。

## Manifest 集成原则

H5 应通过单一运行时边界消费 manifest，业务代码不要直接读取原始 manifest 字段。

manifest 负责：

- 选择 H5 版本。
- 选择发布渠道。
- 将路由映射到远程或本地资源。
- 声明最低 App 能力要求。
- 定义回滚目标。
- 提供缓存失效信息。

## Native Bridge 集成原则

H5 应通过类型化 Bridge Adapter 调用原生能力。

Bridge Adapter 负责：

- 检测平台和 Bridge 可用性。
- 校验请求参数。
- 归一化成功和失败响应。
- 处理超时。
- 提供缺失能力时的 fallback。

## 主题架构

主题值通过 CSS Variables 注入，并由 Tailwind 工具类或组件样式消费。

主题层负责：

- 定义默认 CSS Variables。
- 支持原生 App 或 manifest 注入主题。
- 尽可能支持无刷新切换。
- 保证 fallback 样式可读。

## API 架构

API 访问必须经过共享客户端层。

API 层负责：

- 选择 base URL。
- 注入认证信息。
- 注入请求追踪信息。
- 归一化错误。
- 管理重试和超时。
- 必要时接入原生代理。

## Telemetry 架构

Telemetry 访问必须经过共享 reporter 边界。

首版 telemetry 位于 `src/lib/telemetry`，只提供本地能力：

- 定义通用埋点事件、错误事件、首屏性能事件和白屏事件类型。
- 提供 `createNoopTelemetryReporter()`，默认不发送网络请求或原生调用。
- 提供 `createTelemetryClient()`，统一补充 context 和 timestamp。
- 通过 `TelemetryReporter` interface 预留 Sentry、原生 `trackEvent` 或内部监控平台接入点。
- 提供 `evaluateWhiteScreen(samples, options)`，基于采样点空白比例判断白屏。
- 提供 `createFirstScreenPerformanceEvent(metrics, options)`，记录首屏基础指标。

### 白屏检测基础策略

首版不直接操作 DOM，只定义可测试的评估策略：

1. 由运行时或页面层提供一组采样点。
2. 每个采样点标记是否为空白。
3. 计算 `blankRatio = blankCount / sampleSize`。
4. 当 `blankRatio >= threshold` 时判定为白屏。
5. 空采样结果视为不可判断，不判定为白屏。

默认建议阈值为 `0.8`。真实 DOM 采样点、采样时间、采样率和误报处理需后续结合页面结构确认。

### 首屏性能基础指标

首版预留以下指标字段：

| 字段 | 说明 |
| --- | --- |
| `firstContentfulPaintMs` | 首次内容绘制耗时。 |
| `largestContentfulPaintMs` | 最大内容绘制耗时。 |
| `domContentLoadedMs` | DOMContentLoaded 耗时。 |
| `loadMs` | window load 耗时。 |

首版只构造事件，不读取浏览器 Performance API，不上报真实平台。

## 错误处理原则

- Bridge 调用失败不能导致整页崩溃。
- manifest 解析失败应回退到安全默认版本或错误页。
- 主题注入失败应回退到默认 CSS Variables。
- API 失败应输出统一、对用户安全的错误。
- Telemetry reporter 失败不能影响页面主流程。

## 待确认问题

- manifest 由原生 App 获取、H5 获取，还是二者都获取？
- 静态页面是否与远程页面共用同一个 runtime shell？
- Bridge ready 前的调用是否需要排队？
- WebView 内可用的埋点 SDK 是什么？
- 白屏检测的真实采样点、阈值和采样率是多少？
