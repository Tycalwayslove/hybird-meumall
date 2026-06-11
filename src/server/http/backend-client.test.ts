import { describe, expect, test, vi } from "vitest";
import { createBackendClient } from "./backend-client";
import { createBackendRegistry } from "./backend-registry";

describe("backend client", () => {
  test("forwards cookie token as Authorization when calling Java backend", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ nickname: "Meu" }));
    const client = createBackendClient({
      registry: createBackendRegistry({
        APP_ENV: "test",
        JAVA_API_BASE_URL: "https://java-test.example.com",
        PYTHON_API_BASE_URL: "https://python-test.example.com"
      }),
      fetcher,
      h5Version: "v1.0.3",
      requestIdFactory: () => "req-backend"
    });

    const result = await client.request<{ nickname: string }>({
      backend: "java",
      path: "/api/user/profile",
      authToken: "native-cookie-token",
      authRequired: true,
      route: "/mine"
    });

    expect(result).toEqual({
      ok: true,
      data: { nickname: "Meu" },
      meta: {
        requestId: "req-backend",
        route: "/mine",
        h5Version: "v1.0.3",
        appEnv: "test",
        backend: "java"
      }
    });
    expect(fetcher).toHaveBeenCalledWith(
      "https://java-test.example.com/api/user/profile",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer native-cookie-token",
          "x-request-id": "req-backend",
          "x-h5-version": "v1.0.3",
          "x-app-env": "test",
          "x-route": "/mine"
        })
      })
    );
  });

  test("does not call backend when auth is required but token is missing", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ ok: true }));
    const client = createBackendClient({
      registry: createBackendRegistry({
        APP_ENV: "prod",
        JAVA_API_BASE_URL: "https://java.example.com",
        PYTHON_API_BASE_URL: "https://python.example.com"
      }),
      fetcher,
      requestIdFactory: () => "req-missing"
    });

    const result = await client.request({
      backend: "python",
      path: "/api/recommend",
      authRequired: true,
      authToken: null
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "TOKEN_MISSING",
        message: "Auth token is unavailable.",
        recoverable: true,
        requestId: "req-missing"
      }
    });
    expect(fetcher).not.toHaveBeenCalled();
  });

  test("forwards client context headers and emits safe backend call log", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ rows: [] }));
    const logger = vi.fn();
    const client = createBackendClient({
      registry: createBackendRegistry({
        APP_ENV: "test",
        JAVA_API_BASE_URL: "https://java-test.example.com",
        PYTHON_API_BASE_URL: "https://python-test.example.com"
      }),
      fetcher,
      h5Version: "v1.0.3",
      logger,
      requestIdFactory: () => "req-context"
    });

    await client.request({
      backend: "java",
      path: "/p/app/home/index",
      route: "/",
      clientContext: {
        appBuild: "100",
        appName: "MeuMall",
        appVersion: "1.0.0",
        deviceModel: "iPhone16,2",
        osVersion: "18.5",
        pageSessionId: "page-1",
        platform: "ios",
        userAgent: "Mozilla/5.0 MeuMall/1.0.0",
        webviewVersion: "617.1.17"
      }
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://java-test.example.com/p/app/home/index",
      expect.objectContaining({
        headers: expect.objectContaining({
          "user-agent": "Mozilla/5.0 MeuMall/1.0.0",
          "x-app-build": "100",
          "x-app-name": "MeuMall",
          "x-app-version": "1.0.0",
          "x-device-model": "iPhone16,2",
          "x-os-version": "18.5",
          "x-page-session-id": "page-1",
          "x-platform": "ios",
          "x-request-id": "req-context",
          "x-webview-version": "617.1.17"
        })
      })
    );
    expect(logger).toHaveBeenCalledWith(
      expect.objectContaining({
        appVersion: "1.0.0",
        backend: "java",
        backendPath: "/p/app/home/index",
        backendStatus: 200,
        deviceModel: "iPhone16,2",
        method: "GET",
        osVersion: "18.5",
        platform: "ios",
        requestId: "req-context",
        route: "/"
      })
    );
    expect(logger.mock.calls[0]?.[0]).not.toHaveProperty("authToken");
    expect(logger.mock.calls[0]?.[0]).not.toHaveProperty("errorCode");
  });

  test("emits backend call log with status and error code when backend fails", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ message: "bad gateway" }, { status: 502 }));
    const logger = vi.fn();
    const client = createBackendClient({
      registry: createBackendRegistry({
        APP_ENV: "test",
        JAVA_API_BASE_URL: "https://java-test.example.com",
        PYTHON_API_BASE_URL: "https://python-test.example.com"
      }),
      fetcher,
      logger,
      requestIdFactory: () => "req-failed"
    });

    const result = await client.request({
      backend: "java",
      path: "/p/app/home/index",
      route: "/"
    });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "HTTP_ERROR",
        details: {
          response: {
            message: "bad gateway"
          }
        },
        httpStatus: 502,
        message: "API request failed.",
        recoverable: true,
        requestId: "req-failed"
      }
    });
    expect(logger).toHaveBeenCalledWith(
      expect.objectContaining({
        backend: "java",
        backendPath: "/p/app/home/index",
        backendStatus: 502,
        errorCode: "HTTP_ERROR",
        requestId: "req-failed",
        route: "/"
      })
    );
  });
});

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: {
      "content-type": "application/json",
      ...init.headers
    }
  });
}
