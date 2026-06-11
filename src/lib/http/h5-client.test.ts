import { beforeEach, describe, expect, test, vi } from "vitest";
import { clearRequestDiagnostics, getRecentRequestRecords } from "./request-diagnostics";
import { buildH5ApiPath, createH5Client } from "./h5-client";

describe("h5 client", () => {
  beforeEach(() => {
    clearRequestDiagnostics();
  });

  test("builds BFF path from current versioned H5 pathname", () => {
    expect(buildH5ApiPath("/api/bff/user/profile", { pathname: "/h5-v/v1.0.3/mine" })).toBe(
      "/h5-v/v1.0.3/api/bff/user/profile"
    );
  });

  test("requests BFF with credentials included", async () => {
    const fetcher = vi.fn(async () => jsonResponse({ success: true, data: { id: "u1" }, requestId: "req-h5" }));
    const client = createH5Client({
      fetcher,
      pathname: "/h5-v/v1.0.3/mine",
      requestIdFactory: () => "req-h5"
    });

    const result = await client.request<{ id: string }>("/api/bff/user/profile");

    expect(result).toEqual({
      success: true,
      data: { id: "u1" },
      requestId: "req-h5"
    });
    expect(fetcher).toHaveBeenCalledWith(
      "/h5-v/v1.0.3/api/bff/user/profile",
      expect.objectContaining({
        credentials: "include",
        headers: expect.objectContaining({
          "x-request-id": "req-h5"
        })
      })
    );
  });

  test("adds client context headers without overriding browser User-Agent", async () => {
    const fetcher = vi.fn(async (input: string, init?: RequestInit) => {
      void input;
      void init;
      return jsonResponse({ success: true, data: { ok: true }, requestId: "req-context" });
    });
    const client = createH5Client({
      clientContext: {
        appBuild: "100",
        appName: "MeuMall",
        appVersion: "1.0.0",
        deviceModel: "iPhone16,2",
        h5Route: "/promotion",
        h5Version: "1.2.0",
        osVersion: "18.5",
        pageSessionId: "page-1",
        platform: "ios",
        userAgent: "should-not-be-set-from-browser",
        webviewVersion: "617.1.17"
      },
      fetcher,
      requestIdFactory: () => "req-context"
    });

    await client.request<{ ok: boolean }>("/api/bff/promotion/home");

    expect(fetcher).toHaveBeenCalledWith(
      "/api/bff/promotion/home",
      expect.objectContaining({
        headers: expect.objectContaining({
          "x-app-build": "100",
          "x-app-name": "MeuMall",
          "x-app-version": "1.0.0",
          "x-device-model": "iPhone16,2",
          "x-h5-route": "/promotion",
          "x-h5-version": "1.2.0",
          "x-os-version": "18.5",
          "x-page-session-id": "page-1",
          "x-platform": "ios",
          "x-request-id": "req-context",
          "x-webview-version": "617.1.17"
        })
      })
    );
    const [, init] = fetcher.mock.calls[0] as [string, RequestInit];
    expect(init.headers).not.toHaveProperty("user-agent");
  });

  test("records successful and failed BFF requests for diagnostics", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ success: true, data: { ok: true }, requestId: "req-success" }))
      .mockResolvedValueOnce(
        jsonResponse(
          {
            success: false,
            code: "TIMEOUT",
            message: "timeout",
            requestId: "req-timeout",
            recoverable: true
          },
          { status: 504 }
        )
      );
    const client = createH5Client({
      clientContext: {
        h5Route: "/promotion"
      },
      fetcher,
      requestIdFactory: () => (fetcher.mock.calls.length === 0 ? "req-success" : "req-timeout")
    });

    await client.request<{ ok: boolean }>("/api/bff/promotion/home");
    await client.request("/api/bff/promotion/home");

    expect(getRecentRequestRecords()).toEqual([
      {
        code: "TIMEOUT",
        method: "GET",
        path: "/api/bff/promotion/home",
        requestId: "req-timeout",
        route: "/promotion",
        status: "error",
        timestamp: expect.any(Number)
      },
      {
        method: "GET",
        path: "/api/bff/promotion/home",
        requestId: "req-success",
        route: "/promotion",
        status: "success",
        timestamp: expect.any(Number)
      }
    ]);
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
