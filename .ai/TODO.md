# TODO

## Active

- [ ] 确认推广模块真实后端接口、达人等级规则、活动状态和榜单刷新策略。

## Backlog

- [ ] 确认哪些原生兜底页必须随 App 内置。
- [ ] 确认 SSR 部署平台、`H5_SERVICE_BASE_URL`、扩缩容和日志采集方式。
- [ ] WebView 离线兜底页与最低 App 版本校验。
- [ ] stores、modules、features 业务开发目录规范。
- [ ] 确认 design-system token 是否需要同步给原生 App 和管理后台。
- [ ] 为后续实现任务补充 `.ai/test-reports/` 验证记录。
- [ ] 确认 API 真实 base URL、token 刷新、重新登录和原生代理策略。
- [ ] 确认 Telemetry 真实 Sentry/埋点平台、白屏采样点、采样率和隐私脱敏策略。
- [ ] 将模拟页面中的色块占位替换为正式 icon 体系。
- [ ] 接入真实商品、分类、购物车、订单和用户接口。
- [ ] 配置 GitHub Actions 所需 SSR secrets 和受保护发布环境。
- [ ] 在真实 CI 环境配置 `H5_RELEASE_SERVER_URL`，验证 `register_release=true` 的 candidate release 注册链路。
- [ ] 确认 manifest active 发布审批人和执行窗口。
- [ ] 将 server-meumall 部署到生产/测试环境后，补充权限控制、审批流、审计日志、发布人记录和 WebView 访问策略验证。

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
- [x] 完成 SSR 切流和回滚本地演练。
- [x] 接入 server-meumall active manifest HTTP fetcher。
- [x] 跑通 admin-meumall、server-meumall 和 hybird-meumall 的本地 SQLite 配置发布闭环。
- [x] 打包并启动蓝/绿/粉三份本地 H5 SSR 版本，用于 admin 切 active 后在 iOS WebView 中验证效果。
- [x] 落地正式发版入口：H5 CI 注册 candidate release、server-meumall 发布/灰度/回滚 API、admin-meumall 正式发版操作台。
- [x] 跑通 Mac Studio 本地 Jenkins 参数化构建 H5，并上传 standalone SSR 产物到云服务器 release 目录。
- [x] 将本地多项目工作区和 Jenkins/CI 运行路径统一到 `/Users/mac/person_code/meu-mall`，移除旧路径软链接依赖。
- [x] 按根级 `TASK-2026-0604-002-promotion-pages-bff-foundation.md` 实现推广模块首批 BFF mock 和高保真页面。
- [x] 建立 H5 design-system 基础 token、UI primitives，并重构推广首页为工程化样板。
- [x] 将活动中心、榜单中心、榜单详情和权益中心按 design-system 模式迁移。
- [x] 接入 V1-V5 达人徽章本地图片资源和可扩展资源 registry。
- [x] 建立 H5 顶部导航公共组件和页面预设，并迁移推广模块二级页面。
