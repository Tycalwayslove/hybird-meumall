import { describe, expect, test, vi } from "vitest";
import type { H5BffResult } from "@/lib/http";
import type { PromotionHomeData, RankingData } from "./types";
import { createPromotionApi } from "./api";
import type { PromotionHttpClient } from "./api";
import type {
  PromotionIncentiveActivityDetailBffData,
  PromotionIncentiveRewardDetailBffData
} from "./server/promotion-incentive-activities-real-service";
import type { PromotionProductsBffData } from "./server/promotion-products-real-service";

describe("promotion api", () => {
  test("centralizes promotion BFF endpoints", async () => {
    const expectedResult = {
      success: true,
      data: {} as PromotionHomeData,
      requestId: "req-promotion-home"
    } satisfies H5BffResult<PromotionHomeData>;
    const client = makeClient(expectedResult);
    const api = createPromotionApi(client);

    const result = await api.getHome({ level: "v3" });

    expect(client.request).toHaveBeenCalledWith("/api/bff/promotion/home?level=v3");
    expect(result).toBe(expectedResult);
  });

  test("builds ranking endpoint with encoded period", async () => {
    const expectedResult = {
      success: true,
      data: {} as RankingData,
      requestId: "req-ranking"
    } satisfies H5BffResult<RankingData>;
    const client = makeClient(expectedResult);
    const api = createPromotionApi(client);

    await api.getRanking("sales", { period: "week" });

    expect(client.request).toHaveBeenCalledWith("/api/bff/promotion/rankings/sales?period=week");
  });

  test("omits empty optional query params", async () => {
    const expectedResult = {
      success: true,
      data: {} as RankingData,
      requestId: "req-ranking"
    } satisfies H5BffResult<RankingData>;
    const client = makeClient(expectedResult);
    const api = createPromotionApi(client);

    await api.getRanking("amount");

    expect(client.request).toHaveBeenCalledWith("/api/bff/promotion/rankings/amount");
  });

  test("centralizes promotion product endpoint with defaults and filters", async () => {
    const expectedResult = {
      success: true,
      data: {} as PromotionProductsBffData,
      requestId: "req-promotion-products"
    } satisfies H5BffResult<PromotionProductsBffData>;
    const client = makeClient(expectedResult);
    const api = createPromotionApi(client);

    await api.getProducts({
      categoryId2: 10,
      current: 2,
      prodName: "短袖",
      sort: 4
    });

    expect(client.request).toHaveBeenCalledWith("/api/bff/promotion/products?categoryId2=10&current=2&prodName=%E7%9F%AD%E8%A2%96&size=10&sort=4");
  });

  test("centralizes promotion incentive activity endpoints", async () => {
    const expectedResult = {
      success: true,
      data: {} as PromotionIncentiveActivityDetailBffData,
      requestId: "req-promotion-activity"
    } satisfies H5BffResult<PromotionIncentiveActivityDetailBffData>;
    const rewardResult = {
      success: true,
      data: {} as PromotionIncentiveRewardDetailBffData,
      requestId: "req-promotion-activity-reward"
    } satisfies H5BffResult<PromotionIncentiveRewardDetailBffData>;
    const client = {
      request: vi.fn(async (path: string) => path.endsWith("/reward") ? rewardResult : expectedResult)
    } as { request: PromotionHttpClient["request"] & ReturnType<typeof vi.fn> };
    const api = createPromotionApi(client);

    await api.getActivities({ current: 2, orderBy: "-createTime", size: 6 });
    await api.getActivityDetail(1001);
    await api.getActivityReward(1001);

    expect(client.request).toHaveBeenNthCalledWith(1, "/api/bff/promotion/activities?current=2&orderBy=-createTime&size=6");
    expect(client.request).toHaveBeenNthCalledWith(2, "/api/bff/promotion/activities/1001");
    expect(client.request).toHaveBeenNthCalledWith(3, "/api/bff/promotion/activities/1001/reward");
  });
});

function makeClient<T>(result: H5BffResult<T>): { request: PromotionHttpClient["request"] & ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn(async () => result) as unknown as PromotionHttpClient["request"] & ReturnType<typeof vi.fn>
  };
}
