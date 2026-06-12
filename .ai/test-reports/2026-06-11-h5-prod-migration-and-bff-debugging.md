# H5 正式迁移说明与 BFF 排错补齐验证记录

## 范围

- 首页停止请求旧 `GET /api/h5/home/config/active?environment=prod`。
- 首页 BFF route 增加 `[h5-bff-route-error]`。
- API 规范补充正式环境迁移清单和 BFF 日志排查。
- 发布规范补充正式环境迁移分层说明。

## 验证命令

```bash
cd hybird-meumall
pnpm test src/features/home/home.test.tsx src/features/home/home-real-api.test.ts src/server/http/bff-context.test.ts
pnpm typecheck
pnpm lint
cd ..
pnpm run check
```

## 验证结果

- 目标测试：通过，3 files / 16 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- 根目录 `pnpm run check`：通过。

## 额外检查

源码中不再出现旧首页配置 fetch helper：

```bash
rg -n "home/config/active|HOME_CONFIG_ENDPOINT|fetchActiveHomeConfig|buildHomeConfigUrl" hybird-meumall/src
```

结果为空。

## 剩余风险

- 旧首页配置契约仍保留历史接口说明，但已补充当前状态说明：它不再作为获取 H5 当前版本或首页业务数据的入口。
