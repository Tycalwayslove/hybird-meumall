# 验证：本地 Jenkins H5 构建链路

## 日期

2026-05-16

## 范围

- Jenkins Controller：`http://127.0.0.1:8082`
- Jenkins Job：`hybird-meumall-local-deploy`
- Jenkins Agent：`mac-studio`
- 本地构建脚本：`/Users/mac/meumall-ci/ops/hybird-local-deploy.sh`
- 目标服务器：`root@118.196.24.12`

## 命令

```bash
bash -n /Users/mac/meumall-ci/ops/hybird-local-deploy.sh
curl -u meumall:*** http://127.0.0.1:8082/computer/mac-studio/api/json
curl -u meumall:*** http://127.0.0.1:8082/job/hybird-meumall-local-deploy/7/api/json
ssh -i /Users/mac/Documents/codex-ssh.pem root@118.196.24.12 \
  'test -f /opt/meumall/releases/hybird/2026.05.16-local-smoke-007/standalone/server.js'
ssh -i /Users/mac/Documents/codex-ssh.pem root@118.196.24.12 \
  'cat /opt/meumall/releases/hybird/2026.05.16-local-smoke-007/deploy.json'
```

## 结果

- `mac-studio` agent 在线，`offline=false`。
- Jenkins build #7 结果为 `SUCCESS`。
- Jenkins build #11 结果为 `SUCCESS`。
- Next.js SSR 构建通过，路由输出为动态 SSR。
- `pnpm test` 通过：10 个测试文件，58 个测试。
- `pnpm typecheck` 通过。
- `pnpm run ai:prepare-standalone-assets` 通过，`.next/static` 和 `public` 已复制到 standalone 运行目录。
- 远端 release 目录存在：`/opt/meumall/releases/hybird/2026.05.16-local-11`。
- 已通过 SSH tunnel 注册 candidate release：`2026.05.16-local-11`。
- 远端 current 指向：`/opt/meumall/releases/hybird/2026.05.16-local-11`。
- 远端 `deploy.json` 记录：
  - version：`2026.05.16-local-11`
  - branch：`main`
  - gitCommit：`bb0b7e2aebebea054cfd25c60fd0989a572c1349`
  - buildNumber：`11`
  - basePath：`/hybird`
- 公网 smoke 通过：
  - `http://118.196.24.12/hybird/api/health`
  - `http://118.196.24.12/hybird/category`
- 首页重定向验证通过：
  - `http://118.196.24.12/hybird` 返回 200
  - `http://118.196.24.12/hybird/` 只重定向一次到 `/hybird` 后返回 200
  - `http://118.196.24.12/` 重定向到 `/hybird` 后返回 200

## 备注

- Jenkins agent 已固化本机代理，后台 `curl` 和 `git ls-remote` 均确认通过 `127.0.0.1:10808` 访问 GitHub。
- release 注册通过 SSH tunnel 访问服务器本机 FastAPI，避免公网 `/api/releases` 的 nginx Basic Auth 401。
- Docker Desktop 账号登出不影响本地已存在镜像的构建；只有需要从 Docker Hub 拉新镜像时才可能受登录状态或镜像源影响。
