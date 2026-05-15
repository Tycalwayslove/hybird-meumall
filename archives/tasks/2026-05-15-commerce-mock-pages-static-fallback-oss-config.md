# 任务：模拟电商页面、静态缺省页与 OSS 配置模板

## 目标

为当前 H5 工程补充一组可本地跑动的电商模拟页面、静态缺省页面和 OSS 配置模板，用于验证 App Router、静态资源兜底和后续上传配置流程。

## 标签

- ui
- release
- infra

## 范围

### 包含

- 创建常见电商模拟页面：
  - `/` 首页
  - `/category` 分类页
  - `/product/[id]` 商品详情页
  - `/cart` 购物车页
  - `/profile` 我的页
- 页面数据使用本地 mock，不接真实业务接口。
- 页面中需要 icon 的位置统一用色块占位，后续再替换真实 icon。
- 创建静态缺省页面资源：
  - `offline.html`
  - `not-found.html`
  - `error.html`
  - `maintenance.html`
- 添加 OSS 配置模板，供后续填写 bucket、region、endpoint、目录前缀等信息。
- 更新发布/静态包相关文档。
- 更新 `.ai/PROJECT_STATE.md`、`.ai/CHANGE_SUMMARY.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。
- 生成 `.ai/test-reports/` 验证记录。

### 不包含

- 不接真实商品、订单、购物车或用户接口。
- 不实现登录、支付、下单、库存或优惠券业务逻辑。
- 不上传 OSS，不包含真实 AK/SK/token。
- 不实现真实 manifest 远程拉取或 CDN 发布。
- 不接真实 icon 库。

## 上下文

- 相关文档：
  - `AGENTS.md`
  - `docs/00_PROJECT_OVERVIEW.md`
  - `docs/01_ARCHITECTURE.md`
  - `docs/03_RELEASE_SPEC.md`
  - `docs/04_THEME_SPEC.md`
  - `docs/06_CODING_RULES.md`
  - `docs/07_AI_WORKFLOW.md`
- 相关文件：
  - `src/app/page.tsx`
  - 待创建：`src/app/category/page.tsx`
  - 待创建：`src/app/product/[id]/page.tsx`
  - 待创建：`src/app/cart/page.tsx`
  - 待创建：`src/app/profile/page.tsx`
  - 待创建：`src/components/commerce/*`
  - 待创建：`src/lib/commerce/*`
  - 待创建：`public/static/fallback/*`
  - 待创建：`config/oss.config.example.json`
  - 待更新：`.env.example`

## 验收标准

- [x] 5 个电商模拟页面可通过 App Router 访问。
- [x] 页面使用本地 mock 数据，不调用真实业务接口。
- [x] 所有 icon 位置使用色块占位。
- [x] 4 个静态缺省 HTML 页面已创建。
- [x] OSS 配置模板已创建且不包含真实密钥。
- [x] 静态包和 OSS 模拟说明已写入文档。
- [x] 本地构建、类型检查、lint、测试和浏览器验证通过。

## 验证

- 命令或人工检查：
  - `pnpm test`
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm build`
  - `pnpm run ai:check-workflow --strict`
  - 浏览器打开 `http://localhost:3000/` 并抽查 `/category`、`/product/p-1001`、`/cart`、`/profile`。
- 预期结果：
  - 测试、类型检查、lint、构建和工作流检查通过。
  - 页面和静态缺省页可本地访问。

## 风险和假设

- 当前页面是模拟壳子，不代表最终业务交互。
- 静态缺省页先放在 `public/static/fallback/`，后续静态导出和 App 内置路径需要与原生团队确认。
- OSS 配置模板只提供非敏感结构，真实密钥必须由发布环境或安全配置注入。

## 计划

### 影响范围

- UI：新增电商模拟页面和共享展示组件。
- Static Bundle：新增 public 下的静态缺省页。
- Release/Config：新增 OSS 配置模板和静态资源说明。
- AI 工作流：更新任务状态、变更摘要、TODO、changelog 和验证报告。

### 步骤

1. 使用测试优先方式，为 mock 商品数据和 OSS 配置模板结构增加最小单元测试。
2. 确认测试因模块或配置缺失失败。
3. 实现 mock 数据、页面共享组件、首页、分类页、详情页、购物车页和我的页。
4. 创建 `public/static/fallback/` 下的 4 个静态缺省 HTML 页面。
5. 创建 `config/oss.config.example.json` 和 `.env.example`，确保不包含真实密钥。
6. 更新发布规范、项目状态、TODO、变更摘要和 changelog。
7. 运行自动化验证和浏览器抽查。
8. 生成验证/审查记录，满足验收后归档任务。
## 验证记录

- 状态：passed
- 摘要：电商模拟页面、静态缺省页、OSS 配置模板通过测试、类型检查、lint、build、workflow 和浏览器抽查
- 报告：.ai/test-reports/2026-05-15-2026-05-15-commerce-mock-pages-static-fallback-oss-config-verification.md
## 审查记录

- 状态：passed
- 摘要：变更范围与任务一致，未接真实业务接口、真实 OSS 上传或 icon 库，发布/架构/编码规则/决策文档和状态文件已同步
- 报告：.ai/test-reports/2026-05-15-2026-05-15-commerce-mock-pages-static-fallback-oss-config-review.md

## 归档说明

### 已完成

- 实现模拟电商页面、静态缺省页与 OSS 配置模板

### 验证

- pnpm test、pnpm typecheck、pnpm lint、pnpm build、pnpm run ai:check-workflow --strict 和浏览器抽查均通过
