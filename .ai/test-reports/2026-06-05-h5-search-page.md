# 验证：H5 搜索页

## 日期

2026-06-05

## 范围

- `/search` H5 搜索页。
- `src/features/search/**` 页面组件、mock、类型和渲染测试。
- 根级工作项：`.ai-workspace/tasks/TASK-2026-0605-003-h5-search-page.md`。

## 命令

```bash
pnpm test src/features/search/search.test.tsx
pnpm typecheck
pnpm lint
H5_BASE_PATH=/hybird NEXT_PUBLIC_H5_BASE_PATH=/hybird pnpm exec next dev -p 3109
curl -I http://localhost:3109/hybird/search
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 --window-size=430,812 --screenshot=.ai/test-reports/screenshots/2026-06-05-h5-search-page.png http://localhost:3109/hybird/search
```

## 结果

- `pnpm test src/features/search/search.test.tsx`：通过，1 个测试文件、2 个用例通过。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，无 error；存在 4 个既有推广模块 `<img>` warning，文件为 `src/features/promotion/components/PromotionActivitiesScreen.tsx`、`PromotionActivityDetailScreen.tsx`、`PromotionRewardRecordsScreen.tsx`，不属于本搜索页改动。
- `curl -I http://localhost:3109/hybird/search`：返回 `HTTP/1.1 200 OK`。
- Chrome headless 截图：已生成 `.ai/test-reports/screenshots/2026-06-05-h5-search-page.png`，页面主体、顶部搜索栏、AI 导购入口、热门搜索、搜索历史、热榜 tab、榜单提示条和商品卡片可见。
- 搜索页资源扫描：`rg '/assets/|<img|url\(/assets' src/app/search src/features/search` 未发现业务实现中的裸本地资源路径或商品图片；仅测试断言文本包含 `/assets/` 和 `<img`。

## 备注

- 设计中商品图未提供稳定资源，首版按要求使用 CSS 占位图块，不生成真实商品图片。
- 当前页面只使用本地 mock，不接搜索 API、搜索历史持久化、AI 导购 Bridge 或后台配置。
- Figma 当前仍按实验稿处理，后续真实搜索接口、热榜规则和 AI 导购能力需另行建立工作项与契约。
