import type { BridgeMethod } from "@/lib/bridge";
import type { GrayRules, RootManifest } from "./manifest";

export type RuntimeEnvironment = "local" | "dev" | "test" | "staging" | "prod";
export type RouteDelivery = "remote" | "local";

export type ConfigValidationError = {
  issues: string[];
};

export type ConfigValidationResult<T> = { ok: true; data: T } | { ok: false; error: ConfigValidationError };

export type RouteDeliveryConfig = {
  delivery: RouteDelivery;
  path: string;
  minAppVersion?: string;
  requiredBridgeMethods?: BridgeMethod[];
  fallbackUrl?: string;
};

export type ManifestAssetsConfig = {
  serviceBaseUrl: string;
  basePath: string;
  staticAssetPath: string;
  healthCheckPath: string;
};

export type RemoteConfigRefs = {
  appConfigUrl: string;
  themeConfigUrl?: string;
};

export type ManifestFile = RootManifest & {
  schemaVersion: string;
  appId: string;
  configVersion: string;
  environment: RuntimeEnvironment;
  assets: ManifestAssetsConfig;
  routes: Record<string, RouteDeliveryConfig>;
  remoteConfig: RemoteConfigRefs;
};

export type AppConfigFile = {
  configVersion: string;
  environment: RuntimeEnvironment;
  minAppVersion: string;
  minH5Version: string;
  publicApiBaseUrl: string;
  featureFlags: Record<string, boolean>;
  pageEntries?: Record<string, string>;
};

export type ThemeConfigFile = {
  configVersion: string;
  name: string;
  mode: "light" | "dark";
  variables: Record<string, string>;
};

const environments = new Set<RuntimeEnvironment>(["local", "dev", "test", "staging", "prod"]);
const routeDeliveries = new Set<RouteDelivery>(["remote", "local"]);
const themeModes = new Set(["light", "dark"]);
const sensitiveKeyPattern = /(secret|password|private|token|credential|apikey|apiKey)/i;

export function validateManifestFile(input: unknown): ConfigValidationResult<ManifestFile> {
  const issues: string[] = [];
  const manifest = asRecord(input);

  requireString(manifest, "schemaVersion", issues);
  requireString(manifest, "appId", issues);
  requireString(manifest, "configVersion", issues);
  requireEnvironment(manifest, "environment", issues);
  requireString(manifest, "stableVersion", issues);

  optionalString(manifest, "grayVersion", issues);
  optionalString(manifest, "forceVersion", issues);
  optionalString(manifest, "rollbackVersion", issues);
  validateStringArray(manifest.blacklistVersions, "blacklistVersions", issues, false);
  validateGrayRules(manifest.grayRules, issues);
  validateAssets(manifest.assets, issues);
  validateRoutes(manifest.routes, issues);
  validateRemoteConfigRefs(manifest.remoteConfig, issues);

  if (
    typeof manifest.rollbackVersion === "string" &&
    Array.isArray(manifest.blacklistVersions) &&
    manifest.blacklistVersions.includes(manifest.rollbackVersion)
  ) {
    issues.push("rollbackVersion must not be blacklisted.");
  }

  return issues.length > 0 ? { ok: false, error: { issues } } : { ok: true, data: input as ManifestFile };
}

export function validateAppConfigFile(input: unknown): ConfigValidationResult<AppConfigFile> {
  const issues: string[] = [];
  const config = asRecord(input);

  requireString(config, "configVersion", issues);
  requireEnvironment(config, "environment", issues);
  requireString(config, "minAppVersion", issues);
  requireString(config, "minH5Version", issues);
  requireString(config, "publicApiBaseUrl", issues);
  validateBooleanRecord(config.featureFlags, "featureFlags", issues);
  validateOptionalStringRecord(config.pageEntries, "pageEntries", issues);
  validateNoSensitiveKeys(config, issues);

  return issues.length > 0 ? { ok: false, error: { issues } } : { ok: true, data: input as AppConfigFile };
}

export function validateThemeConfigFile(input: unknown): ConfigValidationResult<ThemeConfigFile> {
  const issues: string[] = [];
  const config = asRecord(input);

  requireString(config, "configVersion", issues);
  requireString(config, "name", issues);
  if (typeof config.mode !== "string" || !themeModes.has(config.mode)) {
    issues.push("mode must be light or dark.");
  }
  validateStringRecord(config.variables, "variables", issues);

  return issues.length > 0 ? { ok: false, error: { issues } } : { ok: true, data: input as ThemeConfigFile };
}

