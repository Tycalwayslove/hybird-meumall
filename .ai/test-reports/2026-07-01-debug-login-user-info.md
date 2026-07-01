# 验证：Debug Login 写入 UserInfo

## 日期

2026-07-01

## 范围

- `/debug-login` 调试页新增 UserInfo JSON 输入。
- 已有 `mallToken` / `pythonToken` 但缺少 `userInfo` 时，直接访问 `/debug-login` 可继续补写。
- UserInfo JSON 写入前做 JSON 对象校验和压缩。

## 命令

```bash
pnpm exec vitest run src/features/debug-login/debug-login.test.tsx
```

## 结果

- 通过，1 file / 6 tests。

## 备注

- 调试页写入的是浏览器 JS 可读 Cookie，仅用于本地或浏览器独立 H5 联调。
- 原生 App 正式路径仍必须由 App 初始化写入 `mallToken`、`pythonToken` 和 `userInfo`。
