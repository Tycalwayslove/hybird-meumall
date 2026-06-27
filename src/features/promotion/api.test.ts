import { describe, expect, test, vi } from "vitest";
import type { H5BffResult } from "@/lib/http";
import type { PromotionHomeData, RankingData } from "./types";
import { createPromotionApi } from "./api";
import type { PromotionHttpClient } from "./api";
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
});

function makeClient<T>(result: H5BffResult<T>): { request: PromotionHttpClient["request"] & ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn(async () => result) as unknown as PromotionHttpClient["request"] & ReturnType<typeof vi.fn>
  };
}
