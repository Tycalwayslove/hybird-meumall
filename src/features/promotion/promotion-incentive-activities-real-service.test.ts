import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { PromotionActivitiesScreen } from "./components/PromotionActivitiesScreen";
import { PromotionActivityDetailScreen } from "./components/PromotionActivityDetailScreen";
import {
  createPromotionIncentiveActivitiesBffData,
  createPromotionIncentiveActivityDetailBffData,
  fetchPromotionIncentiveActivitiesData,
  fetchPromotionIncentiveActivityDetailData,
  receivePromotionIncentiveReward
} from "./server/promotion-incentive-activities-real-service";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";

describe("promotion incentive activities real service", () => {
  it("maps four incentive activity types to activity center cards", () => {
    const data = createPromotionIncentiveActivitiesBffData({
      page: { current: 1, size: 10 },
      pagedActivities: {
        current: 1,
        pages: 1,
        records: [
          { currentProgress: 80, displayState: 2, id: 11, incentiveType: 1, saleCount: 8, title: "销量达标活动" },
          { currentProgress: 45, displayState: 2, gmv: 1024.5, id: 12, incentiveType: 2, title: "GMV达标活动" },
          { displayState: 4, id: 13, incentiveType: 3, rankThresholdVal: 10, saleRank: 6, title: "销量排行活动" },
          { displayState: 5, gmvRank: 18, id: 14, incentiveType: 4, rankThresholdVal: 10, title: "GMV排行活动" }
        ],
        size: 10,
        total: 4
      }
    });

    expect(data.activeCount).toBe(3);
    expect(data.items.map((item) => item.href)).toEqual([
      "/promotion/activities/11",
      "/promotion/activities/12",
      "/promotion/activities/13",
      "/promotion/activities/14"
    ]);
    expect(data.items.map((item) => item.progressValue)).toEqual(["8单", "¥1024.5", "第6名", "第18名"]);
    expect(data.items[2]?.statusText).toBe("领奖中");
    expect(data.items[3]?.status).toBe("ended");
  });

  it("renders real activity cards without mock route slugs", () => {
    const data = createPromotionIncentiveActivitiesBffData({
      page: { current: 1, size: 10 },
      pagedActivities: {
        records: [
          {
            currentProgress: 100,
            description: "完成 10 单可得现金",
            displayState: 2,
            id: 1001,
            incentiveType: 1,
            saleCount: 10,
            title: "7月开单有礼"
          }
        ]
      }
    });

    const html = renderToStaticMarkup(createElement(PromotionActivitiesScreen, { data }));

    expect(html).toContain('href="/promotion/activities/1001"');
    expect(html).toContain("7月开单有礼");
    expect(html).toContain("10单");
    expect(html).not.toContain("open-order-july");
  });

  it("combines detail and reward data for activity detail view", () => {
    const data = createPromotionIncentiveActivityDetailBffData({
      detail: {
        banner: "https://cdn.example.com/activity.png",
        completedDistributorCount: 128,
        description: "销售额TOP10可获额外激励",
        displayState: 4,
        endTime: "2026-07-31 23:59:59",
        id: 2001,
        incentiveType: 4,
        progress: {
          currentProgress: 70,
          gmv: 98000,
          gmvRank: 3
        },
        rewards: [
          {
            description: "前三名奖励",
            id: 501,
            prizes: [{ cashAmount: 888, id: 701, prizeName: "现金奖励", prizeType: 1, prizeCount: 1 }],
            rankFrom: 1,
            rankTo: 3,
            sort: 1
          }
        ],
        ruleSummary: "GMV 排名前三可得现金奖励",
        startTime: "2026-07-01 00:00:00",
        title: "7月GMV PK有礼"
      },
      reward: {
        details: [
          {
            deliverState: 0,
            id: 9001,
            prizeName: "现金奖励",
            prizeType: 1
          }
        ],
        id: 2001,
        incentiveType: 4,
        isAwarded: 1,
        rewardId: 501
      }
    });

    expect(data.bannerUrl).toBe("https://cdn.example.com/activity.png");
    expect(data.statusText).toBe("去领奖");
    expect(data.statusKind).toBe("primary");
    expect(data.periodText).toBe("活动时间：2026.7.1-2026.7.31");
    expect(data.metrics.kind).toBe("split");
    expect(data.rewards?.[0]?.canReceive).toBe(true);
    expect(data.rewards?.[0]?.receiveRecordId).toBe("9001");

    const html = renderToStaticMarkup(createElement(PromotionActivityDetailScreen, { data }));

    expect(html).toContain('src="https://cdn.example.com/activity.png"');
    expect(html).toContain("我的奖励");
    expect(html).toContain("待领取");
    expect(html).toContain("现金奖励");
  });

  it("requests Java list and detail endpoints", async () => {
    const backendClient = makeBackendClient([
      {
        code: "00000",
        data: {
          records: [{ displayState: 2, id: 1, incentiveType: 1, title: "销量活动" }]
        },
        success: true
      },
      {
        code: "00000",
        data: {
          displayState: 2,
          id: 1,
          incentiveType: 1,
          progress: { currentProgress: 20, saleCount: 2 },
          rewards: [],
          title: "销量活动"
        },
        success: true
      },
      {
        code: "00000",
        data: {
          details: [],
          id: 1,
          incentiveType: 1,
          isAwarded: 0
        },
        success: true
      }
    ]);

    await fetchPromotionIncentiveActivitiesData({
      authToken: "mall-token",
      backendClient,
      current: 2,
      size: 5
    });
    await fetchPromotionIncentiveActivityDetailData({
      activityId: "1",
      authToken: "mall-token",
      backendClient
    });

    expect(backendClient.request).toHaveBeenNthCalledWith(1, expect.objectContaining({
      method: "GET",
      path: "/p/app/distribution/incentive/page?current=2&size=5",
      route: "/promotion/activities"
    }));
    expect(backendClient.request).toHaveBeenNthCalledWith(2, expect.objectContaining({
      method: "GET",
      path: "/p/app/distribution/incentive/detail/1"
    }));
    expect(backendClient.request).toHaveBeenNthCalledWith(3, expect.objectContaining({
      method: "GET",
      path: "/p/app/distribution/incentive/reward/detail/1"
    }));
  });

  it("forwards reward receive requests with PATCH and addressId", async () => {
    const backendClient = makeBackendClient([
      {
        code: "00000",
        data: null,
        success: true
      }
    ]);

    const result = await receivePromotionIncentiveReward({
      addressId: 3001,
      authToken: "mall-token",
      backendClient,
      recordId: "9001"
    });

    expect(result.ok).toBe(true);
    expect(backendClient.request).toHaveBeenCalledWith(expect.objectContaining({
      body: { addressId: 3001 },
      method: "PATCH",
      path: "/p/app/distribution/incentive/reward/receive/9001"
    }));
  });
});

function makeBackendClient(responses: unknown[]) {
  const request = vi.fn(async <T,>() => {
    const response = responses.shift();
    return {
      ok: true,
      data: response as T,
      meta: {
        appEnv: "test",
        backend: "java",
        h5Version: "test",
        requestId: "req-incentive",
        route: "/promotion/activities"
      }
    } satisfies BackendApiResult<T>;
  });

  return {
    request: request as unknown as (<T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>) & ReturnType<typeof vi.fn>
  };
}