function validateGrayRules(value: unknown, issues: string[]): void {
  if (value === undefined) {
    return;
  }
  const rules = asRecord(value) as Partial<GrayRules>;
  validateStringArray(rules.includeUserIds, "grayRules.includeUserIds", issues, false);
  validateStringArray(rules.excludeUserIds, "grayRules.excludeUserIds", issues, false);
  validateStringArray(rules.platforms, "grayRules.platforms", issues, false);
  optionalString(rules, "salt", issues, "grayRules.salt");
  optionalString(rules, "minAppVersion", issues, "grayRules.minAppVersion");
  optionalString(rules, "maxAppVersion", issues, "grayRules.maxAppVersion");

  if (rules.percentage !== undefined) {
    if (typeof rules.percentage !== "number" || rules.percentage < 0 || rules.percentage > 100) {
      issues.push("grayRules.percentage must be between 0 and 100.");
    }
  }
}

function validateAssets(value: unknown, issues: string[]): void {
  const assets = asRecord(value);
  requireString(assets, "serviceBaseUrl", issues, "assets.serviceBaseUrl");
  requireString(assets, "basePath", issues, "assets.basePath");
  requireString(assets, "staticAssetPath", issues, "assets.staticAssetPath");
  requireString(assets, "healthCheckPath", issues, "assets.healthCheckPath");
}

function validateRoutes(value: unknown, issues: string[]): void {
  const routes = asRecord(value);
  for (const [route, rawConfig] of Object.entries(routes)) {
    const config = asRecord(rawConfig);
    if (typeof config.delivery !== "string" || !routeDeliveries.has(config.delivery as RouteDelivery)) {
      issues.push(`routes.${route}.delivery must be remote or local.`);
    }
    requireString(config, "path", issues, `routes.${route}.path`);
    optionalString(config, "minAppVersion", issues, `routes.${route}.minAppVersion`);
    optionalString(config, "fallbackUrl", issues, `routes.${route}.fallbackUrl`);
    validateStringArray(config.requiredBridgeMethods, `routes.${route}.requiredBridgeMethods`, issues, false);
  }
}

function validateRemoteConfigRefs(value: unknown, issues: string[]): void {
  const refs = asRecord(value);
  requireString(refs, "appConfigUrl", issues, "remoteConfig.appConfigUrl");
  optionalString(refs, "themeConfigUrl", issues, "remoteConfig.themeConfigUrl");
}

function validateNoSensitiveKeys(value: Record<string, unknown>, issues: string[], path = ""): void {
  for (const [key, nested] of Object.entries(value)) {
    const fullPath = path ? `${path}.${key}` : key;
    if (sensitiveKeyPattern.test(key)) {
      issues.push(`${fullPath} must not contain sensitive client-visible data.`);
    }
    if (isPlainRecord(nested)) {
      validateNoSensitiveKeys(nested, issues, fullPath);
    }
  }
}

function requireEnvironment(record: Record<string, unknown>, key: string, issues: string[]): void {
  if (typeof record[key] !== "string" || !environments.has(record[key] as RuntimeEnvironment)) {
    issues.push(`${key} must be one of local, dev, test, staging, prod.`);
  }
}

function requireString(
  record: Record<string, unknown>,
  key: string,
  issues: string[],
  label = key
): void {
  if (typeof record[key] !== "string" || record[key].trim() === "") {
    issues.push(`${label} must be a non-empty string.`);
  }
}

function optionalString(
  record: Record<string, unknown>,
  key: string,
  issues: string[],
  label = key
): void {
  if (record[key] !== undefined && typeof record[key] !== "string") {
    issues.push(`${label} must be a string.`);
  }
}

function validateStringArray(value: unknown, label: string, issues: string[], required: boolean): void {
  if (value === undefined && !required) {
    return;
  }
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || item.trim() === "")) {
    issues.push(`${label} must be an array of non-empty strings.`);
  }
}

function validateBooleanRecord(value: unknown, label: string, issues: string[]): void {
  const record = asRecord(value);
  for (const [key, nested] of Object.entries(record)) {
    if (typeof nested !== "boolean") {
      issues.push(`${label}.${key} must be a boolean.`);
    }
  }
}

function validateOptionalStringRecord(value: unknown, label: string, issues: string[]): void {
  if (value === undefined) {
    return;
  }
  validateStringRecord(value, label, issues);
}

function validateStringRecord(value: unknown, label: string, issues: string[]): void {
  const record = asRecord(value);
  for (const [key, nested] of Object.entries(record)) {
    if (typeof nested !== "string" || nested.trim() === "") {
      issues.push(`${label}.${key} must be a non-empty string.`);
    }
  }
}

function asRecord(value: unknown): Record<string, unknown> {
  return isPlainRecord(value) ? value : {};
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
