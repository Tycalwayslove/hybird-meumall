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
  "[--asset-base-url <local-or-remote-url>]"
]);

function defaultManifest(version) {
  return {
    schemaVersion: "1.0.0",
    appId: "hybrid-h5",
    channel: "stable",
    activeVersion: version,
    rollbackVersion: version,
    rollout: {
      type: "percentage",
      percentage: 0,
      includeUserIds: [],
      excludeUserIds: []
    },
    routes: [],
    cache: {
      maxAgeSeconds: 300,
      staleWhileRevalidateSeconds: 3600
    }
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2), {
    required: ["manifest", "version"],
    optional: ["channel", "rollback-version", "rollout-percentage", "routes", "asset-base-url"]
  });

  const percentage = args["rollout-percentage"] === undefined ? undefined : Number(args["rollout-percentage"]);
  if (percentage !== undefined && (!Number.isInteger(percentage) || percentage < 0 || percentage > 100)) {
    throw new Error("--rollout-percentage 必须是 0 到 100 的整数。");
  }

  const manifestPath = rootPath(args.manifest);
  const manifest = readJson(manifestPath, defaultManifest(args.version));
  manifest.activeVersion = args.version;
  manifest.channel = args.channel || manifest.channel || "stable";
  manifest.rollbackVersion = args["rollback-version"] || manifest.rollbackVersion || args.version;
  if (percentage !== undefined) {
    manifest.rollout = {
      ...(manifest.rollout || {}),
      type: "percentage",
      percentage
    };
  }

  const routes = listFromCsv(args.routes);
  if (routes.length > 0) {
    manifest.routes = routes.map((routePath) => ({
      path: routePath,
      delivery: "remote",
      assetBaseUrl: args["asset-base-url"] || "",
      staticBundleKey: null,
      minAppVersion: {
        ios: "0.0.0",
        android: "0.0.0"
      },
      requiredBridgeCapabilities: []
    }));
  }

  writeJson(manifestPath, manifest);
  console.log(`已更新 ${args.manifest}`);
}

runCli(main, help);
