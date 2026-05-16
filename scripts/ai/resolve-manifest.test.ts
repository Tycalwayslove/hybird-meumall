import { describe, expect, it } from "vitest";
import { resolveManifestRoute } from "./resolve-manifest";

const manifest = {
  stableVersion: "2026.05.15-001",
  grayVersion: "2026.05.15-002",
  rollbackVersion: "2026.05.14-001",
  blacklistVersions: [],
  grayRules: {
    percentage: 0,
    salt: "stable",
    includeUserIds: ["demo-gray"],
    excludeUserIds: []
  },
  assets: {
    serviceBaseUrl: "http://127.0.0.1:3109",
    basePath: "/hybird",
    staticAssetPath: "/_next/static",
    healthCheckPath: "/api/health"
  },
  routes: {
    "/category": {
      delivery: "remote",
      path: "/category"
    }
  }
};

describe("resolve-manifest", () => {
  it("shows gray and stable route resolution", () => {
    expect(
      resolveManifestRoute({
        manifest,
        route: "/category",
        ctx: { userId: "demo-gray" }
      })
    ).toMatchObject({
      ok: true,
      selectedVersion: "2026.05.15-002",
      grayHit: true,
      url: "http://127.0.0.1:3109/hybird/category"
    });

    expect(
      resolveManifestRoute({
        manifest,
        route: "/category",
        ctx: { userId: "demo-stable" }
      })
    ).toMatchObject({
      ok: true,
      selectedVersion: "2026.05.15-001",
      grayHit: false,
      url: "http://127.0.0.1:3109/hybird/category"
    });
  });

  it("falls back when current version is blacklisted", () => {
    expect(
      resolveManifestRoute({
        manifest: {
          ...manifest,
          stableVersion: "2026.05.14-001",
          grayVersion: undefined,
          blacklistVersions: ["2026.05.15-002"]
        },
        route: "/category",
        ctx: { userId: "demo-gray", currentVersion: "2026.05.15-002" }
      })
    ).toMatchObject({
      ok: true,
      selectedVersion: "2026.05.14-001",
      grayHit: false
    });
  });
});
