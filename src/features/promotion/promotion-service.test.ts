import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PromotionActivitiesScreen } from "./components/PromotionActivitiesScreen";
import { PromotionActivityDetailScreen } from "./components/PromotionActivityDetailScreen";
import { PromotionRankCenterScreen } from "./components/PromotionRankCenterScreen";
import { PromotionRankingScreen } from "./components/PromotionRankingScreen";
import { PromotionRewardRecordsScreen } from "./components/PromotionRewardRecordsScreen";
import {
  getAllPromotionBenefits,
  getPromotionActivities,
  getPromotionActivityDetail,
  getPromotionBenefits,
  getPromotionHome,
  getPromotionRankCenter,
  getPromotionRanking,
  getPromotionRewardRecords,
  normalizeRewardRecordTab,
  normalizeTalentLevel
} from "./server/promotion-service";
import { fetchPromotionHomeOverviewData } from "./server/promotion-home-real-service";
import { fetchPromotionBenefitsData } from "./server/promotion-level-real-service";
import {
  createPromotionIncentiveRankingEmptyData,
  fetchPromotionRankingData
} from "./server/promotion-ranking-real-service";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";

const versionBasePath = "/h5-v/v1.0.9";

function withVersionBasePath<T>(fn: () => T): T {
  const previousBasePath = process.env.NEXT_PUBLIC_H5_BASE_PATH;
  process.env.NEXT_PUBLIC_H5_BASE_PATH = versionBasePath;

  try {
    return fn();
  } finally {
    if (previousBasePath === undefined) {
      delete process.env.NEXT_PUBLIC_H5_BASE_PATH;
    } else {
      process.env.NEXT_PUBLIC_H5_BASE_PATH = previousBasePath;
    }
  }
}

function expectNoBareLocalAssetUrls(html: string) {
  expect(html).not.toContain('src="/assets/');
  expect(html).not.toContain('href="/assets/');
  expect(html).not.toContain("url(/assets/");
}

