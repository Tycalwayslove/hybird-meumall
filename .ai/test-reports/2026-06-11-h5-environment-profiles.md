# H5 三套环境配置收敛验证记录

## 范围

- `config/env/h5.local.env`
- `config/env/h5.test.env`
- `config/env/h5.prod.env`
- 根目录 `dev:h5`
- `scripts/root/dev-all.sh`
- H5 BFF 后端 registry / backend client / BFF context / 首页真实接口目标测试

## 环境取值校验

```bash
for env_name in local test prod; do
  (set -a; . "hybird-meumall/config/env/h5.${env_name}.env"; set +a; printf '%s|%s|%s|%s|%s\n' "$env_name" "$APP_ENV" "$H5_SERVICE_BASE_URL" "$JAVA_API_BASE_URL" "$PYTHON_API_BASE_URL")
done
```

结果：

```text
local|local|https://hybird.aigcpop.com|https://test.aigcpop.com/mini_h5|https://test.aigcpop.com/api
test|test|https://hybird.aigcpop.com|https://test.aigcpop.com/mini_h5|https://test.aigcpop.com/api
prod|prod|https://hybird.aigcpop.com|https://test.aigcpop.com/mini_h5|https://test.aigcpop.com/api
```

## 验证命令

```bash
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); JSON.parse(require('fs').readFileSync('hybird-meumall/package.json','utf8')); console.log('package json ok')"
bash -n scripts/root/dev-all.sh
pnpm run test:dev-script
cd hybird-meumall
pnpm test src/server/http/backend-registry.test.ts src/server/http/backend-client.test.ts src/server/http/bff-context.test.ts src/features/home/home-real-api.test.ts
pnpm typecheck
pnpm lint
cd ..
pnpm run check
```

## 验证结果

- package JSON 解析：通过。
- `bash -n scripts/root/dev-all.sh`：通过。
- `pnpm run test:dev-script`：通过。
- H5 目标测试：通过，4 files / 12 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- 根目录 `pnpm run check`：通过。

## 剩余风险

- `h5.prod.env` 当前是正式环境占位，仍指向测试 H5 和测试后端域名；正式域名完成后必须替换并重新验证。
- 已经运行中的 Next dev server 不会自动读取新环境变量，切换 profile 后需要重启。
