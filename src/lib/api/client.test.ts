import { describe, expect, test, vi } from "vitest";
import { createNativeBridge, createWebBridgeAdapter } from "@/lib/bridge";
import { createApiClient } from "./client";

describe("createApiClient", () => {
  test("joins base URL, injects requestId, and parses JSON responses", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ id: "order-1" }));
    const client = createApiClient({
      baseUrl: "https://api.example.com/v1",
      fetcher,
      h5Version: "2026.05.15-001",
      requestIdFactory: () => "req-success"
    });

    const result = await client.request<{ id: string }>("/orders/1", {
      auth: false,
      route: "/orders"
    });

    expect(result).toEqual({
      ok: true,
      data: { id: "order-1" },
      meta: {
        requestId: "req-success",
        route: "/orders",
        h5Version: "2026.05.15-001"
      }
    });
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/v1/orders/1",
      expect.objectContaining({
        headers: expect.objectContaining({
          "x-request-id": "req-success",
          "x-h5-version": "2026.05.15-001",
          "x-route": "/orders"
        })
      })
    );
  });

  test("reads auth token from Bridge user.getToken when auth is required", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ ok: true }));
    const bridge = createNativeBridge({
      adapter: createWebBridgeAdapter({ token: "native-token" })
    });
    const client = createApiClient({
      baseUrl: "https://api.example.com",
      bridge,
      fetcher,
      requestIdFactory: () => "req-token"
    });

    const result = await client.request<{ ok: boolean }>("/profile", { auth: true });

    expect(result.ok).toBe(true);
    expect(fetcher).toHaveBeenCalledWith(
      "https://api.example.com/profile",
      expect.objectContaining({
        headers: expect.objectContaining({
          authorization: "Bearer native-token",
          "x-request-id": "req-token"
        })
      })
    );
  });

  test("returns TOKEN_MISSING before fetch when required auth token is unavailable", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ ok: true }));
    const client = createApiClient({
      baseUrl: "https://api.example.com",
      fetcher,
      requestIdFactory: () => "req-missing",
      tokenProvider: async () => null
    });

    const result = await client.request("/profile", { auth: true });

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

  test("normalizes 401 responses as AUTH_FAILED", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ message: "expired" }, { status: 401 }));
    const client = createApiClient({
      baseUrl: "https://api.example.com",
      fetcher,
      requestIdFactory: () => "req-auth",
      tokenProvider: async () => "expired-token"
    });

    const result = await client.request("/profile", { auth: true });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "AUTH_FAILED",
        message: "Authentication failed.",
        httpStatus: 401,
        recoverable: true,
        requestId: "req-auth",
        details: { response: { message: "expired" } }
      }
    });
  });

  test("normalizes rejected fetch calls as NETWORK_ERROR", async () => {
    const fetcher = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    const client = createApiClient({
      baseUrl: "https://api.example.com",
      fetcher,
      requestIdFactory: () => "req-network"
    });

    const result = await client.request("/health", { auth: false });

    expect(result).toEqual({
      ok: false,
      error: {
        code: "NETWORK_ERROR",
        message: "Network request failed.",
        recoverable: true,
        requestId: "req-network",
        details: { message: "Failed to fetch" }
      }
    });
  });

  test("aborts slow requests and returns TIMEOUT", async () => {
    vi.useFakeTimers();
    const fetcher = vi.fn(
      () => new Promise<Response>(() => {
        // Intentionally pending to exercise timeout.
      })
    );
    const client = createApiClient({
      baseUrl: "https://api.example.com",
      fetcher,
      requestIdFactory: () => "req-timeout",
      timeoutMs: 100
    });

    const resultPromise = client.request("/slow", { auth: false });
    await vi.advanceTimersByTimeAsync(100);
    const result = await resultPromise;

    expect(result).toEqual({
      ok: false,
      error: {
        code: "TIMEOUT",
        message: "API request timed out.",
        recoverable: true,
        requestId: "req-timeout",
        details: { timeoutMs: 100 }
      }
    });
    vi.useRealTimers();
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
