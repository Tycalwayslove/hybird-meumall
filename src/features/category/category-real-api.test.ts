import { describe, expect, test, vi } from "vitest";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";

import { fetchCategoryListData } from "./server/category-real-service";

describe("category real api service", () => {
  test("requests Java category tree and maps it to the H5 category page model", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      if (path === "/category/list?parentId=-1&shopId=0&depth=3") {
        return makeBackendSuccess({
          data: [
            {
              categoryId: 100,
              categoryName: "生鲜熟食",
              seq: 2,
              status: 1,
              children: [
                {
                  categoryId: 110,
                  categoryName: "肉禽蛋品",
                  seq: 1,
                  status: 1,
                  children: [
                    {
                      categoryId: 111,
                      categoryName: "鸡蛋",
                      pic: "/category/egg.png",
                      seq: 2,
                      status: 1
                    },
                    {
                      categoryId: 112,
                      categoryName: "牛肉",
                      icon: "category/beef.png",
                      seq: 1,
                      status: 1
                    }
                  ]
                }
              ]
            },
            {
              categoryId: 200,
              categoryName: "已下线",
              seq: 1,
              status: 0
            }
          ]
        });
      }
      throw new Error(`Unexpected path ${path}`);
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    const result = await fetchCategoryListData({
      backendClient: { request },
      javaOssAssetBaseUrl: "https://oss.example.com/"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.primaryCategories).toEqual([
        {
          id: "100",
          label: "生鲜熟食"
        }
      ]);
      expect(result.data.view.activeCategoryId).toBe("100");
      expect(result.data.view.categorySectionsByPrimaryId["100"]).toEqual([
        {
          id: "110",
          title: "肉禽蛋品",
          items: [
            {
              href: "/search?categoryId=112",
              id: "112",
              imageUrl: "https://oss.example.com/category/beef.png",
              label: "牛肉"
            },
            {
              href: "/search?categoryId=111",
              id: "111",
              imageUrl: "https://oss.example.com/category/egg.png",
              label: "鸡蛋"
            }
          ]
        }
      ]);
      expect(result.data.modules.categories).toHaveLength(2);
    }
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        backend: "java",
        method: "GET",
        path: "/category/list?parentId=-1&shopId=0&depth=3",
        route: "/category"
      })
    );
  });

  test("does not fall back to mock categories when Java returns an empty tree", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      if (path === "/category/list?parentId=-1&shopId=0&depth=3") {
        return makeBackendSuccess({ data: [] });
      }
      throw new Error(`Unexpected path ${path}`);
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    const result = await fetchCategoryListData({
      backendClient: { request }
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.primaryCategories).toEqual([]);
      expect(result.data.view.categorySectionsByPrimaryId).toEqual({});
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
      requestId: "req-category",
      route: "/category"
    },
    ok: true
  };
}
