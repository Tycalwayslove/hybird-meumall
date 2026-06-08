# H5 首页高保真化验证记录

## 基本信息

- 日期：2026-06-05
- 任务：`TASK-2026-0605-002-h5-home-page-high-fidelity`
- 页面：`/`
- 本地访问路径：`http://localhost:3109/hybird`

## 自动验证

| 命令 | 结果 | 说明 |
| --- | --- | --- |
| `pnpm typecheck` | 通过 | TypeScript 无错误 |
| `pnpm test -- src/features/home/home.test.tsx` | 通过 | Vitest 实际运行 23 个测试文件、123 个用例，全部通过 |
| `pnpm lint` | 通过 | 仍有 4 个既有推广组件 `<img>` warning；本次首页新增组件无 warning |

## 浏览器验证

- 375x812 视口：页面展示 logo、搜索栏、消息入口、banner、分类宫格、活动卡和推荐商品。
- 375x812 视口：页面滚动到 520px 后，header 仍保持 `position: sticky`，`top=0`。
- 375x812 视口：页面高度 1882px，推荐商品卡数量为 10。
- 375x812 视口：分类占位数量为 10，首个占位图块为 50x50 灰色渐变图块。
- 375x812 视口：推荐商品区检测到 5 个 `seckill-label` 图片，活动卡中未检测到 `seckill-label`。
- 375x812 视口：Debug 面板默认收起；点击 Debug 图标后展开，包含“原生传参”和“Hybrid Bridge 调试”。
- 320x700 视口：图片全部正常加载，无坏图，无横向溢出；滚动后 header 仍保持 `top=0`。
- H5 页面未重复绘制原生状态栏、底部 Tab 和 Home Indicator。

## 风险

- 页面仍使用本地 mock 数据；真实分类、活动和推荐商品需要后续接口或运营配置契约确认。
- 推荐商品图当前按需求使用占位图块，后续接入真实商品图时需要补图片字段、错误兜底和性能策略。
