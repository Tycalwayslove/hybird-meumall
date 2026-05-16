#!/usr/bin/env node

const { parseArgs, readJson, rootPath, runCli, usage } = require("./_utils.ts");

const help = usage("ai:resolve-manifest", [
  "--manifest <path>",
  "[--route /]",
  "[--user-id <id>]",
  "[--device-id <id>]",
  "[--platform ios|android|web]",
  "[--app-version <version>]",
  "[--current-version <version>]",
  "[--json]"
]);

function compareVersions(left, right) {
  const leftParts = String(left).split(".");
  const rightParts = String(right).split(".");
  const length = Math.max(leftParts.length, rightParts.length);
  for (let index = 0; index < length; index += 1) {
    const leftPart = Number.parseInt(leftParts[index] || "0", 10);
    const rightPart = Number.parseInt(rightParts[index] || "0", 10);
    if (Number.isNaN(leftPart) || Number.isNaN(rightPart)) {
      const textCompare = (leftParts[index] || "").localeCompare(rightParts[index] || "");
      if (textCompare !== 0) {
        return textCompare;
      }
      continue;
    }
    if (leftPart !== rightPart) {
      return leftPart - rightPart;
    }
  }
  return 0;
}

function hashToBucket(input) {
  let hash = 0;
  for (const char of input) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash % 100;
}

function matchesAppVersionRange(appVersion, rules) {
  if (!rules?.minAppVersion && !rules?.maxAppVersion) {
    return true;
  }
  if (!appVersion) {
    return false;
  }
  if (rules.minAppVersion && compareVersions(appVersion, rules.minAppVersion) < 0) {
    return false;
  }
  if (rules.maxAppVersion && compareVersions(appVersion, rules.maxAppVersion) > 0) {
    return false;
  }
  return true;
}

function matchesGrayRules(ctx, rules) {
  if (!rules || Object.keys(rules).length === 0) {
    return false;
  }
  if (ctx.userId && rules.excludeUserIds?.includes(ctx.userId)) {
    return false;
  }
  if (rules.platforms && (!ctx.platform || !rules.platforms.includes(ctx.platform))) {
    return false;
  }
  if (!matchesAppVersionRange(ctx.appVersion, rules)) {
    return false;
  }
  if (ctx.userId && rules.includeUserIds?.includes(ctx.userId)) {
    return true;
  }
  if (typeof rules.percentage === "number") {
    const identity = ctx.userId || ctx.deviceId;
    if (!identity) {
      return false;
    }
    return hashToBucket(`${rules.salt || "default"}:${identity}`) < Math.max(0, Math.min(100, rules.percentage));
  }
  return Boolean(rules.platforms?.length || rules.minAppVersion || rules.maxAppVersion);
}

function firstNonBlacklisted(versions, blacklist) {
  return versions.find((version) => version && !blacklist.has(version));
}

function resolveH5Version(ctx, manifest) {
  const blacklist = new Set(manifest.blacklistVersions || []);
  if (ctx.currentVersion && blacklist.has(ctx.currentVersion)) {
    return firstNonBlacklisted([manifest.rollbackVersion, manifest.stableVersion], blacklist) || manifest.stableVersion;
  }
  const grayVersion = matchesGrayRules(ctx, manifest.grayRules) ? manifest.grayVersion : undefined;
  const candidate = manifest.forceVersion || grayVersion || manifest.stableVersion;
  if (blacklist.has(candidate)) {
    return firstNonBlacklisted([manifest.rollbackVersion, manifest.stableVersion], blacklist) || manifest.stableVersion;
  }
  return candidate;
}

function joinUrl(...parts) {
  const [firstPart, ...restParts] = parts;
  return [
    String(firstPart || "").replace(/\/+$/g, ""),
    ...restParts.map((part) => String(part || "").replace(/^\/+|\/+$/g, "")).filter(Boolean)
  ].join("/");
}

function resolveManifestRoute({ manifest, route, ctx }) {
  const routeConfig = manifest.routes?.[route];
  if (!routeConfig) {
    return {
      ok: false,
      route,
      reason: "route-not-found"
    };
  }
  const selectedVersion = resolveH5Version(ctx, manifest);
  const grayHit = selectedVersion === manifest.grayVersion;
  return {
    ok: true,
    route,
    delivery: routeConfig.delivery,
    selectedVersion,
    stableVersion: manifest.stableVersion,
    grayVersion: manifest.grayVersion,
    rollbackVersion: manifest.rollbackVersion,
    grayHit,
    blacklisted: (manifest.blacklistVersions || []).includes(selectedVersion),
    url:
      routeConfig.delivery === "remote"
        ? joinUrl(manifest.assets.serviceBaseUrl, manifest.assets.basePath, routeConfig.path)
        : routeConfig.path
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2), {
    required: ["manifest"],
    optional: ["route", "user-id", "device-id", "platform", "app-version", "current-version"],
    boolean: ["json"]
  });
  const manifest = readJson(rootPath(args.manifest));
  const result = resolveManifestRoute({
    manifest,
    route: args.route || "/",
    ctx: {
      userId: args["user-id"],
      deviceId: args["device-id"],
      platform: args.platform,
      appVersion: args["app-version"],
      currentVersion: args["current-version"]
    }
  });
  if (args.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  if (!result.ok) {
    console.log(`未命中路由：${result.route}`);
    return;
  }
  console.log(`路由：${result.route}`);
  console.log(`命中版本：${result.selectedVersion}`);
  console.log(`稳定版本：${result.stableVersion}`);
  console.log(`灰度版本：${result.grayVersion || "无"}`);
  console.log(`回滚版本：${result.rollbackVersion || "无"}`);
  console.log(`是否命中灰度：${result.grayHit ? "是" : "否"}`);
  console.log(`加载地址：${result.url}`);
}

if (require.main === module) {
  runCli(main, help);
}

module.exports = {
  resolveManifestRoute
};