describe("promotion service", () => {
  it("falls back to v1 when talent level is invalid", () => {
    expect(normalizeTalentLevel("bad-level")).toBe("v1");
  });

  it("returns level specific home theme and local visual assets", () => {
    const home = getPromotionHome("v5");

    expect(home.profile.level).toBe("v5");
    expect(home.profile.levelName).toBe("至尊达人");
    expect(home.theme.name).toBe("blackPurple");
    expect(home.theme.badgeAssetKey).toBe("promotion.talentBadge.v5");
    expect(home.theme.heroBackgroundAssetKey).toBe("promotion.talentHeroBg.v5");
    expect(home.theme.summaryCardAssetKey).toBe("promotion.talentSummaryCard.v5");
  });

  it("uses different units for sales and amount rankings", () => {
    const sales = getPromotionRanking("sales", "day");
    const amount = getPromotionRanking("amount", "week");

    expect(sales.rows[0]?.unit).toBe("单");
    expect(sales.activePeriod).toBe("day");
    expect(amount.rows[0]?.unit).toBe("元");
    expect(amount.activePeriod).toBe("week");
  });

  it("renders ranking pages with local podium assets and latest ranking layout", () => {
    const salesHtml = withVersionBasePath(() =>
      renderToStaticMarkup(createElement(PromotionRankingScreen, { data: getPromotionRanking("sales", "day") }))
    );
    const amountHtml = withVersionBasePath(() =>
      renderToStaticMarkup(createElement(PromotionRankingScreen, { data: getPromotionRanking("amount", "month") }))
    );

    expect(salesHtml).toContain(`background-image:url(${versionBasePath}/assets/shared/green-hero-bg.png)`);
    expect(salesHtml).toContain(`src="${versionBasePath}/assets/promotion/ranking/ranking-podium-card-first.png"`);
    expect(salesHtml).toContain(`src="${versionBasePath}/assets/promotion/ranking/ranking-crown-first.png"`);
    expect(salesHtml).toContain(`src="${versionBasePath}/assets/promotion/ranking/ranking-podium-card-second.png"`);
    expect(salesHtml).toContain(`src="${versionBasePath}/assets/promotion/ranking/ranking-podium-card-third.png"`);
    expect(salesHtml).toContain("达人销量榜");
    expect(salesHtml).toContain("达人激励榜");
    expect(salesHtml).toContain("SoulKeeper");
    expect(salesHtml).toContain("深圳喵小喵");
    expect(salesHtml).toContain("137单");
    expectNoBareLocalAssetUrls(salesHtml);

    expect(amountHtml).toContain(`background-image:url(${versionBasePath}/assets/shared/green-hero-bg.png)`);
    expect(amountHtml).toContain(`src="${versionBasePath}/assets/promotion/ranking/ranking-crown-second.png"`);
    expect(amountHtml).toContain("达人销售额榜");
    expect(amountHtml).toContain("¥9621374");
    expect(amountHtml).toContain("您未上榜");
    expectNoBareLocalAssetUrls(amountHtml);
  });

  it("renders incentive ranking as an empty state without current user bar", () => {
    const html = withVersionBasePath(() =>
      renderToStaticMarkup(createElement(PromotionRankingScreen, { data: createPromotionIncentiveRankingEmptyData("week") }))
    );

    expect(html).toContain("达人激励榜");
    expect(html).toContain("达人激励榜暂未开放");
    expect(html).toContain("<button");
    expect(html).not.toContain("您未上榜");
    expect(html).not.toContain("SoulKeeper");
    expectNoBareLocalAssetUrls(html);
  });

  it("renders unavailable rank center cards disabled", () => {
    const html = renderToStaticMarkup(createElement(PromotionRankCenterScreen, { data: getPromotionRankCenter() }));

    expect(html).toContain('href="/promotion/ranking/sales"');
    expect(html).toContain('href="/promotion/ranking/amount"');
    expect(html).not.toContain('href="/promotion/ranking/incentive"');
    expect(html).toContain("达人激励榜");
    expect(html).toContain("战队销量榜");
    expect(html).toContain("战队销售额榜");
    expect(html.match(/aria-disabled="true"/g)?.length).toBe(3);
    expect(html.match(/暂未开放/g)?.length).toBe(3);
  });

  it("returns activity center navigation targets", () => {
    const activities = getPromotionActivities();

    expect(activities.rewardRecordHref).toBe("/promotion/activities/reward-records");
    expect(activities.items.map((item) => ("href" in item ? item.href : undefined))).toEqual([
      "/promotion/activities/open-order-july",
      "/promotion/activities/pk-july",
      "/promotion/activities/pk-june"
    ]);
  });

  it("renders activity center cards and reward record as links", () => {
    const html = withVersionBasePath(() =>
      renderToStaticMarkup(createElement(PromotionActivitiesScreen, { data: getPromotionActivities() }))
    );

    expect(html).toContain('href="/promotion/activities/reward-records"');
    expect(html).toContain('href="/promotion/activities/open-order-july"');
    expect(html).toContain('href="/promotion/activities/pk-july"');
    expect(html).toContain('href="/promotion/activities/pk-june"');
    expect(html).toContain(`src="${versionBasePath}/assets/promotion/activities/order-reward-icon.png"`);
    expect(html).toContain(`src="${versionBasePath}/assets/promotion/activities/pk-reward-icon.png"`);
    expectNoBareLocalAssetUrls(html);
  });

  it("returns mapped activity detail data for current activity routes", () => {
    expect(getPromotionActivityDetail("open-order-july")?.title.highlight).toBe("开单");
    expect(getPromotionActivityDetail("pk-july")?.statusText).toBe("去领奖");
    expect(getPromotionActivityDetail("pk-june")?.statusText).toBe("活动已结束");
    expect(getPromotionActivityDetail("pk-june")?.periodText).toBe("活动时间：2026.6.1-2026.6.30");
    expect(getPromotionActivityDetail("bad-slug")).toBeNull();
  });

  it("renders activity detail hero with scalable coordinate layer and css action button", () => {
    const detail = getPromotionActivityDetail("pk-july");
    expect(detail).not.toBeNull();

    const html = withVersionBasePath(() =>
      renderToStaticMarkup(createElement(PromotionActivityDetailScreen, { data: detail! }))
    );

    expect(html).toContain("fixed left-1/2 top-0 z-40");
    expect(html).toContain("7月PK有礼");
    expect(html).toContain(`src="${versionBasePath}/assets/promotion/activity-details/pk-hero-bg.png"`);
    expect(html).toContain("--activity-scale");
    expect(html).toContain("translateX(-50%) scale(var(--activity-scale))");
    expect(html).toContain("去领奖");
    expect(html).toContain("当前排名");
    expect(html).toContain("981234");
    expect(html).toContain("活动时间：2026.7.1-2026.7.31");
    expect(html).toContain("gap-[10px]");
    expect(html).not.toContain('text-[20px] font-black leading-7" style="background-image');
    expect(html).toContain("flex w-full flex-col gap-4 overflow-hidden rounded-[12px] bg-fill-page px-2.5 pb-2 pt-2.5");
    expect(html).toContain("flex flex-col gap-1 rounded-[10px] bg-fill-white px-[11px] py-2.5");
    expect(html).toContain("absolute top-px -translate-x-1/2");
    expect(html).toContain("奖励规则");
    expect(html).toContain("border-l border-r border-fill-muted");
    expect(html).toContain("rounded-b-lg border-b");
    expectNoBareLocalAssetUrls(html);
  });

  it("returns reward record tab data with fallback", () => {
    expect(normalizeRewardRecordTab("bad-tab")).toBe("settled");

    const pending = getPromotionRewardRecords("pending");

    expect(pending.activeTab).toBe("pending");
    expect(pending.tabs.map((tab) => tab.href)).toEqual([
      "/promotion/activities/reward-records?tab=settled",
      "/promotion/activities/reward-records?tab=pending"
    ]);
    expect(pending.records[0]?.amount).toBe("¥98746.57");
  });

  it("returns pending reward records aligned with the design list values", () => {
    const pending = getPromotionRewardRecords("pending");

    expect(pending.records.map((record) => record.amount)).toEqual(["¥98746.57", "+4657", "+57", "+9874657", "+657"]);
  });

  it("renders reward record summary, tabs and records", () => {
    const html = withVersionBasePath(() =>
      renderToStaticMarkup(createElement(PromotionRewardRecordsScreen, { data: getPromotionRewardRecords("settled") }))
    );

    expect(html).toContain("奖励记录");
    expect(html).toContain("已获得奖励(元)");
    expect(html).toContain("2383.43");
    expect(html).toContain(`src="${versionBasePath}/assets/shared/green-hero-bg.png"`);
    expect(html).toContain("object-cover object-top");
    expect(html).toContain("grid-cols-[1fr_auto_1fr]");
    expect(html).toContain('role="tablist"');
    expect(html).toContain('role="tab"');
    expect(html).toContain('href="/promotion/activities/reward-records?tab=settled"');
    expect(html).toContain('href="/promotion/activities/reward-records?tab=pending"');
    expect(html).toContain("mt-3.5 flex flex-col gap-4 py-2.5");
    expect(html).toContain("flex min-h-[42px] items-center justify-between gap-3");
    expect(html).toContain("h-[21px] w-[22px]");
    expect(html).toContain("2026年8月奖励");
    expect(html).toContain("+98746.57");
    expectNoBareLocalAssetUrls(html);
  });

  it("returns v5 commission and benefits for benefits page", () => {
    const benefits = getPromotionBenefits("v5");

    expect(benefits.profile.levelName).toBe("至尊达人");
    expect(benefits.commission.label).toBe("基础 * 200%");
    expect(benefits.exclusiveBenefits.length).toBeGreaterThan(0);
    expect(benefits.memberBenefits.length).toBeGreaterThan(0);
  });

  it("returns all five benefit levels for client switching", () => {
    const benefits = getAllPromotionBenefits();

    expect(benefits.map((item) => item.profile.level)).toEqual(["v1", "v2", "v3", "v4", "v5"]);
    expect(benefits.map((item) => item.theme.badgeAssetKey)).toEqual([
      "promotion.talentBadge.v1",
      "promotion.talentBadge.v2",
      "promotion.talentBadge.v3",
      "promotion.talentBadge.v4",
      "promotion.talentBadge.v5"
    ]);
  });
});

