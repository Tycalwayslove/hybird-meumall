import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { PromotionActivitiesScreen } from "./components/PromotionActivitiesScreen";
import { PromotionActivityDetailScreen } from "./components/PromotionActivityDetailScreen";
import { PromotionRankingScreen } from "./components/PromotionRankingScreen";
import { PromotionRewardRecordsScreen } from "./components/PromotionRewardRecordsScreen";
import {
  getAllPromotionBenefits,
  getPromotionActivities,
  getPromotionActivityDetail,
  getPromotionBenefits,
  getPromotionHome,
  getPromotionRanking,
  getPromotionRewardRecords,
  normalizeRewardRecordTab,
  normalizeTalentLevel
} from "./server/promotion-service";

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
