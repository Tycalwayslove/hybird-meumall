import { describe, expect, it } from "vitest";
import {
  validateAppConfigFile,
  validateManifestFile,
  validateThemeConfigFile,
  type AppConfigFile,
  type ManifestFile,
  type ThemeConfigFile
} from "./remote-config";

const validManifest: ManifestFile = {
  schemaVersion: "1.0.0",
  appId: "hybrid-h5",
  configVersion: "config-v1",
  environment: "prod",
  stableVersion: "2026.05.14-001",
  grayVersion: "2026.05.14-002",
  rollbackVersion: "2026.05.13-003",
  blacklistVersions: ["2026.05.12-001"],
  grayRules: {
    percentage: 10,
    salt: "prod",
    includeUserIds: ["u1"]
  },
  assets: {
    cdnBaseUrl: "https://cdn.example.com/h5/prod",
    immutablePathPattern: "/h5/prod/{version}/",
    latestPath: "/h5/prod/latest/"
  },
  routes: {
    "/home": {
      delivery: "remote",
      path: "/home",
      minAppVersion: "1.0.0",
      requiredBridgeMethods: ["app.getVersion"]
    },
    "/offline": {
      delivery: "local",
      path: "/offline",
      fallbackUrl: "https://cdn.example.com/h5/prod/latest/offline"
    }
  },
  remoteConfig: {
    appConfigUrl: "/config/app-config.json",
    themeConfigUrl: "/theme/theme-light.json"
  }
};

describe("remote config schema", () => {
  it("accepts a valid manifest file", () => {
    expect(validateManifestFile(validManifest)).toEqual({ ok: true, data: validManifest });
  });

  it("rejects a manifest missing stableVersion", () => {
    const manifest = { ...validManifest };
    Reflect.deleteProperty(manifest, "stableVersion");

    const result = validateManifestFile(manifest);

    expect(result.ok).toBe(false);
    expect(result.ok ? undefined : result.error.issues).toContain("stableVersion must be a non-empty string.");
  });

  it("rejects a manifest when rollbackVersion is blacklisted", () => {
    const result = validateManifestFile({
      ...validManifest,
      blacklistVersions: ["2026.05.13-003"]
    });

    expect(result.ok).toBe(false);
    expect(result.ok ? undefined : result.error.issues).toContain("rollbackVersion must not be blacklisted.");
  });

  it("rejects invalid gray rollout percentage", () => {
    const result = validateManifestFile({
      ...validManifest,
      grayRules: {
        percentage: 120
      }
    });

    expect(result.ok).toBe(false);
    expect(result.ok ? undefined : result.error.issues).toContain("grayRules.percentage must be between 0 and 100.");
  });

  it("rejects route delivery values outside remote or local", () => {
    const result = validateManifestFile({
      ...validManifest,
      routes: {
        "/broken": {
          delivery: "embedded",
          path: "/broken"
        }
      }
    });

    expect(result.ok).toBe(false);
    expect(result.ok ? undefined : result.error.issues).toContain("routes./broken.delivery must be remote or local.");
  });

  it("accepts public app config and rejects sensitive keys", () => {
    const appConfig: AppConfigFile = {
      configVersion: "config-v1",
      environment: "prod",
      minAppVersion: "1.0.0",
      minH5Version: "2026.05.14-001",
      publicApiBaseUrl: "https://api.example.com",
      featureFlags: {
        membership: true
      }
    };

    expect(validateAppConfigFile(appConfig)).toEqual({ ok: true, data: appConfig });
    expect(validateAppConfigFile({ ...appConfig, apiSecret: "nope" }).ok).toBe(false);
  });

  it("accepts light and dark theme config files", () => {
    const themeConfig: ThemeConfigFile = {
      configVersion: "theme-v1",
      name: "default-dark",
      mode: "dark",
      variables: {
        "--color-bg": "17 24 39",
        "--color-fg": "255 255 255"
      }
    };

    expect(validateThemeConfigFile(themeConfig)).toEqual({ ok: true, data: themeConfig });
    expect(validateThemeConfigFile({ ...themeConfig, mode: "luxury" }).ok).toBe(false);
  });
});
