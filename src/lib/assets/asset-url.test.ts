import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { assetUrl } from "./asset-url";
import { localAssetPaths, localAssetUrl } from "./local-assets";

describe("assetUrl", () => {
  it("prefixes local public assets with the H5 basePath", () => {
    expect(assetUrl("/assets/home/banner-renewal.webp", { basePath: "/hybird" })).toBe(
      "/hybird/assets/home/banner-renewal.webp"
    );
  });

  it("uses the public asset CDN prefix when provided", () => {
    expect(
      assetUrl("assets/icons/home.svg", {
        assetBaseUrl: "https://cdn.example.com/meumall/h5/2026.06.01-001/"
      })
    ).toBe("https://cdn.example.com/meumall/h5/2026.06.01-001/assets/icons/home.svg");
  });

  it("keeps absolute and data URLs unchanged", () => {
    expect(assetUrl("https://img.example.com/a.png", { basePath: "/hybird" })).toBe("https://img.example.com/a.png");
    expect(assetUrl("data:image/svg+xml;base64,abc", { assetBaseUrl: "https://cdn.example.com" })).toBe(
      "data:image/svg+xml;base64,abc"
    );
  });

  it("normalizes duplicate slashes without changing protocol separators", () => {
    expect(assetUrl("//assets//home//banner.png", { basePath: "/hybird/" })).toBe("/hybird/assets/home/banner.png");
  });

  it("resolves registered local assets through the same URL rules", () => {
    expect(localAssetPaths["shared.greenHeroBg"]).toBe(
      "/assets/shared/green-hero-bg.png"
    );
    expect(localAssetPaths["promotion.talentBadge.v1"]).toBe(
      "/assets/promotion/talent-badges/talent-badge-v1.png"
    );
    expect(localAssetPaths["promotion.talentHeroBg.v2"]).toBe(
      "/assets/promotion/talent-badges/talent-hero-bg-v2.png"
    );
    expect(localAssetPaths["promotion.talentSummaryCard.v3"]).toBe(
      "/assets/promotion/talent-badges/talent-summary-card-v3.png"
    );
    expect(localAssetPaths["promotion.equityHeroBg.v4"]).toBe(
      "/assets/promotion/equity/equity-bg-v4.png"
    );
    expect(localAssetPaths["promotion.equityIcon.ai"]).toBe(
      "/assets/promotion/equity/equity-icon-ai.png"
    );
    expect(localAssetPaths["promotion.activityIcon.order"]).toBe(
      "/assets/promotion/activities/order-reward-icon.png"
    );
    expect(localAssetPaths["promotion.activityDetailHero.pk"]).toBe(
      "/assets/promotion/activity-details/pk-hero-bg.png"
    );
    expect(localAssetPaths["promotion.rewardRecordsBg"]).toBe(
      "/assets/shared/green-hero-bg.png"
    );
    expect(localAssetPaths["promotion.rankingHeroBg"]).toBe(
      "/assets/shared/green-hero-bg.png"
    );
    expect(localAssetPaths["promotion.rankingPodium.first"]).toBe(
      "/assets/promotion/ranking/ranking-podium-card-first.png"
    );
    expect(localAssetPaths["promotion.rankingCrown.third"]).toBe(
      "/assets/promotion/ranking/ranking-crown-third.png"
    );
    expect(localAssetPaths["common.icon.search"]).toBe(
      "/assets/common/icons/search.png"
    );
    expect(localAssetPaths["common.icon.close"]).toBe(
      "/assets/common/icons/close.png"
    );
    expect(localAssetPaths["common.icon.delete"]).toBe(
      "/assets/common/icons/delete.png"
    );
    expect(localAssetPaths["promotion.icon.share"]).toBe(
      "/assets/promotion/icons/share.png"
    );
    expect(localAssetPaths["promotion.icon.collect"]).toBe(
      "/assets/promotion/icons/collect.png"
    );
    expect(localAssetPaths["seckill.heroBg"]).toBe(
      "/assets/seckill/seckill-hero-bg.png"
    );
    expect(localAssetUrl("promotion.talentBadge.v5", { basePath: "/hybird" })).toBe(
      "/hybird/assets/promotion/talent-badges/talent-badge-v5.png"
    );
    expect(localAssetUrl("promotion.talentSummaryCard.v5", { basePath: "/hybird" })).toBe(
      "/hybird/assets/promotion/talent-badges/talent-summary-card-v5.png"
    );
    expect(localAssetUrl("promotion.equityArrow.next", { basePath: "/h5-v/v1.0.8" })).toBe(
      "/h5-v/v1.0.8/assets/promotion/equity/equity-arrow-next.png"
    );
    expect(localAssetUrl("promotion.rewardRecordsBg", { basePath: "/h5-v/v1.0.9" })).toBe(
      "/h5-v/v1.0.9/assets/shared/green-hero-bg.png"
    );
    expect(localAssetUrl("promotion.rankingHeroBg", { basePath: "/h5-v/v1.0.9" })).toBe(
      "/h5-v/v1.0.9/assets/shared/green-hero-bg.png"
    );
    expect(localAssetUrl("promotion.rankingPodium.first", { basePath: "/h5-v/v1.0.9" })).toBe(
      "/h5-v/v1.0.9/assets/promotion/ranking/ranking-podium-card-first.png"
    );
    expect(localAssetUrl("seckill.heroBg", { basePath: "/h5-v/v1.2.0" })).toBe(
      "/h5-v/v1.2.0/assets/seckill/seckill-hero-bg.png"
    );
  });

  it("uses static env references so Next can inline client asset config", () => {
    const source = readFileSync(join(process.cwd(), "src/lib/assets/asset-url.ts"), "utf8");

    expect(source).not.toContain("process.env[");
    expect(source).toContain("process.env.NEXT_PUBLIC_H5_ASSET_BASE_URL");
    expect(source).toContain("process.env.NEXT_PUBLIC_H5_BASE_PATH");
  });

  it("keeps Next basePath aligned with the public client basePath", () => {
    const source = readFileSync(join(process.cwd(), "next.config.ts"), "utf8");

    expect(source).toContain("process.env.NEXT_PUBLIC_H5_BASE_PATH");
  });
});
