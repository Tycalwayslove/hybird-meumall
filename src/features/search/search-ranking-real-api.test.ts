import { describe, expect, test } from "vitest";

import type { H5BffResult } from "@/lib/http";

import { createSearchApi } from "./api";
import {
  fetchSearchRankingData,
  type ProductCardVO,
  type ProdRankTabDto,
  type SearchServerResponse
} from "./server/search-real-service";

describe("search ranking real api service", () => {
  test("requests Java ranking tabs and products, then maps them for H5 ranking views", async () => {
    const backendClient = createFakeBackendClient({
      "/search/rankTabs?categoryBoardCount=6": {
        code: "00000",
        data: sampleTabs,
        success: true
      },
      "/search/rank/1": {
        code: "00000",
        data: sampleProducts,
        success: true
      }
    });

    const result = await fetchSearchRankingData({
      authRequired: true,
      authToken: "mall-token",
      backendClient,
      categoryBoardCount: 6,
      javaOssAssetBaseUrl: "https://oss.example.com/"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.tabs).toEqual([
        { id: "rank-1", label: "喵呜热榜", rankType: 1 },
        { categoryId: "110", id: "rank-2-110", label: "生鲜热榜", rankType: 2 }
      ]);
      expect(result.data.view.activeTabId).toBe("rank-1");
      expect(result.data.view.products).toEqual([
        {
          badge: { label: "热销", type: "hot" },
          feature: "近30天热卖 2300",
          href: "/product/1000054",
          id: "1000054",
          imageUrl: "https://oss.example.com/rank/prod-1000054.png",
          originalPrice: 399,
          price: 188,
          priceSubText: { kind: "discount", text: "平台优惠12元" },
          soldText: "已售: 2300",
          title: "有机鲜牛乳"
        },
        {
          badge: { label: "限时秒杀", type: "seckill" },
          feature: "近30天热卖 98",
          href: "/product/1000055",
          id: "1000055",
          imageUrl: "https://cdn.example.com/prod-1000055.png",
          originalPrice: 299,
          price: 158,
          priceSubText: { kind: "original", text: "￥299" },
          soldText: "已售: 98",
          title: "冷链牛排套装"
        }
      ]);
      expect(result.data.modules.rankTabs).toEqual(sampleTabs);
      expect(result.data.modules.products).toEqual(sampleProducts);
    }
    expect(backendClient.requests).toEqual([
      { method: "GET", path: "/search/rankTabs?categoryBoardCount=6" },
      { method: "GET", path: "/search/rank/1" }
    ]);
  });

  test("requests category ranking products with categoryId when a category tab is selected", async () => {
    const backendClient = createFakeBackendClient({
      "/search/rankTabs?categoryBoardCount=6": {
        code: "00000",
        data: sampleTabs,
        success: true
      },
      "/search/rank/2?categoryId=110": {
        code: "00000",
        data: [sampleProducts[0]],
        success: true
      }
    });

    const result = await fetchSearchRankingData({
      backendClient,
      categoryBoardCount: 6,
      categoryId: "110",
      rankType: 2
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.activeTabId).toBe("rank-2-110");
      expect(result.data.view.products).toHaveLength(1);
    }
    expect(backendClient.requests.map((request) => request.path)).toEqual(["/search/rankTabs?categoryBoardCount=6", "/search/rank/2?categoryId=110"]);
  });

  test("omits categoryBoardCount when loading the full ranking page", async () => {
    const backendClient = createFakeBackendClient({
      "/search/rankTabs": {
        code: "00000",
        data: sampleTabs,
        success: true
      },
      "/search/rank/1": {
        code: "00000",
        data: sampleProducts,
        success: true
      }
    });

    const result = await fetchSearchRankingData({
      backendClient
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.tabs).toHaveLength(2);
      expect(result.data.view.products).toHaveLength(2);
    }
    expect(backendClient.requests.map((request) => request.path)).toEqual(["/search/rankTabs", "/search/rank/1"]);
  });

  test("does not fall back to mock ranking data when Java returns empty lists", async () => {
    const backendClient = createFakeBackendClient({
      "/search/rankTabs?categoryBoardCount=6": {
        code: "00000",
        data: [],
        success: true
      },
      "/search/rank/1": {
        code: "00000",
        data: [],
        success: true
      }
    });

    const result = await fetchSearchRankingData({
      backendClient,
      categoryBoardCount: 6
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.tabs).toEqual([]);
      expect(result.data.view.products).toEqual([]);
      expect(JSON.stringify(result.data)).not.toContain("棉短袖T恤");
    }
  });

  test("browser adapter requests only the H5 ranking BFF path", async () => {
    const requests: Array<{ options: unknown; path: string }> = [];
    const api = createSearchApi({
      async request<T>(path: string) {
        requests.push({ options: undefined, path });
        return {
          data: {
            modules: { products: [], rankTabs: [] },
            view: { activeTabId: "rank-1", notice: "", products: [], tabs: [] }
          },
          requestId: "req-search-ranking",
          success: true
        } as H5BffResult<T>;
      }
    });

    await api.getRanking({ categoryBoardCount: 6, categoryId: "110", rankType: 2 });

    expect(requests).toEqual([
      {
        options: undefined,
        path: "/api/bff/search/ranking?categoryBoardCount=6&rankType=2&categoryId=110"
      }
    ]);
  });

  test("browser adapter omits categoryBoardCount unless the caller provides it", async () => {
    const requests: Array<{ options: unknown; path: string }> = [];
    const api = createSearchApi({
      async request<T>(path: string) {
        requests.push({ options: undefined, path });
        return {
          data: {
            modules: { products: [], rankTabs: [] },
            view: { activeTabId: "rank-2-110", notice: "", products: [], tabs: [] }
          },
          requestId: "req-search-ranking",
          success: true
        } as H5BffResult<T>;
      }
    });

    await api.getRanking({ categoryId: "110", rankType: 2 });

    expect(requests).toEqual([
      {
        options: undefined,
        path: "/api/bff/search/ranking?rankType=2&categoryId=110"
      }
    ]);
  });
});

const sampleTabs: ProdRankTabDto[] = [
  {
    rankName: "喵呜热榜",
    rankType: 1
  },
  {
    categoryId: 110,
    rankName: "生鲜热榜",
    rankType: 2
  }
];

const sampleProducts: ProductCardVO[] = [
  {
    discountAmount: 12,
    displayPrice: 188,
    isHot: true,
    oriPrice: 399,
    pic: "rank/prod-1000054.png",
    price: 199,
    prodId: 1000054,
    prodName: "有机鲜牛乳",
    soldNum: 2300
  },
  {
    activityType: 1,
    displayPrice: 158,
    oriPrice: 299,
    pic: "https://cdn.example.com/prod-1000055.png",
    price: 168,
    prodId: 1000055,
    prodName: "冷链牛排套装",
    soldNum: 98
  }
];

function createFakeBackendClient(responses: Record<string, SearchServerResponse<ProdRankTabDto[] | ProductCardVO[]>>) {
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
          requestId: "req-ranking",
          route: "/search"
        },
        ok: true as const
      };
    }
  };
}
