# H5 静态资源目录规范

`public/assets` 只放随 H5 版本一起发布、由代码直接引用的稳定资源。

## 目录

```text
public/assets/
  brand/         品牌 logo、品牌图形、固定品牌背景
  icons/         H5 自维护 icon，优先 SVG
  home/          首页固定运营图、固定模块背景
  promotion/     推广页固定图形
  mine/          我的页固定图形
  placeholders/  默认头像、默认商品图、图片加载失败兜底图
```

## 引用

页面和组件不要直接写 `/assets/...`，统一使用：

```ts
import { assetUrl } from "@/lib/assets";

const banner = assetUrl("/assets/home/banner-renewal.webp");
```

原因：

- 本地开发默认返回 `/assets/...`。
- WebView 生产环境使用 `H5_BASE_PATH=/hybird` 时，需要返回 `/hybird/assets/...`。
- 配置 `NEXT_PUBLIC_H5_ASSET_BASE_URL` 后，会返回 CDN 地址。

## 放入规则

- 适合放这里：固定 UI 图、固定 icon、默认头像、默认商品图、H5 内置兜底图。
- 不适合放这里：真实商品图、用户头像、后台配置 banner、达人素材、可运营替换活动图。
- 业务动态图片应由后台或 CMS 上传对象存储/CDN，接口返回完整 URL。

## 文件规范

- 图片优先使用 `webp`，需要透明通道时使用 `png`，icon 优先 `svg`。
- 文件名使用小写短横线，例如 `banner-renewal.webp`。
- 替换同名文件前必须确认缓存策略；生产建议使用带版本或内容 hash 的新文件名。
