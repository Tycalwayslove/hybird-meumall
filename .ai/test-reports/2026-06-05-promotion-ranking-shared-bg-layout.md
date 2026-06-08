# 2026-06-05 推广排行榜共享背景与领奖台布局验证

## 范围

- 排行榜顶部背景改为共享本地图片资源。
- 我的页、奖励记录和排行榜复用同一张浅绿顶部背景。
- 排行榜皇冠调整到头像顶部右侧。
- 排行榜前三领奖台改为 360px 容器内贴合居中。
- 确认排行榜顶部导航使用项目公共导航组件。

## 关键结论

- `shared.greenHeroBg` 已注册到 `src/lib/assets/local-assets.ts`，路径为 `/assets/shared/green-hero-bg.png`。
- `mine.hero.background`、`promotion.rewardRecordsBg`、`promotion.rankingHeroBg` 均解析到共享背景路径。
- 旧的 `public/assets/promotion/reward-records/reward-records-bg.png` 已删除，避免同一张图在已跟踪资源中重复维护。
- 排行榜页面通过 `localAssetUrl("promotion.rankingHeroBg")` 输出背景地址，线上版本路径仍会带 `/h5-v/<version>` 或当前 basePath。
- 排行榜页面使用 `TransparentNavPage`，底层组合 `TopNavigation`，没有手写顶部导航。

## 验证命令

```bash
pnpm exec vitest run src/features/promotion/promotion-service.test.ts src/lib/assets/asset-url.test.ts
pnpm typecheck
pnpm lint
pnpm build
curl -sS http://localhost:3109/hybird/promotion/ranking/amount | rg -n "assets/shared/green-hero-bg|ranking-crown|ranking-podium|w-\\[360px\\]"
```

## 验证结果

- `vitest`：通过，2 files / 19 tests。
- `typecheck`：通过。
- `lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- `build`：通过。
- 本地 HTML：已输出 `/hybird/assets/shared/green-hero-bg.png`，领奖台资源仍带 `/hybird/assets/promotion/ranking/` basePath。

## 备注

- 普通 headless Chrome 截图不是移动仿真，会以 430px CSS 宽度渲染但只截取左侧 375px，因此会出现第三张领奖台假裁切；代码实际使用 360px 容器居中，375px WebView 下左右各约 7.5px，430px WebView 下左右各 35px。
- 当前排行榜头像仍为 mock 渐变头像；真实头像后续应由后端或 CMS 返回远程 URL。
