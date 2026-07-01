# 测试报告：iconfont Font class 图标体系

## 日期

2026-07-01

## 范围

- `IconFont` 组件渲染。
- iconfont 英文语义别名和生成 key 解析。
- 从本地 iconfont 下载包同步 23 个图标。
- Next 测试环境构建中的字体资源打包。

## 验证命令

```bash
pnpm exec vitest run src/design-system/components/iconfont.test.tsx
pnpm typecheck
pnpm icons:sync -- --source /Users/mac/Downloads/font_5196034_pfky5d5l91
pnpm build:test
```

## 结果

- `pnpm exec vitest run src/design-system/components/iconfont.test.tsx`：通过，1 file / 4 tests。
- `pnpm typecheck`：通过。
- `pnpm icons:sync -- --source /Users/mac/Downloads/font_5196034_pfky5d5l91`：通过，同步 iconfont 项目 `5196034` 的 23 个图标。
- `pnpm build:test`：通过。
- 构建产物检查：`.next/static/media/` 下生成 `iconfont...woff2`、`iconfont...woff` 和 `iconfont...ttf`。

## 风险

- 当前仅建立 Font class 单色图标基础体系，尚未批量替换业务页面里的 PNG 图标或色块占位。
- 如果 iconfont 后台修改已有图标的 `font_class`，业务语义别名需要同步更新。
