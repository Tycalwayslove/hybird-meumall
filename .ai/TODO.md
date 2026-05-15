# TODO

## Active

- 暂无。

## Backlog

- [ ] 确认哪些原生兜底页必须随 App 内置。
- [ ] 确认 SSR 部署平台、`H5_SERVICE_BASE_URL`、扩缩容和日志采集方式。
- [ ] WebView 离线兜底页与最低 App 版本校验。
- [ ] stores、modules、features 业务开发目录规范。
- [ ] UI 组件库基础沉淀规则。
- [ ] 为后续实现任务补充 `.ai/test-reports/` 验证记录。
- [ ] 确认 API 真实 base URL、token 刷新、重新登录和原生代理策略。
- [ ] 确认 Telemetry 真实 Sentry/埋点平台、白屏采样点、采样率和隐私脱敏策略。
- [ ] 将模拟页面中的色块占位替换为正式 icon 体系。
- [ ] 接入真实商品、分类、购物车、订单和用户接口。
- [ ] 配置 GitHub Actions 所需 SSR secrets 和受保护发布环境。
- [ ] 确认 manifest active 发布审批人和执行窗口。

## Done

- [x] 创建 AI 工作流文档脚手架。
- [x] 创建项目级 Codex Skills。
- [x] 创建最小可运行 AI 辅助脚本骨架。
- [x] 将协作文档、任务和 Skill 文档转换为中文。
- [x] 完善 AI 工作流自动化并完成实战演练。
- [x] 初始化 H5 基础工程架构。
- [x] 在基础架构任务中落地项目源码目录结构。
- [x] 在基础架构任务中接入 Vitest 测试运行器。
- [x] 实现 Root Manifest 类型和 `resolveH5Version(ctx, manifest)`。
- [x] 使用 `task-plan` 为 Root Manifest 版本解析任务制定实现计划。
- [x] Native Bridge 协议与 Web Mock。
- [x] Manifest Schema 与远程配置中心。
- [x] Theme Runtime 与 Light/Dark 切换。
- [x] API Client、鉴权与请求追踪。
- [x] 监控、白屏检测与性能埋点基础。
- [x] 模拟电商页面、静态缺省页与 OSS 配置模板。
- [x] 接入 Git 提交信息规范检查。
- [x] 为 OSS 配置模板补充 bucket 内目录 `/hybird`。
- [x] 落地客户端 Manifest Runtime。
- [x] 统一发布、manifest 更新和回滚脚本的 `ManifestFile` schema。
- [x] 实现本地 OSS 上传计划生成脚本。
- [x] 为 OSS 上传脚本补充参数体检和显式真实上传入口。
- [x] 补构建静态产物，启用 Next.js 静态导出并上传真实 OSS smoke 版本。
- [x] 补齐 OSS smoke、manifest candidate 发布、latest 指针计划、CDN 刷新计划和手动 CI/CD workflow。
- [x] 将默认远程发布切回 Next.js SSR/standalone 构建。
- [x] 将发布配置、manifest 资源模型和 CI/CD 收敛为 SSR-only。
