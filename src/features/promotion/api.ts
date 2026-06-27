import type { H5BffResult } from "@/lib/http";
import type {
  PromotionActivitiesData,
  PromotionHomeData,
  RankCenterData,
  RankingData,
  RankingPeriod,
  RankingType
} from "./types";
import type { PromotionBenefitsBffData } from "./server/promotion-level-real-service";
import type { PromotionProductsBffData } from "./server/promotion-products-real-service";

export type PromotionHttpClient = {
  request<T>(path: string): Promise<H5BffResult<T>>;
};

export type PromotionLevelOptions = {
  level?: string;
};

export type PromotionRankingOptions = {
  period?: RankingPeriod;
  statPeriod?: string;
};

export type PromotionProductsParams = {
  categoryId2?: number;
  categoryId3?: number;
  current?: number;
  prodName?: string;
  size?: number;
  sort?: number;
};

export function createPromotionApi(client: PromotionHttpClient) {
  return {
    getActivities() {
      return client.request<PromotionActivitiesData>("/api/bff/promotion/activities");
    },
    getBenefits(options: PromotionLevelOptions = {}) {
      return client.request<PromotionBenefitsBffData>(withQuery("/api/bff/promotion/benefits", options));
    },
    getHome(options: PromotionLevelOptions = {}) {
      return client.request<PromotionHomeData>(withQuery("/api/bff/promotion/home", options));
    },
    getRankCenter() {
      return client.request<RankCenterData>("/api/bff/promotion/rank-center");
    },
    getRanking(type: RankingType, options: PromotionRankingOptions = {}) {
      return client.request<RankingData>(withQuery(`/api/bff/promotion/rankings/${type}`, options));
    },
    getProducts(params: PromotionProductsParams = {}) {
      return client.request<PromotionProductsBffData>(
        withQuery("/api/bff/promotion/products", {
          categoryId2: params.categoryId2,
          categoryId3: params.categoryId3,
          current: params.current ?? 1,
          prodName: params.prodName,
          size: params.size ?? 10,
          sort: params.sort
        })
      );
    }
  };
}

export type PromotionApi = ReturnType<typeof createPromotionApi>;

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