describe("promotion home real api service", () => {
  it("requests Java promotion overview and maps it to the existing home view model", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      if (path === "/p/distribution/home/overview") {
        return makeBackendSuccess({
          code: "00000",
          data: {
            userInfo: {
              nickName: "真实达人",
              pic: "/avatar/me.png"
            },
            level: {
              levelInfo: {
                currentLevelName: "星钻达人",
                currentLevelValue: 4,
                gapOrderCount: 20,
                nextLevelName: "至尊达人",
                nextUpgradeOrderCount: 100
              }
            },
            mySales: {
              totalCommission: 128.5,
              totalOrderAmount: 6789,
              totalOrderCount: 12
            },
            ongoingIncentiveCount: 2,
            salesStats: {
              todayPromotionIncome: 8.5,
              todayPromotionOrderCount: 3,
              todayShopVisitCount: 9,
              totalPromotionOrderCount: 88,
              totalShopFavoriteCount: 6,
              totalShopVisitCount: 999
            }
          },
          msg: "ok",
          success: true
        });
      }
      throw new Error(`Unexpected path ${path}`);
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    const result = await fetchPromotionHomeOverviewData({
      backendClient: { request },
      javaOssAssetBaseUrl: "https://oss.example.com/"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.profile).toMatchObject({
        avatar: "https://oss.example.com/avatar/me.png",
        level: "v4",
        levelName: "星钻达人",
        nickname: "真实达人"
      });
      expect(result.data.profile.progress).toMatchObject({
        current: 80,
        target: 100
      });
      expect(result.data.summary).toEqual({
        currency: "CNY",
        totalCommission: 128.5,
        totalSalesAmount: 6789
      });
      expect(result.data.quickEntries[0]?.subtitle).toBe("2个进行中");
      expect(result.data.metrics).toEqual([
        { id: "todayVisits", label: "今日店铺访问", value: "+9" },
        { id: "todayOrders", label: "今日带货订单", value: "+3" },
        { id: "todayIncome", label: "今日带货收益", value: "¥8.50" },
        { id: "totalVisits", label: "累计店铺访问", value: "999" },
        { id: "totalOrders", label: "累计带货订单", value: "88" },
        { id: "totalFavorites", label: "累计店铺收藏", value: "6" }
      ]);
    }
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        backend: "java",
        method: "GET",
        path: "/p/distribution/home/overview",
        route: "/promotion"
      })
    );
  });
});

