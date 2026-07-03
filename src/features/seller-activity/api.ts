import type { H5BffResult, H5RequestOptions } from "@/lib/http";

import type {
  SellerActivitiesBffData,
  SellerActivityBatchStatusInput,
  SellerActivityDetailBffData,
  SellerActivityMutationBffData,
  SellerActivityProductsBffData,
  SellerActivitySaveInput,
  SellerAvailableProductsBffData
} from "./server/seller-activity-service";
import type { SellerActivityStatus } from "./types";

type SellerActivityHttpClient = {
  request<T>(path: string, options?: H5RequestOptions): Promise<H5BffResult<T>>;
};

export type SellerActivityProductsParams = {
  current?: number;
  size?: number;
  status: SellerActivityStatus;
};

export type SellerAvailableProductsParams = {
  categoryId?: number | string;
  current?: number;
  keyword?: string;
  orderBy?: string;
  size?: number;
};

export function createSellerActivityApi(client: SellerActivityHttpClient) {
  return {
    batchStatus(input: SellerActivityBatchStatusInput) {
      return client.request<SellerActivityMutationBffData>("/api/bff/seller-activities/batch-status", {
        body: input,
        method: "POST"
      });
    },
    getActivities() {
      return client.request<SellerActivitiesBffData>("/api/bff/seller-activities");
    },
    getActivityProducts(activityId: string | number, params: SellerActivityProductsParams) {
      return client.request<SellerActivityProductsBffData>(
        withQuery(`/api/bff/seller-activities/${activityId}/products`, {
          current: params.current ?? 1,
          size: params.size ?? 10,
          status: params.status
        })
      );
    },
    getAvailableProducts(activityId: string | number, params: SellerAvailableProductsParams = {}) {
      return client.request<SellerAvailableProductsBffData>(
        withQuery(`/api/bff/seller-activities/${activityId}/available-products`, {
          categoryId: params.categoryId,
          current: params.current ?? 1,
          keyword: params.keyword,
          orderBy: params.orderBy,
          size: params.size ?? 10
        })
      );
    },
    getProductDetail(activityId: string | number, prodId: string | number) {
      return client.request<SellerActivityDetailBffData>(`/api/bff/seller-activities/${activityId}/products/${prodId}`);
    },
    saveActivity(input: SellerActivitySaveInput) {
      return client.request<SellerActivityMutationBffData>("/api/bff/seller-activities/save-or-update", {
        body: input,
        method: "POST"
      });
    }
  };
}

export type SellerActivityApi = ReturnType<typeof createSellerActivityApi>;

function withQuery(path: string, params: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}
