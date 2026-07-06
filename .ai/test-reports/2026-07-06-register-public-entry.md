# 2026-07-06 注册固定公开入口记录

## 范围

- H5 发布规范和产品事实源更新。
- 注册二维码入口从版本化 URL 收敛为固定 `/register`。
- 固定入口实现从 `server-meumall` 调整为独立 Node resolver 容器，并接入 Java active manifest。

## 验证

本次 H5 侧未修改页面代码。固定入口 resolver 通过 Node 单测验证：

```bash
cd /Users/mac/person_code/meu-mall
node scripts/register-resolver/test.js
```

结果：通过，覆盖 manifest 直返、`data` 包装、数组 routes、query 保留和 HTTP 302。

部署脚本语法验证：

```bash
cd /Users/mac/person_code/meu-mall
bash -n scripts/deploy/h5-version-deploy.sh
bash -n scripts/deploy/h5-jenkins-release.sh
node --check scripts/register-resolver/server.js
```

结果：通过。

H5 文档检查：

```bash
cd /Users/mac/person_code/meu-mall/hybird-meumall
pnpm run ai:check-docs-sync --strict
```

结果：未完成。pnpm 在 install 阶段被 `ERR_PNPM_IGNORED_BUILDS` 阻断，提示需要通过 `pnpm approve-builds` 授权 `sharp@0.34.5`、`unrs-resolver@1.11.1` 的 build scripts；本次未擅自批准依赖脚本。

H5 工作流检查：

```bash
pnpm run ai:check-workflow
```

结果：未完成。阻断原因同上，为 pnpm build-script approval，不是本次 `/register` resolver 断言失败。

## 后续上线检查

- H5 release manifest routes 包含 `/register`。
- 版本化页面 `/h5-v/<version>/register` 可访问。
- Jenkins 构建后 `meu-mall-register-resolver` 容器健康检查通过。
- 公网固定入口 `https://hybird.aigcpop.com/register` 返回 302 到 active 版本注册页。

## 飞书同步

- 规则页：https://v05ctaei9gn.feishu.cn/wiki/P8bGwOGHuiW2elkUWBUcfiFpnQh，创建 revision 3，回写后 revision 4，移除 `environment` query 口径后 revision 6。
- 页面盘点：https://v05ctaei9gn.feishu.cn/wiki/WgaqwTRRUitnRNkCtNPcOcDnnre，revision 70。
- H5 发版流程：https://v05ctaei9gn.feishu.cn/wiki/HyBpwTbNUigKsOkO2Qgc2rjBnie，revision 6。
- Node resolver 容器口径已同步：规则页 revision 11，页面盘点 revision 73，H5 发版流程 revision 7。
