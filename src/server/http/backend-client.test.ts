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
