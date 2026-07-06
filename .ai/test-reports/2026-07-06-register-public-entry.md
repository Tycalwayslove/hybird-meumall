# 2026-07-06 注册固定公开入口记录

## 范围

- H5 发布规范和产品事实源更新。
- 注册二维码入口从版本化 URL 收敛为固定 `/register`。

## 验证

本次 H5 侧未修改页面代码。固定入口行为在 `server-meumall` 中验证：

```bash
cd /Users/mac/person_code/meu-mall/server-meumall
. .venv/bin/activate && pytest tests/test_api.py
```

结果：16 个测试通过。

H5 文档检查：

```bash
cd /Users/mac/person_code/meu-mall/hybird-meumall
pnpm run ai:check-docs-sync --strict
```

结果：通过，15 个文件。

H5 工作流检查：

```bash
pnpm run ai:check-workflow
```

结果：未通过。失败项为既有任务 `.ai/tasks/2026-06-29-address-flow-routing.md` 和 `.ai/tasks/2026-07-01-iconfont-font-class.md` 缺少 `## 标签`、`## 风险和假设`，与本次注册固定入口变更无关，本次未修改这些历史任务文件。

## 后续上线检查

- H5 release manifest routes 包含 `/register`。
- 版本化页面 `/h5-v/<version>/register` 可访问。
- 公网固定入口 `https://hybird.aigcpop.com/register` 返回 302 到 active 版本注册页。

## 飞书同步

- 规则页：https://v05ctaei9gn.feishu.cn/wiki/P8bGwOGHuiW2elkUWBUcfiFpnQh，创建 revision 3，回写后 revision 4，移除 `environment` query 口径后 revision 6。
- 页面盘点：https://v05ctaei9gn.feishu.cn/wiki/WgaqwTRRUitnRNkCtNPcOcDnnre，revision 70。
- H5 发版流程：https://v05ctaei9gn.feishu.cn/wiki/HyBpwTbNUigKsOkO2Qgc2rjBnie，revision 6。
