#!/usr/bin/env node

const {
  appendSection,
  parseArgs,
  readJson,
  rootPath,
  runCli,
  today,
  usage,
  writeJson
} = require("./_utils.ts");

const help = usage("ai:rollback", [
  "--manifest <path>",
  "--target-version <version>",
  "--reason <reason>",
  "[--note <path>]"
]);

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

function createAssets(options = {}) {
  return {
    serviceBaseUrl: trimTrailingSlash(options.serviceBaseUrl) || "https://h5.example.com",
    basePath: normalizePath(options.basePath, "/hybird"),
    staticAssetPath: "/_next/static",
    healthCheckPath: normalizePath(options.healthCheckPath, "/api/health")
  };
}

function routeRecordFromArray(routes) {
  return routes.reduce((acc, route) => {
    const routePath = route.path;
    if (!routePath) {
      return acc;
    }
    acc[routePath] = {
      delivery: route.delivery || "remote",
      path: routePath,
      minAppVersion: typeof route.minAppVersion === "string" ? route.minAppVersion : "0.0.0",
      requiredBridgeMethods: Array.isArray(route.requiredBridgeMethods)
        ? route.requiredBridgeMethods
        : Array.isArray(route.requiredBridgeCapabilities)
          ? route.requiredBridgeCapabilities
          : []
    };
    if (route.fallbackUrl) {
      acc[routePath].fallbackUrl = route.fallbackUrl;
    }
    return acc;
  }, {});
}

function normalizeManifest(rawManifest, targetVersion) {
  const manifest = {
    schemaVersion: "1.0.0",
    appId: "hybrid-h5",
    configVersion: `config-${targetVersion}`,
    environment: "prod",
    stableVersion: targetVersion,
    rollbackVersion: targetVersion,
    blacklistVersions: [],
    grayRules: {
      percentage: 0,
      salt: "rollback",
      includeUserIds: [],
      excludeUserIds: []
    },
    assets: createAssets(),
    routes: {},
    remoteConfig: {
      appConfigUrl: "/config/app-config.json"
    },
    ...(rawManifest || {})
  };

  manifest.configVersion = manifest.configVersion || `config-${targetVersion}`;
  manifest.environment = manifest.environment || "prod";
  manifest.stableVersion = manifest.stableVersion || manifest.activeVersion || targetVersion;
  manifest.rollbackVersion = manifest.rollbackVersion || targetVersion;
  manifest.blacklistVersions = Array.isArray(manifest.blacklistVersions) ? manifest.blacklistVersions : [];
  manifest.grayRules = {
    percentage: 0,
    salt: "rollback",
    includeUserIds: [],
    excludeUserIds: [],
    ...(manifest.grayRules || {})
  };
  manifest.assets = {
    ...createAssets(),
    ...(manifest.assets || {})
  };
  manifest.routes = Array.isArray(manifest.routes) ? routeRecordFromArray(manifest.routes) : manifest.routes || {};
  manifest.remoteConfig = {
    appConfigUrl: "/config/app-config.json",
    ...(manifest.remoteConfig || {})
  };

  delete manifest.activeVersion;
  delete manifest.channel;
  delete manifest.rollout;
  delete manifest.cache;
  delete manifest.rollback;

  return manifest;
}

function main() {
  const args = parseArgs(process.argv.slice(2), {
    required: ["manifest", "target-version", "reason"],
    optional: ["note"]
  });

  const manifestPath = rootPath(args.manifest);
  const manifest = readJson(manifestPath, null);
  if (!manifest) {
    throw new Error(`未找到 manifest 草案：${args.manifest}`);
  }

  const previousActiveVersion = manifest.forceVersion || manifest.stableVersion || manifest.activeVersion;
  const targetVersion = args["target-version"];
  const nextManifest = normalizeManifest(manifest, targetVersion);
  nextManifest.stableVersion = targetVersion;
  nextManifest.rollbackVersion = targetVersion;
  delete nextManifest.forceVersion;
  delete nextManifest.grayVersion;
  nextManifest.grayRules = {
    ...(nextManifest.grayRules || {}),
    percentage: 0,
    salt: "rollback",
    includeUserIds: [],
    excludeUserIds: []
  };
  if (previousActiveVersion && previousActiveVersion !== targetVersion) {
    nextManifest.blacklistVersions = Array.from(new Set([...(nextManifest.blacklistVersions || []), previousActiveVersion]));
  }

  writeJson(manifestPath, nextManifest);

  if (args.note) {
    appendSection(rootPath(args.note), `## ${today()} - 回滚草案

### 原因

- ${args.reason}

### 版本变化

- 原 stable version：${previousActiveVersion || "unknown"}
- 回滚目标版本：${args["target-version"]}

### 约束

- 仅修改 manifest 草案，未重新构建。`);
  }

  console.log(`已更新回滚草案：${args.manifest}`);
}

runCli(main, help);
