#!/usr/bin/env node

const path = require("path");
const {
  getGitCommit,
  listFromCsv,
  parseArgs,
  rootPath,
  runCli,
  timestamp,
  usage,
  writeJson,
  writeText
} = require("./_utils.ts");

const help = usage("ai:release-prepare", [
  "--version <version>",
  "--channel <channel>",
  "--rollback-version <version>",
  "[--rollout-percentage <0-100>]",
  "[--routes /a,/b]",
  "[--static-routes /offline]",
  "[--artifact dist/h5.zip]",
  "[--asset-base-url /local/h5/<version>/]",
  "[--output-dir archives/releases/<version>]"
]);

function toRoute(routePath, staticRoutes, assetBaseUrl) {
  const isStatic = staticRoutes.includes(routePath);
  return {
    path: routePath,
    delivery: isStatic ? "static" : "remote",
    assetBaseUrl,
    staticBundleKey: isStatic ? routePath.replace(/^\//, "").replace(/\//g, "-") || "root" : null,
    minAppVersion: {
      ios: "0.0.0",
      android: "0.0.0"
    },
    requiredBridgeCapabilities: []
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2), {
    required: ["version", "channel", "rollback-version"],
    optional: ["rollout-percentage", "routes", "static-routes", "artifact", "asset-base-url", "output-dir"]
  });

  const percentage = args["rollout-percentage"] === undefined ? 0 : Number(args["rollout-percentage"]);
  if (!Number.isInteger(percentage) || percentage < 0 || percentage > 100) {
    throw new Error("--rollout-percentage 必须是 0 到 100 的整数。");
  }

  const routes = listFromCsv(args.routes);
  const staticRoutes = listFromCsv(args["static-routes"]);
  const artifacts = listFromCsv(args.artifact);
  const outputDir = rootPath(args["output-dir"] || path.join("archives/releases", args.version));
  const assetBaseUrl = args["asset-base-url"] || `/local/h5/${args.version}/`;

  const buildJson = {
    version: args.version,
    channel: args.channel,
    buildTime: timestamp(),
    gitCommit: getGitCommit(),
    source: "local",
    artifacts,
    staticRoutes,
    verification: {
      commands: [],
      status: "pending"
    }
  };

  const manifest = {
    schemaVersion: "1.0.0",
    appId: "hybrid-h5",
    channel: args.channel,
    activeVersion: args.version,
    rollbackVersion: args["rollback-version"],
    rollout: {
      type: "percentage",
      percentage,
      includeUserIds: [],
      excludeUserIds: []
    },
    routes: routes.map((routePath) => toRoute(routePath, staticRoutes, assetBaseUrl)),
    cache: {
      maxAgeSeconds: 300,
      staleWhileRevalidateSeconds: 3600
    }
  };

  const releaseNote = `# Release ${args.version}

## 摘要

- 本文件由本地 release-prepare 脚本生成，尚未发布。

## 渠道

- ${args.channel}

## 灰度

- 类型：percentage
- 比例：${percentage}

## 路由

| Route | Delivery | Notes |
| --- | --- | --- |
${manifest.routes.map((route) => `| ${route.path} | ${route.delivery} | ${route.staticBundleKey || ""} |`).join("\n") || "| 无 | 无 | 未配置路由 |"}

## 静态包

${staticRoutes.map((routePath) => `- ${routePath}`).join("\n") || "- 无"}

## Manifest 草案

- manifest.draft.json

## 验证

- pending

## 回滚方案

- 回滚目标：${args["rollback-version"]}

## 风险

- 未接真实 CDN。
- 未发布 manifest。
`;

  writeJson(path.join(outputDir, "build.json"), buildJson);
  writeText(path.join(outputDir, "release-note.md"), releaseNote);
  writeJson(path.join(outputDir, "manifest.draft.json"), manifest);
  console.log(`已生成发布草案：${path.relative(rootPath("."), outputDir)}`);
}

runCli(main, help);
