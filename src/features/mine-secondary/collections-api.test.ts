import { describe, expect, it } from "vitest";

import type { H5BffResult, H5RequestOptions } from "@/lib/http";

import { createCollectionsApi } from "./api";

describe("collections browser api", () => {
  it("requests favorites and footprints through H5 BFF paths only", async () => {
    const requests: Array<{ body?: unknown; method?: string; path: string }> = [];
    const api = createCollectionsApi({
      async request<T>(path: string, options: H5RequestOptions = {}) {
        requests.push({ body: options.body, method: options.method, path });
        return {
          data: {} as T,
          requestId: "req-collections-api",
          success: true
        } as H5BffResult<T>;
      }
    });

    await api.getFavoriteProducts({ current: 2, size: 20 });
    await api.cancelFavoriteProduct("1000054");
    await api.getFootprints({ current: 1, size: 20 });
    await api.deleteFootprints(["9001", "9002"]);

    expect(requests).toEqual([
      {
        method: undefined,
        path: "/api/bff/favorites/products?current=2&size=20"
      },
      {
        body: { prodId: "1000054" },
        method: "POST",
        path: "/api/bff/favorites/products/cancel"
      },
      {
        method: undefined,
        path: "/api/bff/footprints?current=1&size=20"
      },
      {
        body: { ids: ["9001", "9002"] },
        method: "DELETE",
        path: "/api/bff/footprints/delete"
      }
    ]);
  });
});
