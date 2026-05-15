# 验证：Theme Runtime 与 Light/Dark 切换

## 日期

2026-05-15

## 范围

- `.ai/tasks/2026-05-15-theme-runtime-light-dark.md`
- `src/lib/theme/tokens.ts`
- `src/lib/theme/runtime.ts`
- `src/lib/theme/runtime.test.ts`
- `src/styles/globals.css`
- `docs/04_THEME_SPEC.md`

## 命令

```bash
pnpm test -- src/lib/theme/runtime.test.ts
pnpm test
pnpm typecheck
pnpm lint
pnpm run ai:check-workflow --strict
```

## 结果

- 已先运行 `pnpm test -- src/lib/theme/runtime.test.ts`，确认测试因 `getThemeConfig`、`sanitizeThemeVariables`、`applyTheme` 缺失失败。
- 实现后 `pnpm test -- src/lib/theme/runtime.test.ts` 通过。
- `pnpm test` 通过，5 个测试文件、31 个测试用例通过。
- `pnpm typecheck` 通过。
- `pnpm lint` 通过。

## 备注

- 本任务只支持 light/dark，不实现品牌主题、远程主题拉取或用户偏好持久化。
