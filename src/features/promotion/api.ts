import type { H5BffResult } from "@/lib/http";
import type {
  PromotionActivitiesData,
  PromotionBenefitsData,
  PromotionHomeData,
  RankCenterData,
  RankingData,
  RankingPeriod,
  RankingType
} from "./types";

export type PromotionHttpClient = {
  request<T>(path: string): Promise<H5BffResult<T>>;
};

export type PromotionLevelOptions = {
  level?: string;
};

export type PromotionRankingOptions = {
  period?: RankingPeriod;
};

export function createPromotionApi(client: PromotionHttpClient) {
  return {
    getActivities() {
      return client.request<PromotionActivitiesData>("/api/bff/promotion/activities");
    },
    getBenefits(options: PromotionLevelOptions = {}) {
      return client.request<PromotionBenefitsData>(withQuery("/api/bff/promotion/benefits", options));
    },
    getHome(options: PromotionLevelOptions = {}) {
      return client.request<PromotionHomeData>(withQuery("/api/bff/promotion/home", options));
    },
    getRankCenter() {
      return client.request<RankCenterData>("/api/bff/promotion/rank-center");
    },
    getRanking(type: RankingType, options: PromotionRankingOptions = {}) {
      return client.request<RankingData>(withQuery(`/api/bff/promotion/rankings/${type}`, options));
    }
  };
}

function withQuery(path: string, params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `${path}?${query}` : path;
}