describe("promotion benefits real api service", () => {
  it("requests my level and level list, then maps switchable benefit levels", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      if (path === "/p/daren/level/myLevel") {
        return makeBackendSuccess({
          data: {
            commissionMultiplier: 1.5,
            currentLevelName: "黄金达人",
            currentLevelValue: 3,
            gapOrderCount: 4,
            nextLevelName: "星钻达人",
            nextUpgradeOrderCount: 20
          },
          success: true
        });
      }
      if (path === "/p/daren/level/list") {
        return makeBackendSuccess({
          data: [
            {
              levelName: "新锐达人",
              levelValue: 1,
              displayBenefits: [{ benefitName: "基础佣金", benefitDesc: "V1权益", displayBenefitId: 1 }]
            },
            {
              commissionMultiplier: 1.5,
              darenBenefitItems: ["专属培训"],
              levelName: "黄金达人",
              levelValue: 3,
              upgradeOrderCount: 20
            },
            {
              benefitText: "头部达人权益",
              levelName: "至尊达人",
              levelValue: 5,
              upgradeGmv: 10000
            }
          ],
          success: true
        });
      }
      throw new Error(`Unexpected path ${path}`);
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    const result = await fetchPromotionBenefitsData({
      backendClient: { request }
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.activeLevel).toBe("v3");
      expect(result.data.levels.map((level) => level.profile.level)).toEqual(["v1", "v3", "v5"]);
      expect(result.data.levels[1]?.profile.progress).toMatchObject({
        current: 16,
        target: 20
      });
      expect(result.data.levels[1]?.commission.label).toBe("基础 * 150%");
      expect(result.data.levels[1]?.memberBenefits[0]?.title).toBe("专属培训");
    }

    expect(request).toHaveBeenCalledWith(expect.objectContaining({ path: "/p/daren/level/myLevel", route: "/promotion/benefits" }));
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ path: "/p/daren/level/list", route: "/promotion/benefits" }));
  });
});

