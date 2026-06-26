import type { H5BffResult } from "@/lib/http";
import type { SearchHotKeywordsBffData, SearchProductsBffData, SearchRankingBffData } from "./server/search-real-service";

export type SearchHttpClient = {
  request<T>(path: string): Promise<H5BffResult<T>>;
};

export function createSearchApi(client: SearchHttpClient) {
  return {
    getHotKeywords(type: 1 | 2 = 1) {
      return client.request<SearchHotKeywordsBffData>(`/api/bff/search/hot-keywords?${new URLSearchParams({ type: String(type) }).toString()}`);
    },
    getRanking(options: { categoryBoardCount?: number; categoryId?: string | number; rankType?: 1 | 2 } = {}) {
      const searchParams = new URLSearchParams();
      if (options.categoryBoardCount !== undefined) {
        searchParams.set("categoryBoardCount", String(options.categoryBoardCount));
      }
      if (options.rankType !== undefined) {
        searchParams.set("rankType", String(options.rankType));
      }
      if (options.categoryId !== undefined && options.categoryId !== "") {
        searchParams.set("categoryId", String(options.categoryId));
      }
      const query = searchParams.toString();
      return client.request<SearchRankingBffData>(`/api/bff/search/ranking${query ? `?${query}` : ""}`);
    },
    getProducts(options: {
      categoryId?: string | number;
      categoryOptionsParentId?: string | number;
      current?: number;
      keyword?: string;
      orderBy?: string;
      scopeCategoryId?: string | number;
      size?: number;
    } = {}) {
      const searchParams = new URLSearchParams();
      if (options.current !== undefined) {
        searchParams.set("current", String(options.current));
      }
      if (options.size !== undefined) {
        searchParams.set("size", String(options.size));
      }
      if (options.orderBy) {
        searchParams.set("orderBy", options.orderBy);
      }
      if (options.keyword?.trim()) {
        searchParams.set("keyword", options.keyword.trim());
      }
      if (options.categoryId !== undefined && options.categoryId !== "") {
        searchParams.set("categoryId", String(options.categoryId));
      }
      if (options.categoryOptionsParentId !== undefined && options.categoryOptionsParentId !== "") {
        searchParams.set("categoryOptionsParentId", String(options.categoryOptionsParentId));
      }
      if (options.scopeCategoryId !== undefined && options.scopeCategoryId !== "") {
        searchParams.set("scopeCategoryId", String(options.scopeCategoryId));
      }
      const query = searchParams.toString();
      return client.request<SearchProductsBffData>(`/api/bff/search/products${query ? `?${query}` : ""}`);
    }
  };
}

export type SearchApi = ReturnType<typeof createSearchApi>;
