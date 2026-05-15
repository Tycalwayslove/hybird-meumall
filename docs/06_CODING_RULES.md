# 06 编码规则

## 目的

定义后续实现工作的工程规则。

## 通用规则

- 应用代码使用 TypeScript。
- 模块保持小而聚焦。
- 平台相关能力通过类型化 adapter 封装。
- UI 组件中避免混入业务逻辑。
- 业务页面不要直接依赖原始 Native Bridge 或 manifest 数据。
- 修改架构、发布、主题、Bridge 或 API 契约时必须更新文档。

## 推荐目录职责

最终目录结构以实际项目为准，以下作为方向：

```text
src/
  app/ or pages/
  components/
  features/
  lib/
    bridge/
    manifest/
    theme/
    api/
    telemetry/
  styles/
```

## TypeScript 规则

- 避免使用 `any`，除非边界确实未知且已说明原因。
- Bridge、manifest、theme、API 契约必须显式定义类型。
- 外部输入使用前必须校验。
- 成功/失败结果优先使用可辨识联合类型。

## React 规则

- 展示组件只负责展示和局部 UI 状态。
- 平台集成放在 hook 或 service module 后面。
- 深层组件不要直接调用 Native Bridge。
- 处理 loading、empty、error 和 native capability unsupported 状态。

## Tailwind 规则

- 优先使用由主题 token 驱动的 Tailwind 工具类。
- 已有 CSS Variable token 时，不硬编码颜色。
- 响应式布局明确，并覆盖常见 WebView 宽度。
- 移动 WebView 不依赖 hover-only 交互。

## Native Bridge 规则

- 使用类型化 Bridge Adapter。
- 调用前做能力检测。
- 处理超时、方法不可用和原生错误。
- Bridge 日志不暴露敏感数据。

## Manifest 规则

- 业务代码不要直接读取原始 manifest。
- 通过 manifest runtime module 或 provider 访问。
- 校验 manifest schema。
- 回滚默认值必须安全。

## 测试规则

后续实现至少覆盖：

- manifest 解析和 fallback。
- Bridge 成功、失败、超时和方法不可用。
- 主题变量应用和 fallback。
- API 错误归一化。
- 静态包路由配置。

## 文档规则

改变行为时更新：

- 相关 `docs/*.md` 规范。
- `.ai/PROJECT_STATE.md`。
- `.ai/CHANGE_SUMMARY.md`。
- `.ai/TODO.md`。
- `docs/08_CHANGELOG.md`。
- `docs/09_DECISIONS.md`。

## 提交建议

- 一个提交只覆盖一个任务或一个完整小变更。
- 文档更新属于变更的一部分时要在提交信息中体现。
- 不把工作流脚手架和业务功能混在一起。
