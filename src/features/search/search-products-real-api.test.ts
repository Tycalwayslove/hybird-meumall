import { describe, expect, test } from "vitest";

import type { H5BffResult } from "@/lib/http";

import { createSearchApi } from "./api";
import {
  fetchSearchProductsData,
  type CategoryVO,
  type IPageProductCardVO,
  type ProductCardVO,
  type SearchServerResponse
} from "./server/search-real-service";

describe("search products real api service", () => {
  test("queries products with keyword, categoryId and orderBy, then maps cards and child categories", async () => {
    const backendClient = createFakeBackendClient({
      "/p/app/prod/page?current=1&size=10&orderBy=-soldNum&keyword=%E7%89%9B%E5%A5%B6&categoryId=110": {
        code: "00000",
        data: samplePage,
        success: true
      },
      "/category/list?parentId=110&shopId=0": {
        code: "00000",
        data: sampleCategories,
        success: true
      }
    });

    const result = await fetchSearchProductsData({
      backendClient,
      categoryId: "110",
      javaOssAssetBaseUrl: "https://oss.example.com/",
      keyword: "牛奶",
      orderBy: "-soldNum",
      scopeCategoryId: "110"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.products).toEqual([
        {
          badge: { label: "热销", type: "hot" },
          feature: "近30天热卖 2300",
          href: "/product/1000054",
          id: "1000054",
          imageUrl: "https://oss.example.com/product/milk.png",
          originalPrice: 29.9,
          price: 19.9,
          priceSubText: { kind: "discount", text: "平台优惠5元" },
          soldText: "已售 2300",
          tag: "热卖",
          title: "有机鲜牛乳"
        }
      ]);
      expect(result.data.view.categories).toEqual([
        { id: "111", label: "低温奶" },
        { id: "112", label: "常温奶" }
      ]);
      expect(result.data.view.activeCategoryId).toBe("110");
      expect(result.data.page).toEqual({ current: 1, hasMore: true, pages: 3, size: 10, total: 21 });
      expect(result.data.modules.productPage).toEqual(samplePage);
    }
    expect(backendClient.requests.map((request) => request.path)).toEqual([
      "/p/app/prod/page?current=1&size=10&orderBy=-soldNum&keyword=%E7%89%9B%E5%A5%B6&categoryId=110",
      "/category/list?parentId=110&shopId=0"
    ]);
  });

  test("does not send categoryId for global keyword search", async () => {
    const backendClient = createFakeBackendClient({
      "/p/app/prod/page?current=1&size=10&keyword=%E7%89%9B%E5%A5%B6": {
        code: "00000",
        data: { ...samplePage, records: [] },
        success: true
      },
      "/category/list?parentId=0&shopId=0": {
        code: "00000",
        data: sampleCategories,
        success: true
      }
    });

    const result = await fetchSearchProductsData({
      backendClient,
      keyword: "牛奶"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.products).toEqual([]);
      expect(result.data.view.categories).toEqual([
        { id: "111", label: "低温奶" },
        { id: "112", label: "常温奶" }
      ]);
    }
    expect(backendClient.requests.map((request) => request.path)).toEqual([
      "/p/app/prod/page?current=1&size=10&keyword=%E7%89%9B%E5%A5%B6",
      "/category/list?parentId=0&shopId=0"
    ]);
  });

  test("browser adapter requests only the H5 products BFF path", async () => {
    const requests: string[] = [];
    const api = createSearchApi({
      async request<T>(path: string) {
        requests.push(path);
        return {
          data: {
            modules: { categories: [], productPage: { records: [] }, products: [] },
            page: { current: 1, hasMore: false, size: 10, total: 0 },
            view: { activeCategoryId: "110", categories: [], keyword: "牛奶", products: [] }
          },
          requestId: "req-search-products",
          success: true
        } as H5BffResult<T>;
      }
    });

    await api.getProducts({ categoryId: "112", categoryOptionsParentId: "112", current: 2, keyword: "牛奶", orderBy: "+price", scopeCategoryId: "110", size: 20 });

    expect(requests).toEqual([
      "/api/bff/search/products?current=2&size=20&orderBy=%2Bprice&keyword=%E7%89%9B%E5%A5%B6&categoryId=112&categoryOptionsParentId=112&scopeCategoryId=110"
    ]);
  });

  test("loads descendants for the selected category while querying products by that category", async () => {
    const backendClient = createFakeBackendClient({
      "/p/app/prod/page?current=1&size=10&orderBy=%2Bprice&keyword=%E7%89%9B%E5%A5%B6&categoryId=112": {
        code: "00000",
        data: samplePage,
        success: true
      },
      "/category/list?parentId=112&shopId=0": {
        code: "00000",
        data: [{ categoryId: 11201, categoryName: "儿童牛奶", seq: 1, status: 1 }],
        success: true
      }
    });

    const result = await fetchSearchProductsData({
      backendClient,
      categoryId: "112",
      categoryOptionsParentId: "112",
      keyword: "牛奶",
      orderBy: "+price",
      scopeCategoryId: "110"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.categories).toEqual([{ id: "11201", label: "儿童牛奶" }]);
    }
    expect(backendClient.requests.map((request) => request.path)).toEqual([
      "/p/app/prod/page?current=1&size=10&orderBy=%2Bprice&keyword=%E7%89%9B%E5%A5%B6&categoryId=112",
      "/category/list?parentId=112&shopId=0"
    ]);
  });

  test("keeps category descendants from Java children for the cascade filter", async () => {
    const backendClient = createFakeBackendClient({
      "/p/app/prod/page?current=1&size=10&categoryId=110": {
        code: "00000",
        data: { ...samplePage, records: [] },
        success: true
      },
      "/category/list?parentId=110&shopId=0": {
        code: "00000",
        data: [
          {
            categoryId: 111,
            categoryName: "营养补充",
            children: [
              {
                categoryId: 11101,
                categoryName: "维生素",
                children: [{ categoryId: 1110101, categoryName: "复合维生素", seq: 1, status: 1 }],
                seq: 1,
                status: 1
              }
            ],
            seq: 1,
            status: 1
          }
        ],
        success: true
      }
    });

    const result = await fetchSearchProductsData({
      backendClient,
      categoryId: "110",
      scopeCategoryId: "110"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.categories).toEqual([
        {
          children: [
            {
              children: [{ id: "1110101", label: "复合维生素" }],
              id: "11101",
              label: "维生素"
            }
          ],
          id: "111",
          label: "营养补充"
        }
      ]);
    }
  });
});

