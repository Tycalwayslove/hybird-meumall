import { describe, expect, test, vi } from "vitest";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";

import { fetchSearchHotKeywordsData } from "./server/search-real-service";

describe("search hot keyword real api service", () => {
  test("requests Java global hot search words and maps them to the H5 view model", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      if (path === "/search/hotSearch?type=1") {
        return makeBackendSuccess({
          data: [
            { hotSearchId: 1, title: "保健品", seq: 2, status: 1, type: 1 },
            { hotSearchId: 2, title: "  生鲜  ", seq: 1, status: 1, type: 1 },
            { hotSearchId: 3, content: "厨房清洁", seq: 3, status: 1, type: 1 },
            { hotSearchId: 4, title: "", seq: 4, status: 1, type: 1 }
          ]
        });
      }
      throw new Error(`Unexpected path ${path}`);
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    const result = await fetchSearchHotKeywordsData({
      backendClient: { request },
      type: 1
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.hotKeywords).toEqual(["生鲜", "保健品", "厨房清洁"]);
      expect(result.data.modules.hotSearches).toHaveLength(4);
    }
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        backend: "java",
        method: "GET",
        path: "/search/hotSearch?type=1",
        route: "/search"
      })
    );
  });

  test("does not fall back to mock hot keywords when Java returns an empty list", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      if (path === "/search/hotSearch?type=1") {
        return makeBackendSuccess({ data: [] });
      }
      throw new Error(`Unexpected path ${path}`);
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    const result = await fetchSearchHotKeywordsData({
      backendClient: { request },
      type: 1
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.hotKeywords).toEqual([]);
    }
  });
});

function makeBackendSuccess<T>(data: T): BackendApiResult<T> {
  return {
    data,
    meta: {
      appEnv: "test",
      backend: "java",
      h5Version: "test",
      requestId: "req-search-hot",
      route: "/search"
    },
    ok: true
  };
}
