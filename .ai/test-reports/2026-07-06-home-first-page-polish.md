# 首页首轮逐页细调验证记录

## 范围

- 首页无 banner 数据展示策略。
- 首页分类骨架屏和 icon 兜底视觉。
- 首页分类 icon 尺寸与 Figma 节点 `2:651` 对齐。

## 验证命令

```bash
pnpm exec vitest run src/features/home/home.test.tsx src/features/home/home-real-api.test.ts
pnpm typecheck
git diff --check
```

## 结果

- `pnpm exec vitest run src/features/home/home.test.tsx src/features/home/home-real-api.test.ts`：通过，2 files / 28 tests。
- `pnpm typecheck`：通过。
- `git diff --check`：通过。
- 飞书页面清单同步验证：关键词 `banner 为空时不展示轮播图` 可检索，revision_id=71。

## 备注

本次未启动 App WebView 真机验证；视觉尺寸依据 Figma 首页节点 `2:651` 元数据和截图核对。
