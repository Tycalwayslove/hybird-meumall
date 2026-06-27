import { describe, expect, it } from "vitest";

import type { BackendRequestOptions } from "@/server/http/backend-client";
import {
  cancelFavoriteProduct,
  deleteFootprints,
  fetchFavoriteProductsData,
  fetchFootprintsData,
  type JavaCollectionEnvelope
} from "./server/collections-real-service";

describe("collections real service", () => {
  it("loads favorite products through the legacy collection endpoint and unwraps records[0].products", async () => {
    const backendClient = createFakeBackendClient({
      "/p/user/collection/prods?current=2&size=20": {
        code: "00000",
        data: {
          current: 2,
          pages: 3,
          records: [
            {
              products: [
                {
                  pic: "prod/favorite.png",
                  price: 39.9,
                  prodId: 1000054,
                  prodName: "收藏商品",
                  soldNum: 120
                }
              ]
            }
          ],
          size: 20,
          total: 41
        },
        success: true
      }
    });

    const result = await fetchFavoriteProductsData({
      authToken: "token",
      backendClient,
      current: 2,
      javaOssAssetBaseUrl: "https://oss.example.com/",
      route: "/api/bff/favorites/products",
      size: 20
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.page).toEqual({ current: 2, hasMore: true, pages: 3, size: 20, total: 41 });
      expect(result.data.view.items).toEqual([
        expect.objectContaining({
          detailHref: "/product/1000054",
          id: "1000054",
          imageUrl: "https://oss.example.com/prod/favorite.png",
          priceText: "¥39.90",
          prodId: "1000054",
          salesText: "已售: 120",
          title: "收藏商品"
        })
      ]);
    }
    expect(backendClient.paths).toEqual(["GET /p/user/collection/prods?current=2&size=20"]);
  });

  it("loads browsing footprints and keeps browse log ids for deletion", async () => {
    const backendClient = createFakeBackendClient({
      "/p/prodBrowseLog/page?current=1&size=20": {
        code: "00000",
        data: {
          current: 1,
          pages: 1,
          records: [
            {
              browseTime: "2026-06-27 10:00:00",
              pic: "prod/history.png",
              price: 29,
              prodBrowseLogId: 9001,
              prodId: 1000066,
              prodName: "足迹商品"
            }
          ],
          size: 20,
          total: 1
        },
        success: true
      }
    });

    const result = await fetchFootprintsData({
      authToken: "token",
      backendClient,
      current: 1,
      javaOssAssetBaseUrl: "https://oss.example.com/",
      route: "/api/bff/footprints",
      size: 20
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.items).toEqual([
        expect.objectContaining({
          browseLogId: "9001",
          browseTime: "2026-06-27 10:00:00",
          detailHref: "/product/1000066",
          groupLabel: "今天",
          id: "9001",
          imageUrl: "https://oss.example.com/prod/history.png",
          priceText: "¥29.00",
          prodId: "1000066",
          title: "足迹商品"
        })
      ]);
    }
    expect(backendClient.paths).toEqual(["GET /p/prodBrowseLog/page?current=1&size=20"]);
  });

  it("mutates favorites and footprints using the same body shapes as uni-app", async () => {
    const backendClient = createFakeBackendClient({
      "/p/prodBrowseLog": { code: "00000", data: true, success: true },
      "/p/user/collection/addOrCancel": { code: "00000", data: false, success: true }
    });

    await cancelFavoriteProduct({
      authToken: "token",
      backendClient,
      prodId: "1000054",
      route: "/api/bff/favorites/products/cancel"
    });
    await deleteFootprints({
      authToken: "token",
      backendClient,
      ids: ["9001", "9002"],
      route: "/api/bff/footprints/delete"
    });

    expect(backendClient.paths).toEqual(["POST /p/user/collection/addOrCancel", "DELETE /p/prodBrowseLog"]);
    expect(backendClient.bodies).toEqual(["1000054", ["9001", "9002"]]);
  });
});

function createFakeBackendClient(responses: Record<string, JavaCollectionEnvelope<unknown>>) {
  const paths: string[] = [];
  const bodies: unknown[] = [];

  return {
    bodies,
    paths,
    async request<T>(options: BackendRequestOptions) {
      paths.push(`${options.method ?? "GET"} ${options.path}`);
      bodies.push(options.body);
      const response = responses[options.path];
      if (!response) {
        throw new Error(`Unexpected request: ${options.path}`);
      }

      return {
        data: response as T,
        meta: {
          appEnv: "test",
          backend: "java" as const,
          h5Version: "test",
          requestId: "req-collections",
          route: options.route ?? "unknown"
        },
        ok: true as const
      };
    }
  };
}
