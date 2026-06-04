# 2026-06-04 原生 Cookie 双 token 与状态栏高度验证

## 范围

- 服务端 Cookie 读取：`pythonToken`、`mallToken`、`statusHeight`。
- 后端 token 选择：Python 使用 `pythonToken`，Java / mall 使用 `mallToken`。
- 原生运行时上下文：展示两个 token、状态栏高度、页面配置、URL 参数和 Cookie 明细。
- 类型检查。

## 验证命令

```bash
cd /Users/mac/person_code/meu-mall/hybird-meumall
pnpm test src/server/auth/cookie-auth.test.ts src/server/runtime/native-context.test.ts src/server/http/backend-client.test.ts
pnpm typecheck
pnpm test
pnpm build
```

## 验证结果

- 专项测试通过：3 files / 9 tests。
- 全量测试通过：19 files / 89 tests。
- TypeScript 类型检查通过。
- Next.js production build 通过。

## 剩余风险

- `statusHeight` 当前按 px 写入 `--native-status-height`，仍需原生 App 确认单位。
- `pythonToken` / `mallToken` 的 Cookie 属性仍需真机联调确认。
- 本次未发布线上版本。
