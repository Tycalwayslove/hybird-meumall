import { describe, expect, it } from "vitest";
import { createManifestRuntime, type ManifestStorageAdapter } from "./index";
import type { ManifestFile } from "@/config/remote-config";

const validManifest: ManifestFile = {
  schemaVersion: "1.0.0",
  appId: "hybrid-h5",
  configVersion: "config-v1",
  environment: "prod",
  stableVersion: "2026.05.14-001",
  grayVersion: "2026.05.14-002",
  rollbackVersion: "2026.05.13-003",
  grayRules: {
    includeUserIds: ["gray-user"]
  },
  assets: {
    serviceBaseUrl: "https://h5.example.com",
    basePath: "/hybird",
    staticAssetPath: "/_next/static",
    healthCheckPath: "/api/health"
  },
  routes: {
    "/": {
      delivery: "remote",
      path: "/home"
    },
    "/offline": {
      delivery: "local",
      path: "/static/fallback/offline.html",
      fallbackUrl: "app://fallback/offline.html"
    }
  },
  remoteConfig: {
    appConfigUrl: "/config/app-config.json"
  }
};

function createMemoryStorage(initial?: string): ManifestStorageAdapter & { value: string | null } {
  return {
    value: initial ?? null,
    getItem() {
      return this.value;
    },
    setItem(_key, value) {
      this.value = value;
    }
  };
}

describe("manifest runtime", () => {
  it("fetches and validates manifest, resolves selected version, builds remote route, and caches last-known-good", async () => {
    const storage = createMemoryStorage();
    const runtime = createManifestRuntime({
      fetchManifest: async () => validManifest,
      storage
    });

    const result = await runtime.loadRoute("/", {
      userId: "gray-user",
      platform: "ios"
    });

    expect(result).toMatchObject({
      ok: true,
      kind: "remote",
      route: "/",
      version: "2026.05.14-002",
      url: "https://h5.example.com/hybird/home",
      manifestSource: "network"
    });
    expect(storage.value).toBe(JSON.stringify(validManifest));
  });

  it("uses a valid cached manifest when fetching fails", async () => {
    const storage = createMemoryStorage(JSON.stringify(validManifest));
    const runtime = createManifestRuntime({
      fetchManifest: async () => {
        throw new Error("network down");
      },
      storage
    });

    const result = await runtime.loadRoute("/offline", {});

    expect(result).toEqual({
      ok: true,
      kind: "local",
      route: "/offline",
      version: "2026.05.14-001",
      path: "/static/fallback/offline.html",
      fallbackUrl: "app://fallback/offline.html",
      manifestSource: "cache"
    });
  });

  it("uses a valid cached manifest when fetched manifest is invalid", async () => {
    const storage = createMemoryStorage(JSON.stringify(validManifest));
    const runtime = createManifestRuntime({
      fetchManifest: async () => ({ schemaVersion: "1.0.0" }),
      storage
    });

    const result = await runtime.loadRoute("/", {});

    expect(result).toMatchObject({
      ok: true,
      kind: "remote",
      route: "/",
      version: "2026.05.14-001",
      url: "https://h5.example.com/hybird/home",
      manifestSource: "cache"
    });
  });

  it("returns an error when neither fetched nor cached manifest is usable", async () => {
    const storage = createMemoryStorage(JSON.stringify({ stableVersion: "" }));
    const runtime = createManifestRuntime({
      fetchManifest: async () => ({ broken: true }),
      storage
    });

    const result = await runtime.loadRoute("/", {});

    expect(result.ok).toBe(false);
    expect(result.kind).toBe("error");
    if (result.kind !== "error") {
      throw new Error(`Expected manifest error result, received ${result.kind}`);
    }
    expect(result.reason).toBe("manifest-unavailable");
  });

  it("returns configured route fallback when requested route is missing and fallbackRoute is available", async () => {
    const runtime = createManifestRuntime({
      fetchManifest: async () => validManifest,
      storage: createMemoryStorage(),
      fallbackRoute: "/offline"
    });

    const result = await runtime.loadRoute("/missing", {});

    expect(result).toEqual({
      ok: true,
      kind: "local",
      route: "/offline",
      requestedRoute: "/missing",
      version: "2026.05.14-001",
      path: "/static/fallback/offline.html",
      fallbackUrl: "app://fallback/offline.html",
      manifestSource: "network"
    });
  });

  it("returns not-found when requested route and configured fallback are missing", async () => {
    const runtime = createManifestRuntime({
      fetchManifest: async () => validManifest,
      storage: createMemoryStorage()
    });

    const result = await runtime.loadRoute("/missing", {});

    expect(result).toEqual({
      ok: false,
      kind: "not-found",
      route: "/missing",
      manifestSource: "network"
    });
  });
});
