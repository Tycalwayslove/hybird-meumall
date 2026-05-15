# 验证：Manifest Schema 与远程配置中心

## 日期

2026-05-15

## 范围

- `.ai/tasks/2026-05-15-manifest-schema-and-remote-config.md`
- `src/config/remote-config.ts`
- `src/config/remote-config.test.ts`
- `docs/03_RELEASE_SPEC.md`

## 命令

```bash
pnpm test -- src/config/remote-config.test.ts
pnpm test
pnpm typecheck
pnpm lint
pnpm run ai:check-workflow --strict
```

## 结果

- 已先运行 `pnpm test -- src/config/remote-config.test.ts`，确认测试因 `./remote-config` 模块不存在失败。
- 实现后 `pnpm test -- src/config/remote-config.test.ts` 通过。
- `pnpm test` 通过，4 个测试文件、26 个测试用例通过。
- `pnpm typecheck` 通过。
- `pnpm lint` 通过。

## 备注

- 本任务只定义类型和本地结构校验，不实现真实远程拉取、CDN 发布、缓存或静态包构建流水线。
