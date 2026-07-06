# 任务：首页 banner jumpType 跳转细化

## 状态

verified

## 目标

根据 Apifox 首页聚合接口中 banner `jumpType` 字段，细化首页 banner 点击后的跳转逻辑，避免所有 banner 都跳到推广 Tab。

## 范围

- 包含：
  - 查询 Apifox 项目 `4403987` main 分支的 `GET /p/app/home/index` 最新接口契约。
  - 在首页 BFF mapper 中处理 `jumpType=1/2/3/4/5`。
  - 首页组件按 mapper 输出的 `href/navigation` 执行跳转。
  - 补充 mapper 和组件测试。
  - 更新 H5 首页 API 契约、H5 API 规范、项目状态和页面清单。
- 不包含：
  - 新增商城活动详情页。
  - 修改后端接口字段。
  - 修改 Native Bridge 协议。
  - 新建飞书知识库页面。

## Apifox 结果

- Project：`4403987`
- Branch：`main`
- Endpoint：`GET /p/app/home/index`
- Summary：`首页聚合数据`
- Tags：`喵呜商城/APP接口/喵呜达人首页接口`
- Banner schema：`PlatformBannerVO`
- 关键字段：
  - `jumpType`：`1H5 2商品详情 3活动页 4激励活动 5带货排行榜`
  - `jumpValue`：`URL或业务ID`

## 跳转规则

- `jumpType=1`：`jumpValue` 为 `http(s)` URL 或 H5 路径时按目标跳转。
- `jumpType=2`：`jumpValue` 或 `relation` 映射 `/product/<id>`。
- `jumpType=3`：URL/H5 路径优先；纯业务 ID 暂映射 `/promotion/activities?activityId=<id>`，待确认商城活动详情页。
- `jumpType=4`：URL/H5 路径优先；纯业务 ID 映射 `/promotion/activities/<id>`。
- `jumpType=5`：`jumpValue=1` 映射销量榜，`jumpValue=2` 映射销售额榜；其它进入榜单中心。
- `/`、`/promotion`、`/mine` 这类 Tab 根路径切 Tab；其它目标新开 H5 WebView。

## 验收标准

- [x] 首页 banner 商品详情跳 `/product/<id>`。
- [x] 首页 banner H5 URL/路径按目标跳转。
- [x] 首页 banner 达人激励活动 ID 跳活动详情。
- [x] 首页 banner 带货排行榜可跳销量榜、销售额榜或榜单中心。
- [x] 不再强制所有 banner 切到推广 Tab。
- [x] 首页相关测试和类型检查通过。

## 验证

- `pnpm exec vitest run src/features/home/home.test.tsx src/features/home/home-real-api.test.ts`：通过，2 files / 30 tests。
- `pnpm typecheck`：通过。
- `pnpm exec eslint src/features/home/home-page-data.ts src/features/home/components/HomeExperience.tsx src/features/home/server/home-real-service.ts src/features/home/home-real-api.test.ts src/features/home/home.test.tsx`：通过。
- `git diff --check`：通过（根目录和 `hybird-meumall`）。
- 飞书同步：页面盘点 revision 76，已核验可检索“商城活动承接页 / 达人激励活动详情 / 带货排行榜”。

## 风险和待确认

- Apifox 管理端 schema 将 `jumpType=3` 描述为“商城活动”，但当前 H5 没有独立商城活动详情页。本次仅在纯业务 ID 场景保留 `activityId` query 并进入活动承接页，待后续产品/后端确认正式路由后再收敛。
