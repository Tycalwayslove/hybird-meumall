# 2026-06-12 Bridge 直出路由飞书同步记录

## 同步内容

- 根级 `AGENTS.md` 已补充强制规则：页面进度、页面清单、端归属、H5 路由、页面状态和 Native Bridge / WebView / 跨端协议变更后，必须先更新仓库事实源，再同步公司飞书知识库对应页面。
- 已将 H5 与原生 App 路由跳转对接说明同步到飞书知识库：
  - Wiki URL: <https://v05ctaei9gn.feishu.cn/wiki/OJk1wa43PiR9lTkYs2YcW8llnmf>
  - Doc URL: <https://v05ctaei9gn.feishu.cn/docx/XCZQdRUpioKDT3x7haecT4OLnxe>
  - Revision: `71`

## 仓库事实源

- `.ai-workspace/integration-briefs/BRIEF-2026-0605-h5-native-route-map.md`
- `.ai-workspace/contracts/native-bridge/meumall-bridge-protocol.md`
- `hybird-meumall/docs/02_NATIVE_BRIDGE_SPEC.md`

## Bridge 口径

- `native-page` 仅作为容器策略名称。
- Bridge 层打开原生页面时直接发送具体原生页面名，例如 `route=settings`。
- 不再使用 `route=native_page` + `params.name` 包装。
- 2026-06-12 已补充独立章节 `2026-06-12 Bridge 协议变更记录：设置页打开方式`，说明变更原因、修改前后 JSON、H5 实现位置、App dispatcher 调整点、影响范围和联调验收点。

## 飞书校验

- `lark-cli docs +update --api-version v2 --doc https://v05ctaei9gn.feishu.cn/wiki/OJk1wa43PiR9lTkYs2YcW8llnmf --command overwrite --doc-format markdown --as user`
  - 结果：`ok=true`
  - Revision: `65`
  - 备注：飞书返回 `partial_success`，提示 Mermaid/whiteboard 内容解析降级；正文、表格和代码块已写入。
- `lark-cli docs +fetch --api-version v2 --doc https://v05ctaei9gn.feishu.cn/wiki/OJk1wa43PiR9lTkYs2YcW8llnmf --scope keyword --keyword '最后同步|仓库事实源|同步原则' --as user`
  - 结果：命中最后同步时间、仓库事实源和同步原则。
- `lark-cli docs +fetch --api-version v2 --doc https://v05ctaei9gn.feishu.cn/wiki/OJk1wa43PiR9lTkYs2YcW8llnmf --scope keyword --keyword 'route=settings|route=native_page|Bridge 层不再发送|nativePage="settings"|payload.route' --as user`
  - 结果：命中 `route=settings`、`Bridge 层不再发送 route=native_page`、`nativePage="settings"` 和 iOS `payload.route` dispatcher 示例。
- `lark-cli docs +update --api-version v2 --doc https://v05ctaei9gn.feishu.cn/wiki/OJk1wa43PiR9lTkYs2YcW8llnmf --command overwrite --doc-format markdown --as user`
  - 结果：`ok=true`
  - Revision: `71`
  - 备注：补充设置页 Bridge 协议变更记录后重新同步。
- `lark-cli docs +fetch --api-version v2 --doc https://v05ctaei9gn.feishu.cn/wiki/OJk1wa43PiR9lTkYs2YcW8llnmf --scope keyword --keyword '2026-06-12 Bridge 协议变更记录|修改前后的信封对比|App 侧需要调整的点|联调验收点' --as user`
  - 结果：命中新章节标题、修改前后信封对比、App 侧调整点、影响范围和联调验收点。

## 注意

- `lark-cli` 当前版本为 `1.0.48`，命令输出提示可升级到 `1.0.52`。
