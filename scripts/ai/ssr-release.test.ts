import { describe, expect, it } from "vitest";
import { buildSsrReleasePlan, validatePlan } from "./prepare-ssr-release";
import { evaluateSsrSmokeResult } from "./smoke-ssr-release";

const config = {
  runtime: "node-standalone",
  entry: "package.json",
  standaloneDir: ".",
  staticDir: "src",
  publicDir: "public",
  serviceBaseUrl: "https://h5.example.com",
  basePath: "/hybird",
  healthCheckPath: "/api/health",
  smokeRoutes: ["/", "/category"],
  requiredEnv: ["NODE_ENV", "PORT", "HOSTNAME", "H5_BASE_PATH"],
  cacheControl: {
    html: "private, no-cache, no-store, max-age=0, must-revalidate",
    static: "public, max-age=31536000, immutable",
    manifest: "no-cache, max-age=0, must-revalidate"
  }
};

describe("SSR release operation scripts", () => {
  it("builds a deployable SSR release plan", () => {
    const plan = buildSsrReleasePlan({
      config,
      version: "2026.05.15-001",
      environment: "prod"
    });

    expect(validatePlan(plan)).toEqual([]);
    expect(plan).toMatchObject({
      kind: "ssr-release-plan",
      version: "2026.05.15-001",
      runtime: {
        type: "node-standalone",
        startCommand: "node .next/standalone/server.js"
      },
      service: {
        serviceBaseUrl: "https://h5.example.com",
        basePath: "/hybird",
        healthCheckUrl: "https://h5.example.com/hybird/api/health",
        smokeUrls: ["https://h5.example.com/hybird", "https://h5.example.com/hybird/category"]
      },
      rollback: {
        strategy: "manifest-pointer",
        rebuildRequired: false
      }
    });
  });

  it("flags missing SSR artifacts before deployment", () => {
    const plan = buildSsrReleasePlan({
      config: {
        ...config,
        entry: ".next/not-created/server.js"
      },
      version: "2026.05.15-001",
      environment: "prod"
    });

    expect(validatePlan(plan)).toContain("missing artifact: .next/not-created/server.js");
  });

  it("checks SSR smoke response status and content type", () => {
    expect(
      evaluateSsrSmokeResult({
        kind: "route",
        url: "https://h5.example.com/hybird",
        statusCode: 200,
        headers: {
          "content-type": "text/html; charset=utf-8"
        }
      })
    ).toMatchObject({ ok: true });

    expect(
      evaluateSsrSmokeResult({
        kind: "health",
        url: "https://h5.example.com/hybird/api/health",
        statusCode: 200,
        headers: {
          "content-type": "application/json"
        }
      })
    ).toMatchObject({ ok: true });

    expect(
      evaluateSsrSmokeResult({
        kind: "route",
        url: "https://h5.example.com/hybird",
        statusCode: 500,
        headers: {
          "content-type": "application/json"
        }
      }).issues
    ).toEqual(["statusCode must be 2xx or 3xx, received 500.", "content-type must include text/html."]);
  });
});
