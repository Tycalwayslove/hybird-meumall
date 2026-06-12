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
          Authorization: "native-cookie-token",
          source: "1",
          "x-request-id": "req-backend",
          "x-h5-version": "v1.0.3",
          "x-app-env": "test",
          "x-route": "/mine"
        })
      })
    );
  });

  test("forwards Python token with Bearer authorization", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ rows: [] }));
    const client = createBackendClient({
      registry: createBackendRegistry({
        APP_ENV: "test",
        JAVA_API_BASE_URL: "https://java-test.example.com",
        PYTHON_API_BASE_URL: "https://python-test.example.com"
      }),
      fetcher,
      requestIdFactory: () => "req-python"
    });

    await client.request({
      backend: "python",
      path: "/api/recommend",
      authToken: "python-cookie-token",
      authRequired: true,
      route: "/recommend"
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://python-test.example.com/api/recommend",
      expect.objectContaining({
        headers: expect.not.objectContaining({
          source: "1"
        })
      })
    );
    expect(fetcher).toHaveBeenCalledWith(
      "https://python-test.example.com/api/recommend",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer python-cookie-token",
          "x-request-id": "req-python"
        })
      })
    );
  });

  test("forces App source header for Java backend requests", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ ok: true }));
    const client = createBackendClient({
      registry: createBackendRegistry({
        APP_ENV: "test",
        JAVA_API_BASE_URL: "https://java-test.example.com",
        PYTHON_API_BASE_URL: "https://python-test.example.com"
      }),
      fetcher,
      requestIdFactory: () => "req-java-source"
    });

    await client.request({
      backend: "java",
      path: "/prod/prodInfo",
      headers: {
        source: "2"
      }
    });

    expect(fetcher).toHaveBeenCalledWith(
      "https://java-test.example.com/prod/prodInfo",
      expect.objectContaining({
        headers: expect.objectContaining({
          source: "1",
          "x-request-id": "req-java-source"
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

  test("emits backend business code even when HTTP request succeeds", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ code: "A00004", msg: "Unauthorized", success: false, data: null }));
    const logger = vi.fn();
    const client = createBackendClient({
      registry: createBackendRegistry({
        APP_ENV: "test",
        JAVA_API_BASE_URL: "https://java-test.example.com",
        PYTHON_API_BASE_URL: "https://python-test.example.com"
      }),
      fetcher,
      logger,
      requestIdFactory: () => "req-business-failed"
    });

    const result = await client.request({
      backend: "java",
      path: "/p/app/home/index",
      route: "/"
    });

    expect(result.ok).toBe(true);
    expect(logger).toHaveBeenCalledWith(
      expect.objectContaining({
        backend: "java",
        backendBusinessCode: "A00004",
        backendBusinessMessage: "Unauthorized",
        backendBusinessSuccess: false,
        backendPath: "/p/app/home/index",
        backendStatus: 200,
        requestId: "req-business-failed",
        route: "/"
      })
    );
  });

  test("emits safe request headers, query and body for backend debugging", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ ok: true }));
    const logger = vi.fn();
    const client = createBackendClient({
      registry: createBackendRegistry({
        APP_ENV: "test",
        JAVA_API_BASE_URL: "https://java-test.example.com",
        PYTHON_API_BASE_URL: "https://python-test.example.com"
      }),
      fetcher,
      logger,
      requestIdFactory: () => "req-debug"
    });

    await client.request({
      authRequired: true,
      authToken: "native-cookie-token",
      backend: "java",
      body: {
        keyword: "cat",
        nested: {
          accessToken: "nested-secret-token"
        }
      },
      path: "/p/app/search?current=1&tag=cat&tag=food",
      route: "/search"
    });

    const entry = logger.mock.calls[0]?.[0];
    expect(entry).toEqual(
      expect.objectContaining({
        backend: "java",
        requestBody: {
          keyword: "cat",
          nested: {
            accessToken: "nest...oken (length=19)"
          }
        },
        requestHeaders: expect.objectContaining({
          Authorization: "nati...oken (length=19)",
          "content-type": "application/json",
          "x-request-id": "req-debug"
        }),
        requestQuery: {
          current: "1",
          tag: ["cat", "food"]
        },
        requestUrl: "https://java-test.example.com/p/app/search?current=1&tag=cat&tag=food"
      })
    );
    expect(JSON.stringify(entry)).not.toContain("native-cookie-token");
    expect(JSON.stringify(entry)).not.toContain("nested-secret-token");
  });

  test("does not emit backend response body unless response logging is enabled", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ code: "00000", data: { id: "u1" }, success: true }));
    const logger = vi.fn();
    const client = createBackendClient({
      registry: createBackendRegistry({
        APP_ENV: "test",
        JAVA_API_BASE_URL: "https://java-test.example.com",
        PYTHON_API_BASE_URL: "https://python-test.example.com"
      }),
      fetcher,
      logger,
      requestIdFactory: () => "req-no-response-body"
    });

    await client.request({
      backend: "java",
      path: "/p/app/home/index",
      route: "/"
    });

    expect(logger.mock.calls[0]?.[0]).not.toHaveProperty("responseBody");
    expect(logger.mock.calls[0]?.[0]).not.toHaveProperty("responseBodySize");
    expect(logger.mock.calls[0]?.[0]).not.toHaveProperty("responseBodyTruncated");
  });

  test("emits sanitized backend response body when response logging is enabled", async () => {
    const fetcher = vi.fn(async () =>
      jsonResponse({
        code: "00000",
        data: {
          mobile: "13800138000",
          order: {
            address: "Guangzhou Tianhe",
            token: "java-response-token"
          },
          products: [{ prodId: 1, prodName: "短袖" }]
        },
        success: true
      })
    );
    const logger = vi.fn();
    const client = createBackendClient({
      registry: createBackendRegistry({
        APP_ENV: "test",
        JAVA_API_BASE_URL: "https://java-test.example.com",
        PYTHON_API_BASE_URL: "https://python-test.example.com"
      }),
      fetcher,
      logger,
      logResponseBody: true,
      requestIdFactory: () => "req-response-body"
    });

    await client.request({
      backend: "java",
      path: "/p/app/home/index",
      route: "/"
    });

    const entry = logger.mock.calls[0]?.[0];
    expect(entry).toEqual(
      expect.objectContaining({
        responseBody: {
          code: "00000",
          data: {
            mobile: "1380...8000 (length=11)",
            order: {
              address: "Guan...anhe (length=16)",
              token: "java...oken (length=19)"
            },
            products: [{ prodId: 1, prodName: "短袖" }]
          },
          success: true
        },
        responseBodyTruncated: false
      })
    );
    expect(entry.responseBodySize).toBeGreaterThan(0);
    expect(JSON.stringify(entry)).not.toContain("13800138000");
    expect(JSON.stringify(entry)).not.toContain("java-response-token");
    expect(JSON.stringify(entry)).not.toContain("Guangzhou Tianhe");
  });

  test("truncates backend response body when it exceeds log limit", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ code: "00000", data: { text: "x".repeat(200) }, success: true }));
    const logger = vi.fn();
    const client = createBackendClient({
      registry: createBackendRegistry({
        APP_ENV: "test",
        JAVA_API_BASE_URL: "https://java-test.example.com",
        PYTHON_API_BASE_URL: "https://python-test.example.com"
      }),
      fetcher,
      logger,
      logResponseBody: true,
      requestIdFactory: () => "req-response-truncated",
      responseBodyLogLimit: 60
    });

    await client.request({
      backend: "java",
      path: "/p/app/home/index",
      route: "/"
    });

    expect(logger.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        responseBodyTruncated: true,
        responseBody: expect.stringMatching(/\.\.\.$/)
      })
    );
    expect(logger.mock.calls[0]?.[0].responseBodySize).toBeGreaterThan(60);
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
