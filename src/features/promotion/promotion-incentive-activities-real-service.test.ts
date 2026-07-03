import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { PromotionActivitiesScreen, PromotionActivityHistoryScreen } from "./components/PromotionActivitiesScreen";
import { PromotionActivityDetailScreen } from "./components/PromotionActivityDetailScreen";
import { PromotionActivityRulesScreen } from "./components/PromotionActivityRulesScreen";
import {
  createPromotionIncentiveActivitiesBffData,
  createPromotionIncentiveActivityDetailBffData,
  createPromotionIncentiveRewardDetailBffData,
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
    expect(data.items.map((item) => item.progressValue)).toEqual(["80%", "45%", "6", "18"]);
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

    const html = renderToStaticMarkup(createElement(PromotionActivitiesScreen, {
      ongoingData: data,
      pausedData: createEmptyActivitiesData()
    }));

    expect(html).toContain('href="/promotion/activities/1001"');
    expect(html).toContain("7月开单有礼");
    expect(html).toContain("100%");
    expect(html).toContain("当前");
    expect(html).toContain("0");
    expect(html).toContain("个已暂停");
    expect(html).toContain("暂无已暂停的活动");
    expect(html).not.toContain("open-order-july");
  });

  it("renders activity center history entry and hides it on history page", () => {
    const data = createPromotionIncentiveActivitiesBffData({
      page: { current: 1, size: 10 },
      pagedActivities: {
        records: [
          {
            currentProgress: 100,
            displayState: 6,
            id: 1002,
            incentiveType: 2,
            title: "历史GMV活动"
          }
        ],
        total: 1
      }
    });

    const centerHtml = renderToStaticMarkup(createElement(PromotionActivitiesScreen, {
      ongoingData: createEmptyActivitiesData(),
      pausedData: data
    }));
    const historyHtml = renderToStaticMarkup(createElement(PromotionActivityHistoryScreen, { data }));

    expect(centerHtml).toContain('href="/promotion/activities/history"');
    expect(historyHtml).toContain("历史活动");
    expect(historyHtml).not.toContain('href="/promotion/activities/history"');
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
        ruleContent: "<p>GMV 达标后发放奖励</p><script>alert(1)</script>",
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
    expect(data.actionHref).toBe("/promotion/activities/2001/reward?mode=receive");
    expect(data.ruleHref).toBe("/promotion/activities/2001/rules");
    expect(data.ruleContentHtml).toBe("<p>GMV 达标后发放奖励</p>");

    const html = renderToStaticMarkup(createElement(PromotionActivityDetailScreen, { data }));

    expect(html).toContain('src="https://cdn.example.com/activity.png"');
    expect(html).toContain('href="/promotion/activities/2001/rules"');
    expect(html).toContain("活动规则");
    expect(html).not.toContain("7月GMV PK有礼");
    expect(html).not.toContain("GMV 排名前三可得现金奖励");
    expect(html).toContain("我的奖励");
    expect(html).toContain("待领取");
    expect(html).toContain("现金奖励");
  });

  it("maps activity detail progress copy for threshold and ranking incentives", () => {
    const saleData = createPromotionIncentiveActivityDetailBffData({
      detail: {
        completedDistributorCount: 1718,
        displayState: 2,
        id: 5101,
        incentiveType: 1,
        progress: {
          alreadyRewardId: 1,
          currentProgress: 55,
          saleCount: 5
        },
        rewards: [
          { id: 1, prizes: [{ cashAmount: 5, id: 11, prizeName: "现金", prizeType: 1 }], sort: 1, thresholdVal: 5 },
          { id: 2, prizes: [{ cashAmount: 10, id: 12, prizeName: "现金", prizeType: 1 }], sort: 2, thresholdVal: 10 }
        ]
      }
    });
    const amountData = createPromotionIncentiveActivityDetailBffData({
      detail: {
        completedDistributorCount: 8,
        displayState: 2,
        id: 5102,
        incentiveType: 2,
        progress: {
          currentProgress: 100,
          gmv: 10000,
          isAwarded: 1,
          alreadyRewardId: 3
        },
        rewards: [
          { id: 3, prizes: [{ cashAmount: 20, id: 13, prizeName: "现金", prizeType: 1 }], sort: 1, thresholdVal: 10000 }
        ]
      }
    });
    const saleRankData = createPromotionIncentiveActivityDetailBffData({
      detail: {
        displayState: 2,
        id: 5103,
        incentiveType: 3,
        progress: {
          currentProgress: 55,
          gmvRank: 1,
          saleRank: 18
        },
        rewards: [
          { id: 4, prizes: [{ cashAmount: 5, id: 14, prizeName: "现金", prizeType: 1 }], rankFrom: 1, rankTo: 20, sort: 1 },
          { id: 5, prizes: [{ cashAmount: 10, id: 15, prizeName: "现金", prizeType: 1 }], rankFrom: 1, rankTo: 10, sort: 2 },
          { id: 6, prizes: [{ cashAmount: 50, id: 16, prizeName: "现金", prizeType: 1 }], rankFrom: 1, rankTo: 1, sort: 3 }
        ]
      }
    });
    const amountRankData = createPromotionIncentiveActivityDetailBffData({
      detail: {
        displayState: 2,
        id: 5104,
        incentiveType: 4,
        progress: {
          currentProgress: 30,
          gmvRank: 42,
          saleRank: 1
        },
        rewards: [
          { id: 7, prizes: [{ cashAmount: 30, id: 17, prizeName: "现金", prizeType: 1 }], rankFrom: 1, rankTo: 20, sort: 1 }
        ]
      }
    });

    expect(saleData.progress).toMatchObject({
      amountLabels: ["0元", "5元", "10元"],
      completedText: "当前活动已有1718人完成",
      hintText: "您已获得5元激励金，再完成5单可获得10元奖励",
      milestoneLabels: ["0单", "5单", "10单"],
      percent: 55
    });
    expect(amountData.metrics).toMatchObject({ kind: "single", label: "累计销售额", value: "10000" });
    expect(amountData.progress).toMatchObject({
      complete: true,
      completedText: "当前活动已有8人完成",
      hintText: "您已获得20元激励金，请关注奖励发放状态"
    });
    expect(saleRankData.progress).toMatchObject({
      completedText: undefined,
      hintText: "您已进入TOP20，再提升8名可进入TOP10，可获得10元奖励",
      milestoneLabels: ["TOP20", "TOP10", "TOP1"],
      percent: 55
    });
    expect(amountRankData.metrics).toMatchObject({
      kind: "split",
      items: [
        { label: "当前排名", value: "42" },
        { label: "销售额", value: "0" }
      ]
    });
    expect(amountRankData.progress.hintText).toBe("再提升22名可进入TOP20，可获得30元奖励");
  });

  it("maps activity detail action by displayState", () => {
    const states = [0, 1, 2, 3, 4, 5].map((displayState) => createPromotionIncentiveActivityDetailBffData({
      detail: {
        displayState,
        id: 6000 + displayState,
        incentiveType: 1,
        progress: {
          currentProgress: 10,
          saleCount: 1
        },
        title: `状态${displayState}`
      }
    }));

    expect(states.map((state) => ({
      actionHref: state.actionHref,
      actionVisible: state.actionVisible,
      statusText: state.statusText
    }))).toEqual([
      { actionHref: undefined, actionVisible: false, statusText: "" },
      { actionHref: undefined, actionVisible: false, statusText: "" },
      { actionHref: "/promotion/products?incentiveId=6002", actionVisible: true, statusText: "去带货" },
      { actionHref: undefined, actionVisible: false, statusText: "" },
      { actionHref: "/promotion/activities/6004/reward?mode=receive", actionVisible: true, statusText: "去领奖" },
      { actionHref: "/promotion/activities/6005/reward?mode=view", actionVisible: true, statusText: "查看奖励" }
    ]);

    const hiddenActionHtml = renderToStaticMarkup(createElement(PromotionActivityDetailScreen, { data: states[0]! }));
    const carryingActionHtml = renderToStaticMarkup(createElement(PromotionActivityDetailScreen, { data: states[2]! }));

    expect(hiddenActionHtml).not.toContain("去带货");
    expect(carryingActionHtml).toContain('href="/promotion/products?incentiveId=6002"');
    expect(carryingActionHtml).toContain("去带货");
  });

  it("maps incentive reward detail data for receive and view page", () => {
    const data = createPromotionIncentiveRewardDetailBffData({
      reward: {
        gmv: 50000,
        id: 8101,
        incentiveTitle: "7月开单有礼",
        incentiveType: 2,
        isAwarded: 1,
        rewardDescription: "销售额达标奖励",
        rewardId: 10001,
        details: [
          {
            cashAmount: 10000,
            deliverState: 1,
            id: 9001,
            prizeName: "现金奖励",
            prizeType: 1
          },
          {
            addrId: 3001,
            address: "中兴路怡康花园2栋一单元903",
            area: "龙岗区",
            city: "深圳市",
            deliverState: 0,
            deliverType: 2,
            id: 9002,
            mobile: "13568976288",
            prizeCount: 10,
            prizeName: "喵呜定制T恤",
            prizeType: 3,
            province: "广东省",
            receiver: "周雅雯"
          },
          {
            deliverState: 2,
            id: 9003,
            prizeName: "限时秒杀优惠券",
            prizeType: 2
          }
        ]
      }
    });

    expect(data.view).toMatchObject({
      activityId: "8101",
      activityTitle: "7月开单有礼",
      completion: {
        activityLine: '您在"7月开单有礼"活动中',
        actionText: "成功完成销售额",
        valueText: "50000"
      }
    });
    expect(data.view?.rewards).toEqual([
      expect.objectContaining({
        actionText: "查看",
        canReceive: false,
        description: "现金奖励将直接发放到您的钱包",
        id: "9001",
        statusKind: "pending",
        statusText: "待发放",
        title: "现金奖励+10000"
      }),
      expect.objectContaining({
        actionText: "领取",
        addressId: 3001,
        addressText: "广东省深圳市龙岗区中兴路怡康花园2栋一单元903；周雅雯 13568976288",
        canReceive: true,
        deliverType: 2,
        id: "9002",
        prizeType: 3,
        statusKind: "ready",
        title: "喵呜定制T恤10件"
      }),
      expect.objectContaining({
        actionText: "查看",
        canReceive: false,
        id: "9003",
        statusKind: "done",
        statusText: "已发放",
        title: "限时秒杀优惠券"
      })
    ]);
  });

  it("renders activity rule content page from sanitized ruleContent", () => {
    const data = createPromotionIncentiveActivityDetailBffData({
      detail: {
        displayState: 2,
        id: 7001,
        incentiveType: 1,
        progress: {
          currentProgress: 100,
          saleCount: 12
        },
        ruleContent: "<h3>活动说明</h3><p>完成指定销量即可获得奖励。</p><img src=\"/rules/a.png\" onerror=\"alert(1)\" />",
        title: "规则测试"
      }
    });

    const html = renderToStaticMarkup(createElement(PromotionActivityRulesScreen, { data }));

    expect(html).toContain("活动规则");
    expect(html).toContain("活动说明");
    expect(html).toContain("完成指定销量即可获得奖励。");
    expect(html).toContain('src="/rules/a.png"');
    expect(html).not.toContain("onerror");
  });

  it("keeps activity detail renderable when backend optional collections are not arrays", () => {
    const data = createPromotionIncentiveActivityDetailBffData({
      detail: {
        displayState: 2,
        id: 3001,
        incentiveType: 1,
        progress: {
          alreadyRewardIds: {} as unknown as number[],
          currentProgress: 20,
          saleCount: 2
        },
        rewards: {} as unknown as [],
        ruleContent: { text: "完成任务可获得奖励" } as unknown as string,
        startTime: "2026-07-01 00:00:00",
        title: "7月销量有礼"
      },
      reward: {
        details: {} as unknown as [],
        id: 3001,
        incentiveType: 1,
        isAwarded: 0
      }
    });

    const html = renderToStaticMarkup(createElement(PromotionActivityDetailScreen, { data }));

    expect(html).toContain("去带货");
    expect(html).toContain("累计销量");
    expect(html).toContain("活动规则以页面展示和后端结算结果为准");
    expect(html).not.toContain("我的奖励");
  });

  it("does not request reward detail while reward flow is disabled", async () => {
    const backendClient = makeBackendClient([
      {
        code: "00000",
        data: {
          banner: "/banner/sale.jpg",
          displayState: 2,
          id: 101,
          incentiveType: 1,
          progress: {
            currentProgress: 100,
            saleCount: 35
          },
          rewards: [
            {
              description: "销量满5件奖励",
              id: 10101,
              prizes: [{ cashAmount: 5, id: 1, prizeName: "现金奖励", prizeType: 1 }],
              sort: 1,
              thresholdVal: 5
            }
          ],
          ruleContent: "销量冲冲冲",
          title: "暑期带货王-销量赛"
        },
        success: true
      }
    ]);
    const previousBaseUrl = process.env.JAVA_OSS_ASSET_BASE_URL;
    process.env.JAVA_OSS_ASSET_BASE_URL = "https://oss.example.com/";

    try {
      const result = await fetchPromotionIncentiveActivityDetailData({
        activityId: "101",
        authToken: "mall-token",
        backendClient
      });

      expect(result.ok).toBe(true);
      if (!result.ok) {
        return;
      }

      expect(backendClient.request).toHaveBeenCalledTimes(1);
      expect(backendClient.request).toHaveBeenCalledWith(expect.objectContaining({
        method: "GET",
        path: "/p/app/distribution/incentive/detail/101"
      }));
      expect(result.data.bannerUrl).toBe("https://oss.example.com/banner/sale.jpg");
      expect(result.data.id).toBe("101");
      expect(result.data.rewards).toEqual([]);

      const html = renderToStaticMarkup(createElement(PromotionActivityDetailScreen, { data: result.data }));

      expect(html).toContain("去带货");
      expect(html).toContain("35");
      expect(html).toContain("销量冲冲冲");
      expect(html).toContain('src="https://oss.example.com/banner/sale.jpg"');
      expect(html).not.toContain("我的奖励");
    } finally {
      if (previousBaseUrl === undefined) {
        delete process.env.JAVA_OSS_ASSET_BASE_URL;
      } else {
        process.env.JAVA_OSS_ASSET_BASE_URL = previousBaseUrl;
      }
    }
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
      }
    ]);

    await fetchPromotionIncentiveActivitiesData({
      authToken: "mall-token",
      backendClient,
      current: 2,
      displayStates: [1, 2, 3, 4],
      size: 5
    });
    await fetchPromotionIncentiveActivityDetailData({
      activityId: "1",
      authToken: "mall-token",
      backendClient
    });

    expect(backendClient.request).toHaveBeenNthCalledWith(1, expect.objectContaining({
      method: "GET",
      path: "/p/app/distribution/incentive/page?current=2&size=5&displayStates=1&displayStates=2&displayStates=3&displayStates=4",
      route: "/promotion/activities"
    }));
    expect(backendClient.request).toHaveBeenNthCalledWith(2, expect.objectContaining({
      method: "GET",
      path: "/p/app/distribution/incentive/detail/1"
    }));
    expect(backendClient.request).toHaveBeenCalledTimes(2);
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

function createEmptyActivitiesData() {
  return createPromotionIncentiveActivitiesBffData({
    page: { current: 1, size: 10 },
    pagedActivities: {
      records: [],
      total: 0
    }
  });
}

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
