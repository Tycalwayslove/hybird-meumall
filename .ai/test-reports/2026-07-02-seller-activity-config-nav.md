# 卖手活动配置页导航调整验证

- 日期：2026-07-02
- 范围：`/seller/activities/[activityId]` 活动配置页导航标题、导航右侧批量编辑入口、内容区 header 移除。

## 验证命令

```bash
pnpm exec vitest run src/features/seller-activity/seller-activity.test.tsx src/design-system/components/navigation.test.tsx
pnpm typecheck
pnpm exec eslint 'src/app/seller/activities/[activityId]/page.tsx' src/design-system/components/NavPageShell.tsx src/design-system/components/navigation.test.tsx src/features/seller-activity/components/SellerActivityScreens.tsx src/features/seller-activity/seller-activity.test.tsx
git diff --check
```

## 结果

- 单测通过：2 files / 20 tests。
- TypeScript 类型检查通过。
- 定向 ESLint 通过。
- diff 空白检查通过。

## 备注

- 本次不变更卖手活动接口契约、路由结构或批量操作语义。
