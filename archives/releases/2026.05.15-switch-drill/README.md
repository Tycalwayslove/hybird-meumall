# SSR 切流与回滚本地演练

## 本地服务

当前演练使用本地 SSR 服务：

```text
http://127.0.0.1:3109/hybird
```

如需重新启动：

```bash
PORT=3109 HOSTNAME=127.0.0.1 pnpm start
```

## 1. 稳定版本

```bash
pnpm run ai:resolve-manifest --manifest archives/releases/2026.05.15-switch-drill/stable/manifest.draft.json --route /category --user-id demo-gray
```

预期：

```text
命中版本：2026.05.15-001
是否命中灰度：否
加载地址：http://127.0.0.1:3109/hybird/category
```

## 2. 灰度切流

灰度用户：

```bash
pnpm run ai:resolve-manifest --manifest archives/releases/2026.05.15-switch-drill/gray/manifest.draft.json --route /category --user-id demo-gray
```

预期：

```text
命中版本：2026.05.15-002
是否命中灰度：是
加载地址：http://127.0.0.1:3109/hybird/category
```

普通用户：

```bash
pnpm run ai:resolve-manifest --manifest archives/releases/2026.05.15-switch-drill/gray/manifest.draft.json --route /category --user-id demo-stable
```

预期：

```text
命中版本：2026.05.15-001
是否命中灰度：否
加载地址：http://127.0.0.1:3109/hybird/category
```

## 3. 回滚

```bash
pnpm run ai:resolve-manifest --manifest archives/releases/2026.05.15-switch-drill/rollback/manifest.draft.json --route /category --user-id demo-gray --current-version 2026.05.15-002
```

预期：

```text
命中版本：2026.05.15-001
是否命中灰度：否
加载地址：http://127.0.0.1:3109/hybird/category
```

回滚 manifest 的关键变化：

- `stableVersion` 切回 `2026.05.15-001`
- `grayVersion` 被删除
- `grayRules.percentage` 归零
- `blacklistVersions` 包含异常版本 `2026.05.15-002`

## 页面体验

打开：

```text
http://127.0.0.1:3109/hybird/category
```

当前本地只有一套 SSR 服务实例，因此页面视觉不会随 manifest 版本变化；版本选择结果通过 `ai:resolve-manifest` 观察。真实线上会是同一套 manifest 指针控制 WebView 加载已部署的 SSR 版本。
