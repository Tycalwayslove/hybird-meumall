#!/usr/bin/env node

const {
  listFromCsv,
  parseArgs,
  readJson,
  rootPath,
  runCli,
  usage,
  writeJson
} = require("./_utils.ts");

const help = usage("ai:update-manifest", [
  "--manifest <path>",
  "--version <version>",
  "[--channel <channel>]",
  "[--rollback-version <version>]",
  "[--rollout-percentage <0-100>]",
  "[--routes /a,/b]",
  "[--service-base-url https://h5.example.com]",
  "[--base-path /hybird]",
  "[--health-check-path /api/health]"
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

function defaultManifest(version, channel, assetOptions) {
  return {
    schemaVersion: "1.0.0",
    appId: "hybrid-h5",
    configVersion: `config-${version}`,
    environment: toEnvironment(channel || "stable"),
    stableVersion: version,
    rollbackVersion: version,
    blacklistVersions: [],
    grayRules: {
      percentage: 0,
      salt: channel || "stable",
      includeUserIds: [],
      excludeUserIds: []
    },
    assets: createAssets(assetOptions),
    routes: {},
    remoteConfig: {
      appConfigUrl: "/config/app-config.json"
    }
  };
}

function normalizeManifest(rawManifest, version, channel, assetOptions) {
  const fallback = defaultManifest(version, channel, assetOptions);
  const manifest = {
    ...fallback,
    ...(rawManifest || {})
  };

  manifest.configVersion = manifest.configVersion || fallback.configVersion;
  manifest.environment = channel ? toEnvironment(channel) : manifest.environment || fallback.environment;
  manifest.stableVersion = manifest.stableVersion || manifest.activeVersion || version;
  manifest.rollbackVersion = manifest.rollbackVersion || version;
  manifest.blacklistVersions = Array.isArray(manifest.blacklistVersions) ? manifest.blacklistVersions : [];
  manifest.grayRules = {
    ...(fallback.grayRules || {}),
    ...(manifest.grayRules || {})
  };
  if (manifest.rollout) {
    manifest.grayRules.percentage =
      typeof manifest.rollout.percentage === "number" ? manifest.rollout.percentage : manifest.grayRules.percentage;
    manifest.grayRules.includeUserIds = manifest.rollout.includeUserIds || manifest.grayRules.includeUserIds || [];
    manifest.grayRules.excludeUserIds = manifest.rollout.excludeUserIds || manifest.grayRules.excludeUserIds || [];
  }
  manifest.assets = {
    ...fallback.assets,
    ...(manifest.assets || {})
  };
  if (assetOptions.serviceBaseUrl || assetOptions.basePath || assetOptions.healthCheckPath) {
    manifest.assets = createAssets({
      ...manifest.assets,
      ...assetOptions
    });
  }
  manifest.routes = Array.isArray(manifest.routes) ? routeRecordFromArray(manifest.routes) : manifest.routes || {};
  manifest.remoteConfig = {
    ...(fallback.remoteConfig || {}),
    ...(manifest.remoteConfig || {})
  };

  delete manifest.activeVersion;
  delete manifest.channel;
  delete manifest.rollout;
  delete manifest.cache;

  return manifest;
}

function main() {
  const args = parseArgs(process.argv.slice(2), {
    required: ["manifest", "version"],
    optional: [
      "channel",
      "rollback-version",
      "rollout-percentage",
      "routes",
      "service-base-url",
      "base-path",
      "health-check-path"
    ]
  });

  const percentage = args["rollout-percentage"] === undefined ? undefined : Number(args["rollout-percentage"]);
  if (percentage !== undefined && (!Number.isInteger(percentage) || percentage < 0 || percentage > 100)) {
    throw new Error("--rollout-percentage 必须是 0 到 100 的整数。");
  }

  const manifestPath = rootPath(args.manifest);
  const manifest = normalizeManifest(
    readJson(manifestPath, null),
    args.version,
    args.channel,
    {
      serviceBaseUrl: args["service-base-url"],
      basePath: args["base-path"],
      healthCheckPath: args["health-check-path"]
    }
  );
  const isGrayRelease = percentage !== undefined && percentage > 0 && percentage < 100;
  const previousStableVersion =
    manifest.stableVersion && manifest.stableVersion !== args.version
      ? manifest.stableVersion
      : args["rollback-version"] || manifest.rollbackVersion || args.version;
  manifest.stableVersion = isGrayRelease ? previousStableVersion : args.version;
  manifest.rollbackVersion = args["rollback-version"] || manifest.rollbackVersion || args.version;
  if (percentage !== undefined) {
    manifest.grayRules = {
      ...(manifest.grayRules || {}),
      percentage: isGrayRelease ? percentage : 0
    };
    if (isGrayRelease) {
      manifest.grayVersion = args.version;
    } else {
      delete manifest.grayVersion;
    }
  }

  const routes = listFromCsv(args.routes);
  if (routes.length > 0) {
    manifest.routes = routes.reduce((acc, routePath) => {
      acc[routePath] = {
        delivery: "remote",
        path: routePath,
        minAppVersion: "0.0.0",
        requiredBridgeMethods: []
      };
      return acc;
    }, {});
  }

  writeJson(manifestPath, manifest);
  console.log(`已更新 ${args.manifest}`);
}

runCli(main, help);