describe("promotion ranking real api service", () => {
  it("requests Java ranking list and maps my rank from the same response", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      if (path === "/p/distribution/rank/list?period=2&rankType=1&statPeriod=2026-W26") {
        return makeBackendSuccess({
          data: {
            endTime: "2026-06-28 23:59:59",
            myRank: {
              nickName: "真实达人",
              onRank: true,
              pic: "/me.png",
              rankNo: 8,
              score: 7
            },
            period: 2,
            rankList: [
              { nickName: "第一达人", pic: "/a.png", rankNo: 1, score: 19 },
              { nickName: "第二达人", rankNo: 2, score: 12 },
              { nickName: "第三达人", rankNo: 3, score: 10 },
              { nickName: "第四达人", rankNo: 4, score: 8 }
            ],
            rankType: 1,
            startTime: "2026-06-22 00:00:00",
            statPeriod: "2026-W26"
          },
          success: true
        });
      }
      throw new Error(`Unexpected path ${path}`);
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    const result = await fetchPromotionRankingData({
      backendClient: { request },
      period: "week",
      rankingType: "sales",
      statPeriod: "2026-W26"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.activePeriod).toBe("week");
      expect(result.data.periodText).toBe("榜单周期：2026-06-22 00:00:00 - 2026-06-28 23:59:59");
      expect(result.data.rows[0]).toMatchObject({
        avatar: "/a.png",
        name: "第一达人",
        rank: 1,
        unit: "单",
        value: "19"
      });
      expect(result.data.rows[3]).toMatchObject({
        name: "第四达人",
        rank: 4,
        value: "8"
      });
      expect(result.data.currentUser).toMatchObject({
        name: "真实达人",
        onList: true,
        rank: 8,
        unit: "单",
        value: "7"
      });
    }

    expect(request).toHaveBeenCalledWith(expect.objectContaining({ path: "/p/distribution/rank/list?period=2&rankType=1&statPeriod=2026-W26" }));
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("maps amount ranking as empty real data without mock rows", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      if (path === "/p/distribution/rank/list?period=1&rankType=2") {
        return makeBackendSuccess({
          data: {
            myRank: {
              onRank: false,
              score: 0
            },
            period: 1,
            rankList: [],
            rankType: 2
          },
          success: true
        });
      }
      throw new Error(`Unexpected path ${path}`);
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    const result = await fetchPromotionRankingData({
      backendClient: { request },
      period: "bad-period",
      rankingType: "amount"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.activePeriod).toBe("day");
      expect(result.data.rows).toEqual([]);
      expect(result.data.currentUser).toMatchObject({
        name: "喵呜达人",
        onList: false,
        rank: 0,
        unit: "元",
        value: "--"
      });
    }
    expect(request).toHaveBeenCalledTimes(1);
  });
});

function makeBackendSuccess<T>(data: T): BackendApiResult<T> {
  return {
    data,
    meta: {
      appEnv: "test",
      backend: "java",
      h5Version: "test",
      requestId: "req-promotion-home",
      route: "/promotion"
    },
    ok: true
  };
}
