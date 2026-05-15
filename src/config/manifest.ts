export type H5Platform = "ios" | "android" | "web";

export type GrayRules = {
  includeUserIds?: string[];
  excludeUserIds?: string[];
  percentage?: number;
  salt?: string;
  platforms?: H5Platform[];
  minAppVersion?: string;
  maxAppVersion?: string;
};

export type RootManifest = {
  stableVersion: string;
  grayVersion?: string;
  forceVersion?: string;
  rollbackVersion?: string;
  blacklistVersions?: string[];
  grayRules?: GrayRules;
};

export type ResolveH5VersionContext = {
  userId?: string;
  deviceId?: string;
  platform?: H5Platform;
  appVersion?: string;
  currentVersion?: string;
};

export function resolveH5Version(ctx: ResolveH5VersionContext, manifest: RootManifest): string {
  const blacklist = new Set(manifest.blacklistVersions ?? []);

  if (ctx.currentVersion && blacklist.has(ctx.currentVersion)) {
    return firstNonBlacklisted([manifest.rollbackVersion, manifest.stableVersion], blacklist) ?? manifest.stableVersion;
  }

  const grayVersion = matchesGrayRules(ctx, manifest.grayRules) ? manifest.grayVersion : undefined;
  const candidate = manifest.forceVersion ?? grayVersion ?? manifest.stableVersion;

  if (blacklist.has(candidate)) {
    return firstNonBlacklisted([manifest.rollbackVersion, manifest.stableVersion], blacklist) ?? manifest.stableVersion;
  }

  return candidate;
}

function matchesGrayRules(ctx: ResolveH5VersionContext, rules: GrayRules | undefined): boolean {
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
    return matchesPercentage(ctx, rules.percentage, rules.salt);
  }

  return hasOnlyConstraintRules(rules);
}

function matchesAppVersionRange(appVersion: string | undefined, rules: GrayRules): boolean {
  if (!rules.minAppVersion && !rules.maxAppVersion) {
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

function matchesPercentage(ctx: ResolveH5VersionContext, percentage: number, salt = "default"): boolean {
  const identity = ctx.userId ?? ctx.deviceId;
  if (!identity) {
    return false;
  }

  const boundedPercentage = Math.max(0, Math.min(100, percentage));
  return hashToBucket(`${salt}:${identity}`) < boundedPercentage;
}

function hasOnlyConstraintRules(rules: GrayRules): boolean {
  return Boolean(rules.platforms?.length || rules.minAppVersion || rules.maxAppVersion);
}

function firstNonBlacklisted(versions: Array<string | undefined>, blacklist: Set<string>): string | undefined {
  return versions.find((version) => version && !blacklist.has(version));
}

function hashToBucket(input: string): number {
  let hash = 0;
  for (const char of input) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash % 100;
}

function compareVersions(left: string, right: string): number {
  const leftParts = left.split(".");
  const rightParts = right.split(".");
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const leftPart = Number.parseInt(leftParts[index] ?? "0", 10);
    const rightPart = Number.parseInt(rightParts[index] ?? "0", 10);

    if (Number.isNaN(leftPart) || Number.isNaN(rightPart)) {
      const textCompare = (leftParts[index] ?? "").localeCompare(rightParts[index] ?? "");
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
