import type { H5BffResult } from "@/lib/http";
import type { PromotionProductsBffData } from "./server/promotion-products-real-service";

export type PromotionProductsHttpClient = {
  request<T>(path: string): Promise<H5BffResult<T>>;
};

export type PromotionProductsParams = {
  categoryId2?: number;
  categoryId3?: number;
  current?: number;
  prodName?: string;
  size?: number;
  sort?: number;
};

export function createPromotionProductsApi(client: PromotionProductsHttpClient) {
  return {
    getProducts(params: PromotionProductsParams = {}) {
      const searchParams = new URLSearchParams({
        current: String(params.current ?? 1),
        size: String(params.size ?? 10)
      });

      appendOptionalParam(searchParams, "prodName", params.prodName);
      appendOptionalParam(searchParams, "sort", params.sort);
      appendOptionalParam(searchParams, "categoryId2", params.categoryId2);
      appendOptionalParam(searchParams, "categoryId3", params.categoryId3);

      return client.request<PromotionProductsBffData>(`/api/bff/promotion/products?${searchParams.toString()}`);
    }
  };
}

function appendOptionalParam(searchParams: URLSearchParams, key: string, value: string | number | undefined) {
  if (value === undefined || value === "") {
    return;
  }
  searchParams.set(key, String(value));
}

export type PromotionProductsApi = ReturnType<typeof createPromotionProductsApi>;
