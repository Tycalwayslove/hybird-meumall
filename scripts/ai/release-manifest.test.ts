import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import childProcess from "node:child_process";
import { describe, expect, it } from "vitest";
import { validateManifestFile, type ManifestFile } from "../../src/config/remote-config";

const rootDir = path.resolve(__dirname, "../..");

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "hybird-release-manifest-"));
}

function runScript(script: string, args: string[]) {
  return childProcess.execFileSync("node", [path.join(rootDir, script), ...args], {
    cwd: rootDir,
    encoding: "utf8"
  });
}

function readManifest(filePath: string): ManifestFile {
  const manifest = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const result = validateManifestFile(manifest);

  expect(result.ok ? [] : result.error.issues).toEqual([]);
  expect(manifest).not.toHaveProperty("activeVersion");
  expect(manifest).not.toHaveProperty("rollout");
  expect(Array.isArray(manifest.routes)).toBe(false);

  return manifest;
}

describe("release manifest scripts", () => {
  it("release-prepare writes a ManifestFile draft", () => {
    const outDir = tmpDir();

    runScript("scripts/ai/release-prepare.ts", [
      "--version",
      "2026.05.15-001",
      "--channel",
      "stable",
      "--rollback-version",
      "2026.05.14-001",
      "--rollout-percentage",
      "15",
      "--routes",
      "/,/cart,/profile",
      "--service-base-url",
      "https://h5.example.com",
      "--base-path",
      "/hybird",
      "--output-dir",
      outDir
    ]);

    const manifest = readManifest(path.join(outDir, "manifest.draft.json"));

    expect(manifest).toMatchObject({
      schemaVersion: "1.0.0",
      appId: "hybrid-h5",
      configVersion: "config-2026.05.15-001",
      environment: "prod",
      stableVersion: "2026.05.14-001",
      grayVersion: "2026.05.15-001",
      rollbackVersion: "2026.05.14-001",
      grayRules: {
        percentage: 15,
        salt: "stable"
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
          path: "/"
        },
        "/profile": {
          delivery: "remote",
          path: "/profile"
        }
      },
      remoteConfig: {
        appConfigUrl: "/config/app-config.json"
      }
    });
  });

  it("update-manifest writes route and asset updates into the ManifestFile shape", () => {
    const outDir = tmpDir();
    const manifestPath = path.join(outDir, "manifest.json");

    runScript("scripts/ai/update-manifest.ts", [
      "--manifest",
      manifestPath,
      "--version",
      "2026.05.15-002",
      "--channel",
      "qa",
      "--rollback-version",
      "2026.05.15-001",
      "--rollout-percentage",
      "25",
      "--routes",
      "/,/category",
      "--service-base-url",
      "https://h5-test.example.com",
      "--base-path",
      "/hybird"
    ]);

    const manifest = readManifest(manifestPath);

    expect(manifest.stableVersion).toBe("2026.05.15-001");
    expect(manifest.environment).toBe("test");
    expect(manifest.rollbackVersion).toBe("2026.05.15-001");
    expect(manifest.grayVersion).toBe("2026.05.15-002");
    expect(manifest.grayRules?.percentage).toBe(25);
    expect(manifest.assets).toMatchObject({
      serviceBaseUrl: "https://h5-test.example.com",
      basePath: "/hybird",
      staticAssetPath: "/_next/static",
      healthCheckPath: "/api/health"
    });
    expect(manifest.routes).toEqual({
      "/": {
        delivery: "remote",
        path: "/",
        minAppVersion: "0.0.0",
        requiredBridgeMethods: []
      },
      "/category": {
        delivery: "remote",
        path: "/category",
        minAppVersion: "0.0.0",
        requiredBridgeMethods: []
      }
    });
  });

  it("rollback changes ManifestFile versions without reintroducing legacy fields", () => {
    const outDir = tmpDir();
    const manifestPath = path.join(outDir, "manifest.json");
    fs.writeFileSync(
      manifestPath,
      `${JSON.stringify(
        {
          schemaVersion: "1.0.0",
          appId: "hybrid-h5",
          configVersion: "config-2026.05.15-003",
          environment: "prod",
          stableVersion: "2026.05.15-003",
          grayVersion: "2026.05.15-004",
          rollbackVersion: "2026.05.15-001",
          blacklistVersions: [],
          grayRules: {
            percentage: 50,
            salt: "stable"
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
              path: "/"
            }
          },
          remoteConfig: {
            appConfigUrl: "/config/app-config.json"
          }
        },
        null,
        2
      )}\n`
    );

    runScript("scripts/ai/rollback.ts", [
      "--manifest",
      manifestPath,
      "--target-version",
      "2026.05.15-001",
      "--reason",
      "smoke failed"
    ]);

    const manifest = readManifest(manifestPath);

    expect(manifest.stableVersion).toBe("2026.05.15-001");
    expect(manifest.rollbackVersion).toBe("2026.05.15-001");
    expect(manifest.grayVersion).toBeUndefined();
    expect(manifest.grayRules?.percentage).toBe(0);
    expect(manifest.blacklistVersions).toContain("2026.05.15-003");
  });
});