const sampleProducts: ProductCardVO[] = [
  {
    discountAmount: 5,
    displayPrice: 19.9,
    isHot: true,
    oriPrice: 29.9,
    pic: "product/milk.png",
    price: 22.9,
    prodId: 1000054,
    prodName: "有机鲜牛乳",
    soldNum: 2300
  }
];

const samplePage: IPageProductCardVO = {
  current: 1,
  pages: 3,
  records: sampleProducts,
  size: 10,
  total: 21
};

const sampleCategories: CategoryVO[] = [
  { categoryId: 112, categoryName: "常温奶", seq: 2, status: 1 },
  { categoryId: 111, categoryName: "低温奶", seq: 1, status: 1 },
  { categoryId: 113, categoryName: "已下线", seq: 3, status: 0 }
];

function createFakeBackendClient(responses: Record<string, SearchServerResponse<IPageProductCardVO | CategoryVO[]>>) {
  const requests: Array<{ method: string; path: string }> = [];

  return {
    requests,
    async request<T>({ method = "GET", path }: { method?: string; path: string }) {
      requests.push({ method, path });
      const response = responses[path];
      if (!response) {
        throw new Error(`Unexpected request: ${path}`);
      }

      return {
        data: response as T,
        meta: {
          appEnv: "test",
          backend: "java" as const,
          h5Version: "test",
          requestId: "req-search-products",
          route: "/search"
        },
        ok: true as const
      };
    }
  };
}
