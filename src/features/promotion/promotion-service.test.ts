import { describe, expect, it } from "vitest";

import {
  getAllPromotionBenefits,
  getPromotionBenefits,
  getPromotionHome,
  getPromotionRanking,
  normalizeTalentLevel
} from "./server/promotion-service";

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
