# 任务：首页首轮逐页细调

## 状态

verified

## 目标

按最新 Figma 首页设计和当前逐页检查要求，调整首页 banner 空数据展示策略和分类区骨架/兜底 icon 视觉。

## 范围

- 包含：
  - 首页接口未返回 banner 数据时不展示轮播图区域。
  - 首页分类骨架屏使用统一灰色圆角块。
  - 首页分类无远程 icon 时使用统一灰色圆角块兜底。
  - 分类 icon 尺寸按 Figma 首页节点 `2:651` 调整为 52px 容器。
  - 更新首页相关测试和项目事实源。
- 不包含：
  - 新增或调整首页接口字段。
  - 修改 Native Bridge、manifest、发布链路或管理后台配置。
  - 新建飞书知识库页面。

## 上下文

- Figma：`喵呜APP`，节点 `2:651` 首页。
- 相关文件：
  - `src/features/home/components/HomeExperience.tsx`
  - `src/features/home/components/HomeExperience.module.css`
  - `src/features/home/HomeSkeleton.tsx`
  - `src/features/home/HomeModules.tsx`
  - `src/features/home/home.test.tsx`
  - `.ai/PROJECT_STATE.md`
  - `.ai/CHANGE_SUMMARY.md`
  - `docs/08_CHANGELOG.md`
  - `.ai-workspace/product/page-inventory.md`

## 验收标准

- [x] 首页接口无 banner 数据时不渲染 banner/轮播占位。
- [x] 分类空数据仍展示分类骨架屏。
- [x] 分类骨架和无 icon 兜底为灰色圆角块，不再使用多色堆叠占位。
- [x] 分类 icon 容器尺寸为 52px，布局按两行五列、左右 16px 贴近 Figma。
- [x] 首页测试通过。

## 验证

- `pnpm exec vitest run src/features/home/home.test.tsx src/features/home/home-real-api.test.ts`：通过，2 files / 28 tests。
- `pnpm typecheck`：通过。
- `git diff --check`：通过。
- 飞书页面清单同步：<https://v05ctaei9gn.feishu.cn/wiki/WgaqwTRRUitnRNkCtNPcOcDnnre>，revision_id=71。

## 备注

本次是 H5 内部 UI 展示策略调整，不涉及跨项目接口、Native Bridge、manifest 或发布契约变更。页面清单已同步飞书知识库 revision_id=71。

## 标签

- H5
- 首页
- UI

## 风险和假设

- 本任务只调整空数据和骨架视觉；首页接口字段和业务兜底策略不在本任务内变更。
