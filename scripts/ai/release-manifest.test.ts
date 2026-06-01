import fs from "node:fs";
import http from "node:http";
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

function runScriptAsync(script: string, args: string[]) {
  return new Promise<string>((resolve, reject) => {
    childProcess.execFile("node", [path.join(rootDir, script), ...args], {
      cwd: rootDir,
      encoding: "utf8"
    }, (error, stdout, stderr) => {
      if (error) {
        reject(Object.assign(error, { stdout, stderr }));
        return;
      }
      resolve(stdout);
    });
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
      "--public-asset-base-url",
      "https://cdn.example.com/meumall/h5/2026.05.15-001",
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
        publicAssetBaseUrl: "https://cdn.example.com/meumall/h5/2026.05.15-001",
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
      "/hybird",
      "--public-asset-base-url",
      "https://cdn.example.com/meumall/h5/2026.05.15-002"
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
      publicAssetBaseUrl: "https://cdn.example.com/meumall/h5/2026.05.15-002",
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

  it("register-release writes the release registration payload for server-meumall", () => {
    const outDir = tmpDir();
    const output = path.join(outDir, "release-registration.json");

    runScript("scripts/ai/register-release.ts", [
      "--version",
      "2026.05.16-001",
      "--environment",
      "prod",
      "--service-base-url",
      "https://h5.example.com",
      "--base-path",
      "/hybird",
      "--public-asset-base-url",
      "https://cdn.example.com/meumall/h5/2026.05.16-001",
      "--rollback-version",
      "2026.05.15-001",
      "--routes",
      "/,/category,/cart",
      "--rollout-percentage",
      "20",
      "--output",
      output
    ]);

    const payload = JSON.parse(fs.readFileSync(output, "utf8"));

    expect(payload).toMatchObject({
      version: "2026.05.16-001",
      environment: "prod",
      status: "candidate",
      serviceBaseUrl: "https://h5.example.com",
      basePath: "/hybird",
      publicAssetBaseUrl: "https://cdn.example.com/meumall/h5/2026.05.16-001",
      rollbackVersion: "2026.05.15-001",
      rolloutPercentage: 20,
      routes: ["/", "/category", "/cart"],
      buildMeta: {
        renderMode: "ssr",
        runtime: "next-standalone"
      }
    });
  });

  it("register-release posts the payload when execute is enabled", async () => {
    const requests: Array<{ url?: string; method?: string; body: unknown }> = [];
    const server = http.createServer((request, response) => {
      let body = "";
      request.setEncoding("utf8");
      request.on("data", (chunk) => {
        body += chunk;
      });
      request.on("end", () => {
        requests.push({
          url: request.url,
          method: request.method,
          body: JSON.parse(body)
        });
        response.writeHead(201, { "content-type": "application/json" });
        response.end(JSON.stringify({ id: 7, version: "2026.05.16-002", status: "candidate" }));
      });
    });

    await new Promise<void>((resolve) => {
      server.listen(0, "127.0.0.1", resolve);
    });

    try {
      const address = server.address();
      if (!address || typeof address === "string") {
        throw new Error("test server address unavailable");
      }
      const registrationOutput = path.join(tmpDir(), "release-registration.json");

      const output = await runScriptAsync("scripts/ai/register-release.ts", [
        "--version",
        "2026.05.16-002",
        "--environment",
        "prod",
        "--service-base-url",
        "https://h5-green.example.com",
        "--rollback-version",
        "2026.05.15-001",
        "--routes",
        "/,/profile",
        "--server-url",
        `http://127.0.0.1:${address.port}`,
        "--output",
        registrationOutput,
        "--execute"
      ]);

      expect(output).toContain("已注册 release");
      expect(requests).toHaveLength(1);
      expect(requests[0]).toMatchObject({
        url: "/api/releases",
        method: "POST",
        body: {
          version: "2026.05.16-002",
          environment: "prod",
          serviceBaseUrl: "https://h5-green.example.com",
          routes: ["/", "/profile"]
        }
      });
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });
});
