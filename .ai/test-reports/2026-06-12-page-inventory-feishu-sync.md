# 2026-06-12 H5 页面清单与飞书知识库同步

## 范围

- 更新仓库事实源 `.ai-workspace/product/page-inventory.md`。
- 补充当前 `hybird-meumall/src/app` 实际路由清单。
- 标注首页、商品详情、订单确认、个人中心二级页、推广相关页面的当前状态、数据来源和容器策略。
- 同步飞书知识库页面：`02 H5 页面清单与开发进度`。

## 飞书目标

- 飞书知识库页面：<https://v05ctaei9gn.feishu.cn/wiki/WgaqwTRRUitnRNkCtNPcOcDnnre>
- 文档 ID：`IsGAdbLzUoZvZfxzOORcWlKknhc`
- 同步后 revision：`6`

## 本地更新要点

- 页面盘点状态更新为“已按 2026-06-12 当前 H5 实际路由和实现状态补充”。
- 新增“当前 H5 实际路由清单”，按以下维度拆分：
  - Tab 与通用页面
  - 商品、交易与个人中心
  - 推广、达人与活动
  - BFF 与运行时接口
- 明确设置页由 App 原生承载，H5 发送 `router/navigate route=settings`。
- 明确商品详情当前只覆盖普通商品、快递、SKU、立即购买和订单确认；秒杀、拼团、自提、同城、正式下单和支付后置。
- 明确个人中心二级页当前为静态高保真 mock，真实接口后置。

## 飞书同步命令

```bash
node <<'NODE' | lark-cli docs +update --api-version v2 --doc 'https://v05ctaei9gn.feishu.cn/wiki/WgaqwTRRUitnRNkCtNPcOcDnnre' --command overwrite --doc-format markdown --content - --as user --format json
...
NODE
```

## 验证命令

```bash
lark-cli docs +fetch --api-version v2 --doc 'https://v05ctaei9gn.feishu.cn/wiki/WgaqwTRRUitnRNkCtNPcOcDnnre' --doc-format markdown --scope keyword --keyword '当前 H5 实际路由清单|/wallet|/api/bff/product-detail|route=settings' --context-before 1 --context-after 3 --format json --as user
pnpm --dir hybird-meumall run ai:check-docs-sync --strict
lark-cli docs +fetch --api-version v2 --doc 'https://v05ctaei9gn.feishu.cn/wiki/WgaqwTRRUitnRNkCtNPcOcDnnre' --doc-format markdown --scope keyword --keyword '最后同步|仓库事实源' --context-before 0 --context-after 1 --format json --as user
```

## 当前结果

- 飞书 `docs +update`：成功，revision 更新为 `6`。
- 飞书关键词验证：命中 `当前 H5 实际路由清单`、`/wallet`、`/api/bff/product-detail`、`route=settings`。
- 飞书同步头验证：`最后同步：2026-06-12 15:04:43`，仓库事实源为 `.ai-workspace/product/page-inventory.md` 和 `hybird-meumall/src/app`。
- `pnpm --dir hybird-meumall run ai:check-docs-sync --strict`：通过，共 15 个文件。

## 说明

- 初次运行 `pnpm --dir hybird-meumall run ai:check-docs-sync -- --strict` 因多传 `--` 失败，已使用正确命令重跑通过。
- `lark-cli` 提示当前版本 `1.0.48`，最新版本 `1.0.52`，可后续执行 `lark-cli update` 升级。

