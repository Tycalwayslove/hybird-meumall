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
      "/assets/promotion/reward-records/reward-records-bg.png"
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
      "/h5-v/v1.0.9/assets/promotion/reward-records/reward-records-bg.png"
    );
  });
});
