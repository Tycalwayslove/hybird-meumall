import { describe, expect, test, vi } from "vitest";
import { createBffRequestContext, createConsoleBackendCallLogger } from "./bff-context";

describe("bff context", () => {
  test("reads auth and client context from incoming request", () => {
    const request = new Request("https://m.example.com/api/bff/user/profile", {
      headers: {
        cookie: "mallToken=mall-token; pythonToken=python-token; statusHeight=44",
        "user-agent": "Mozilla/5.0 MeuMall/1.0.0",
        "x-app-version": "1.0.0",
        "x-device-model": "iPhone16,2",
        "x-platform": "ios"
      }
    });

    const context = createBffRequestContext(request, {
      registryEnv: {
        APP_ENV: "test",
        JAVA_API_BASE_URL: "https://java-test.example.com",
        PYTHON_API_BASE_URL: "https://python-test.example.com"
      },
      requestIdFactory: () => "req-bff"
    });

    expect(context.auth.mallToken).toBe("mall-token");
    expect(context.auth.pythonToken).toBe("python-token");
    expect(context.clientContext).toEqual({
      appBuild: undefined,
      appName: undefined,
      appVersion: "1.0.0",
      deviceModel: "iPhone16,2",
      h5Route: undefined,
      h5Version: undefined,
      osVersion: undefined,
      pageSessionId: undefined,
      platform: "ios",
      userAgent: "Mozilla/5.0 MeuMall/1.0.0",
      webviewVersion: undefined
    });
    expect(context.getAuthToken("java")).toBe("mall-token");
    expect(context.getAuthToken("python")).toBe("python-token");
  });

  test("creates backend client with request scoped logger", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ id: "u1" }), { headers: { "content-type": "application/json" } }));
    const logger = vi.fn();
    const request = new Request("https://m.example.com/api/bff/user/profile", {
      headers: {
        cookie: "mallToken=mall-token",
        "x-app-version": "1.0.0"
      }
    });
    const context = createBffRequestContext(request, {
      fetcher,
      logger,
      registryEnv: {
        APP_ENV: "test",
        JAVA_API_BASE_URL: "https://java-test.example.com",
        PYTHON_API_BASE_URL: "https://python-test.example.com"
      },
      requestIdFactory: () => "req-bff"
    });

    const result = await context.backendClient.request({
      authRequired: true,
      authToken: context.getAuthToken("java"),
      backend: "java",
      clientContext: context.clientContext,
      path: "/api/user/profile",
      route: "/mine"
    });

    expect(result.ok).toBe(true);
    expect(logger).toHaveBeenCalledWith(expect.objectContaining({ appVersion: "1.0.0", requestId: "req-bff" }));
  });

  test("passes backend response body logging options to backend client", async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ code: "00000", data: { text: "hello" }, success: true }), { headers: { "content-type": "application/json" } }));
    const logger = vi.fn();
    const request = new Request("https://m.example.com/api/bff/home", {
      headers: {
        cookie: "mallToken=mall-token"
      }
    });
    const context = createBffRequestContext(request, {
      fetcher,
      logger,
      logResponseBody: true,
      registryEnv: {
        APP_ENV: "test",
        JAVA_API_BASE_URL: "https://java-test.example.com",
        PYTHON_API_BASE_URL: "https://python-test.example.com"
      },
      requestIdFactory: () => "req-bff-response",
      responseBodyLogLimit: 1000
    });

    await context.backendClient.request({
      authRequired: true,
      authToken: context.getAuthToken("java"),
      backend: "java",
      path: "/p/app/home/index",
      route: "/"
    });

    expect(logger).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: "req-bff-response",
        responseBody: {
          code: "00000",
          data: { text: "hello" },
          success: true
        },
        responseBodyTruncated: false
      })
    );
  });

  test("uses local env token fallback when cookies are missing in local app env", () => {
    const request = new Request("https://m.example.com/api/bff/user/profile");
    const context = createBffRequestContext(request, {
      authEnv: {
        APP_ENV: "local",
        H5_LOCAL_JAVA_TOKEN: "local-java-token",
        H5_LOCAL_PYTHON_TOKEN: "local-python-token"
      },
      registryEnv: {
        APP_ENV: "local",
        JAVA_API_BASE_URL: "https://java-test.example.com",
        PYTHON_API_BASE_URL: "https://python-test.example.com"
      }
    });

    expect(context.getAuthToken("java")).toBe("local-java-token");
    expect(context.getAuthToken("python")).toBe("local-python-token");
  });

  test("console backend logger writes safe structured entry", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    const logger = createConsoleBackendCallLogger();

    logger({
      appVersion: "1.0.0",
      backend: "java",
      backendPath: "/api/user/profile",
      backendStatus: 200,
      durationMs: 12,
      method: "GET",
      requestId: "req-log",
      responseBody: {
        data: {
          banners: [{ id: 1, imgUrl: "https://cdn.example.com/banner.png" }],
          hotCategory: { name: "热销分类" }
        }
      },
      route: "/mine",
      timeoutMs: 10000
    });

    expect(info).toHaveBeenCalledWith("[h5-bff-backend-call]", expect.any(String));
    const payload = String(info.mock.calls[0]?.[1]);
    expect(payload).toContain('"appVersion": "1.0.0"');
    expect(payload).toContain('"backend": "java"');
    expect(payload).toContain('"backendPath": "/api/user/profile"');
    expect(payload).toContain('"requestId": "req-log"');
    expect(payload).toContain('"banners": [');
    expect(payload).toContain('"imgUrl": "https://cdn.example.com/banner.png"');
    expect(payload).toContain('"hotCategory": {');
    expect(payload).not.toContain("[Array]");
    expect(payload).not.toContain("[Object]");
    expect(payload).not.toContain("authToken");
    info.mockRestore();
  });
});
