import type { H5BffResult } from "@/lib/http";
import type { CategoryListBffData } from "./server/category-real-service";

export type CategoryHttpClient = {
  request<T>(path: string): Promise<H5BffResult<T>>;
};

export function createCategoryApi(client: CategoryHttpClient) {
  return {
    getCategoryList() {
      return client.request<CategoryListBffData>("/api/bff/category/list");
    }
  };
}

export type CategoryApi = ReturnType<typeof createCategoryApi>;
