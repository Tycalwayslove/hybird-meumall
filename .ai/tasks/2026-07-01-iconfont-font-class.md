# 任务：接入 iconfont Font class 图标体系

## 目标

将 iconfont 项目 `5196034` 的单色 Font class 图标接入 H5 design-system，并提供后续从本地下载包重新同步的命令。

## 范围

- 包含：
  - 同步本地 iconfont 下载包中的字体文件和 glyph 清单。
  - 新增 `IconFont` 组件、英文语义别名和生成类型清单。
  - 新增 `icons:sync` 命令支持后续更新。
  - 更新 H5 编码规范、项目状态、变更记录和决策记录。
- 不包含：
  - 多色 Symbol 图标。
  - 批量替换现有页面中的 PNG 图标或色块占位。
  - 后端、Native Bridge、管理后台或发布平台契约变更。

## 上下文

- iconfont 下载包：`/Users/mac/Downloads/font_5196034_pfky5d5l91/`
- 相关文件：
  - `src/design-system/components/IconFont.tsx`
  - `src/design-system/icons/iconfont.css`
  - `src/design-system/icons/iconfont.generated.ts`
  - `src/design-system/icons/iconfont-aliases.ts`
  - `scripts/iconfont/sync-font-class.ts`

## 验收标准

- [x] H5 可以通过 `IconFont` 组件使用 iconfont 图标。
- [x] 下载包中的 23 个图标全部进入生成清单。
- [x] 后续可通过 `pnpm icons:sync -- --source <iconfont下载目录>` 重新同步。
- [x] 字体资源通过 Next 构建进入 `.next/static/media`。
- [x] 类型检查、组件测试和测试环境构建通过。

## 验证

- `pnpm exec vitest run src/design-system/components/iconfont.test.tsx`：通过，1 file / 4 tests。
- `pnpm typecheck`：通过。
- `pnpm icons:sync -- --source /Users/mac/Downloads/font_5196034_pfky5d5l91`：通过，同步 23 个图标。
- `pnpm build:test`：通过，构建产物包含 `.next/static/media/iconfont...woff2/woff/ttf`。

## 备注

本任务是 H5 内部设计系统和静态资源体系变更，不涉及跨项目契约。后续页面接入具体图标时，应优先补充英文语义别名，避免业务 JSX 直接使用 iconfont 原始类名。

## 标签

- H5
- design-system
- iconfont

## 风险和假设

- 后续 iconfont 下载包结构如果变化，需要先更新同步脚本再重新生成清单。
