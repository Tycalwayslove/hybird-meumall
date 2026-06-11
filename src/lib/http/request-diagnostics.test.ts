import { beforeEach, describe, expect, test, vi } from "vitest";
import {
  clearRequestDiagnostics,
  createDiagnosticSnapshot,
  createPageSessionId,
  getRecentRequestRecords,
  recordRequestDiagnostic
} from "./request-diagnostics";

describe("request diagnostics", () => {
  beforeEach(() => {
    clearRequestDiagnostics();
  });

  test("creates stable page session ids with readable prefix", () => {
    const id = createPageSessionId(() => "uuid-1");

    expect(id).toBe("page-uuid-1");
  });

  test("keeps recent request records in newest bounded order", () => {
    for (let index = 0; index < 12; index += 1) {
      recordRequestDiagnostic({
        method: "GET",
        path: `/api/bff/${index}`,
        requestId: `req-${index}`,
        route: "/promotion",
        status: index % 2 === 0 ? "success" : "error",
        timestamp: 1_000 + index
      });
    }

    expect(getRecentRequestRecords(3).map((record) => record.requestId)).toEqual(["req-11", "req-10", "req-9"]);
    expect(getRecentRequestRecords().map((record) => record.requestId)).toEqual([
      "req-11",
      "req-10",
      "req-9",
      "req-8",
      "req-7",
      "req-6",
      "req-5",
      "req-4",
      "req-3",
      "req-2"
    ]);
  });

  test("creates diagnostic snapshot with current page and recent request ids", () => {
    vi.stubGlobal("window", {
      location: {
        href: "https://m.example.com/hybird/promotion?level=v3",
        pathname: "/hybird/promotion"
      },
      navigator: {
        userAgent: "Mozilla/5.0 MeuMall/1.0.0"
      }
    });

    recordRequestDiagnostic({
      code: "TIMEOUT",
      method: "GET",
      path: "/api/bff/promotion/home",
      requestId: "req-timeout",
      route: "/promotion",
      status: "error",
      timestamp: 1_000
    });

    expect(
      createDiagnosticSnapshot({
        appVersion: "1.0.0",
        deviceModel: "iPhone16,2",
        h5Version: "1.2.0",
        osVersion: "18.5",
        pageSessionId: "page-1",
        platform: "ios"
      })
    ).toEqual({
      appVersion: "1.0.0",
      currentUrl: "https://m.example.com/hybird/promotion?level=v3",
      deviceModel: "iPhone16,2",
      h5Version: "1.2.0",
      lastErrorRequestId: "req-timeout",
      lastRequestIds: ["req-timeout"],
      osVersion: "18.5",
      pageSessionId: "page-1",
      platform: "ios",
      recentRequests: [
        {
          code: "TIMEOUT",
          method: "GET",
          path: "/api/bff/promotion/home",
          requestId: "req-timeout",
          route: "/promotion",
          status: "error",
          timestamp: 1_000
        }
      ],
      route: "/hybird/promotion",
      userAgent: "Mozilla/5.0 MeuMall/1.0.0"
    });

    vi.unstubAllGlobals();
  });
});
