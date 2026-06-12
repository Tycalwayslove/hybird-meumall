# H5 静态资源目录规范

`public/assets` 只放随 H5 版本一起发布、由代码直接引用的稳定资源。

## 目录

```text
public/assets/
  brand/         品牌 logo、品牌图形、固定品牌背景
  icons/         H5 自维护 icon，优先 SVG
  home/          首页固定运营图、固定模块背景
  promotion/     推广页固定图形
    talent-badges/ 达人等级徽章，本地随 H5 发版
  mine/          我的页固定图形
    level-badges/ 我的页昵称旁等级横条徽章
  placeholders/  默认头像、默认商品图、图片加载失败兜底图
```

## 引用

页面和组件不要直接写 `/assets/...`，统一使用：

```ts
import { assetUrl } from "@/lib/assets";

const banner = assetUrl("/assets/home/banner-renewal.webp");
```

对会被业务配置引用的本地稳定资源，优先注册到 `src/lib/assets/local-assets.ts`：

```ts
import { localAssetUrl } from "@/lib/assets";

const badge = localAssetUrl("promotion.talentBadge.v1");
```

原因：

- 本地开发默认返回 `/assets/...`。
- WebView 生产环境使用 `H5_BASE_PATH=/hybird` 时，需要返回 `/hybird/assets/...`。
- 配置 `NEXT_PUBLIC_H5_ASSET_BASE_URL` 后，会返回 CDN 地址。
- 业务组件只依赖资源 key，不直接拼接文件路径，后续迁移 CDN 或版本目录时不用改页面。
- `assetUrl()` 内部必须使用显式 `process.env.NEXT_PUBLIC_*` 读取客户端配置，不能使用 `process.env[key]` 动态读取，避免客户端切换状态后丢失版本 basePath。

## 放入规则

- 适合放这里：固定 UI 图、固定 icon、默认头像、默认商品图、H5 内置兜底图。
- 不适合放这里：真实商品图、用户头像、后台配置 banner、达人素材、可运营替换活动图。
- 业务动态图片应由后台或 CMS 上传对象存储/CDN，接口返回完整 URL。

## 文件规范

- 图片优先使用 `webp`，需要透明通道时使用 `png`，icon 优先 `svg`。
- 文件名使用小写短横线，例如 `banner-renewal.webp`。
- 替换同名文件前必须确认缓存策略；生产建议使用带版本或内容 hash 的新文件名。

## 已注册资源

| Key | Path | 用途 |
| --- | --- | --- |
| `shared.greenHeroBg` | `/assets/shared/green-hero-bg.png` | 浅绿顶部通用背景，当前用于我的页、奖励记录和排行榜 |
| `promotion.talentBadge.v1` | `/assets/promotion/talent-badges/talent-badge-v1.png` | V1 新锐达人徽章 |
| `promotion.talentBadge.v2` | `/assets/promotion/talent-badges/talent-badge-v2.png` | V2 白银达人徽章 |
| `promotion.talentBadge.v3` | `/assets/promotion/talent-badges/talent-badge-v3.png` | V3 黄金达人徽章 |
| `promotion.talentBadge.v4` | `/assets/promotion/talent-badges/talent-badge-v4.png` | V4 星钻达人徽章 |
| `promotion.talentBadge.v5` | `/assets/promotion/talent-badges/talent-badge-v5.png` | V5 至尊达人徽章 |
| `promotion.talentHeroBg.v1` | `/assets/promotion/talent-badges/talent-hero-bg-v1.png` | V1 推广首页达人背景 |
| `promotion.talentHeroBg.v2` | `/assets/promotion/talent-badges/talent-hero-bg-v2.png` | V2 推广首页达人背景 |
| `promotion.talentHeroBg.v3` | `/assets/promotion/talent-badges/talent-hero-bg-v3.png` | V3 推广首页达人背景 |
| `promotion.talentHeroBg.v4` | `/assets/promotion/talent-badges/talent-hero-bg-v4.png` | V4 推广首页达人背景 |
| `promotion.talentHeroBg.v5` | `/assets/promotion/talent-badges/talent-hero-bg-v5.png` | V5 推广首页达人背景 |
| `promotion.talentSummaryCard.v1` | `/assets/promotion/talent-badges/talent-summary-card-v1.png` | V1 汇总卡背景 |
| `promotion.talentSummaryCard.v2` | `/assets/promotion/talent-badges/talent-summary-card-v2.png` | V2 汇总卡背景 |
| `promotion.talentSummaryCard.v3` | `/assets/promotion/talent-badges/talent-summary-card-v3.png` | V3 汇总卡背景 |
| `promotion.talentSummaryCard.v4` | `/assets/promotion/talent-badges/talent-summary-card-v4.png` | V4 汇总卡背景 |
| `promotion.talentSummaryCard.v5` | `/assets/promotion/talent-badges/talent-summary-card-v5.png` | V5 汇总卡背景 |
| `promotion.rankingPodium.first` | `/assets/promotion/ranking/ranking-podium-card-first.png` | 排行榜第 1 名领奖台背景 |
| `promotion.rankingPodium.second` | `/assets/promotion/ranking/ranking-podium-card-second.png` | 排行榜第 2 名领奖台背景 |
| `promotion.rankingPodium.third` | `/assets/promotion/ranking/ranking-podium-card-third.png` | 排行榜第 3 名领奖台背景 |
| `promotion.rankingCrown.first` | `/assets/promotion/ranking/ranking-crown-first.png` | 排行榜第 1 名皇冠 |
| `promotion.rankingCrown.second` | `/assets/promotion/ranking/ranking-crown-second.png` | 排行榜第 2 名皇冠 |
| `promotion.rankingCrown.third` | `/assets/promotion/ranking/ranking-crown-third.png` | 排行榜第 3 名皇冠 |
| `promotion.rankingHeroBg` | `/assets/shared/green-hero-bg.png` | 排行榜顶部背景，复用共享浅绿背景 |
| `promotion.rewardRecordsBg` | `/assets/shared/green-hero-bg.png` | 奖励记录顶部背景，复用共享浅绿背景 |
| `placeholder.productImage` | `/assets/placeholders/product-image-placeholder.png` | 商品图片缺省组件中心图标 |
| `mine.hero.background` | `/assets/shared/green-hero-bg.png` | 我的页顶部背景，复用共享浅绿背景 |
| `mine.levelBadge.v1` | `/assets/mine/level-badges/level-badge-v1.png` | 我的页 V1 新锐达人横条徽章 |
| `mine.levelBadge.v2` | `/assets/mine/level-badges/level-badge-v2.png` | 我的页 V2 白银达人横条徽章 |
| `mine.levelBadge.v3` | `/assets/mine/level-badges/level-badge-v3.png` | 我的页 V3 黄金达人横条徽章 |
| `mine.levelBadge.v4` | `/assets/mine/level-badges/level-badge-v4.png` | 我的页 V4 星钻达人横条徽章 |
| `mine.levelBadge.v5` | `/assets/mine/level-badges/level-badge-v5.png` | 我的页 V5 至尊达人横条徽章 |
