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
  "[--artifact dist/h5.zip]",
  "[--service-base-url https://h5.example.com]",
  "[--base-path /hybird]",
  "[--public-asset-base-url https://cdn.example.com/meumall/h5/<version>]",
  "[--health-check-path /api/health]",
  "[--output-dir archives/releases/<version>]"
]);

function toEnvironment(channel) {
  const environments = {
    dev: "dev",
    qa: "test",
    test: "test",
    staging: "staging",
    beta: "staging",
    stable: "prod",
    prod: "prod",
    rollback: "prod"
  };
  return environments[channel] || "prod";
}

function normalizePath(value, fallback) {
  const raw = String(value || fallback || "").trim();
  if (!raw || raw === "/") {
    return "/";
  }
  return `/${raw.replace(/^\/+|\/+$/g, "")}`;
}

function trimTrailingSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function createAssets(options) {
  const publicAssetBaseUrl = trimTrailingSlash(options.publicAssetBaseUrl);
  const assets = {
    serviceBaseUrl: trimTrailingSlash(options.serviceBaseUrl) || "https://h5.example.com",
    basePath: normalizePath(options.basePath, "/hybird"),
    staticAssetPath: "/_next/static",
    healthCheckPath: normalizePath(options.healthCheckPath, "/api/health")
  };

  if (publicAssetBaseUrl) {
    assets.publicAssetBaseUrl = publicAssetBaseUrl;
  }

  return assets;
}

function createRoutes(routes) {
  return routes.reduce((acc, routePath) => {
    acc[routePath] = {
      delivery: "remote",
      path: routePath,
      minAppVersion: "0.0.0",
      requiredBridgeMethods: []
    };
    return acc;
  }, {});
}

function toRouteRows(routes) {
  const entries = Object.entries(routes);
  if (entries.length === 0) {
    return "| 无 | 无 | 未配置路由 |";
  }
  return entries.map(([routePath, route]) => `| ${routePath} | ${route.delivery} |  |`).join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2), {
    required: ["version", "channel", "rollback-version"],
    optional: [
      "rollout-percentage",
      "routes",
      "artifact",
      "service-base-url",
      "base-path",
      "public-asset-base-url",
      "health-check-path",
      "output-dir"
    ]
  });

  const percentage = args["rollout-percentage"] === undefined ? 0 : Number(args["rollout-percentage"]);
  if (!Number.isInteger(percentage) || percentage < 0 || percentage > 100) {
    throw new Error("--rollout-percentage 必须是 0 到 100 的整数。");
  }

  const routes = listFromCsv(args.routes);
  const artifacts = listFromCsv(args.artifact);
  const outputDir = rootPath(args["output-dir"] || path.join("archives/releases", args.version));
  const routeConfig = createRoutes(routes);
  const isGrayRelease = percentage > 0 && percentage < 100;

  const buildJson = {
    version: args.version,
    channel: args.channel,
    buildTime: timestamp(),
    gitCommit: getGitCommit(),
    source: "local",
    renderMode: "ssr",
    artifacts,
    runtime: {
      output: "standalone",
      entry: ".next/standalone/server.js",
      staticDir: ".next/static",
      publicDir: "public"
    },
    verification: {
      commands: [],
      status: "pending"
    }
  };

  const manifest = {
    schemaVersion: "1.0.0",
    appId: "hybrid-h5",
    configVersion: `config-${args.version}`,
    environment: toEnvironment(args.channel),
    stableVersion: isGrayRelease ? args["rollback-version"] : args.version,
    grayVersion: isGrayRelease ? args.version : undefined,
    rollbackVersion: args["rollback-version"],
    blacklistVersions: [],
    grayRules: {
      percentage: isGrayRelease ? percentage : 0,
      salt: args.channel,
      includeUserIds: [],
      excludeUserIds: []
    },
    assets: createAssets({
      serviceBaseUrl: args["service-base-url"],
      basePath: args["base-path"],
      publicAssetBaseUrl: args["public-asset-base-url"],
      healthCheckPath: args["health-check-path"]
    }),
    routes: routeConfig,
    remoteConfig: {
      appConfigUrl: "/config/app-config.json"
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
${toRouteRows(manifest.routes)}

## SSR 产物

- Runtime：.next/standalone/server.js
- Static：.next/static
- Public：public

## Manifest 草案

- manifest.draft.json

## 验证

- pending

## 回滚方案

- 回滚目标：${args["rollback-version"]}

## 风险

- 未接真实 SSR 部署平台。
- 未发布 manifest。
`;

  writeJson(path.join(outputDir, "build.json"), buildJson);
  writeText(path.join(outputDir, "release-note.md"), releaseNote);
  writeJson(path.join(outputDir, "manifest.draft.json"), manifest);
  console.log(`已生成发布草案：${path.relative(rootPath("."), outputDir)}`);
}

runCli(main, help);
