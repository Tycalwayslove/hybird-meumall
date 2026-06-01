import type { HomeConfig } from "./types";

export const defaultHomeConfig: HomeConfig = {
  schemaVersion: "1.0",
  pageId: "home",
  configVersion: "fallback-2026.06.01",
  generatedAt: "2026-06-01T00:00:00Z",
  cache: {
    ttlSeconds: 300,
    staleWhileRevalidateSeconds: 1800
  },
  performance: {
    requestTimeoutMs: 4000,
    skeletonMinMs: 200,
    preloadImageCount: 1,
    lcpCandidateModuleId: "home-banner",
    telemetrySampleRate: 1
  },
  modules: [
    {
      id: "home-banner",
      type: "banner_carousel",
      enabled: true,
      sortOrder: 10,
      items: [
        {
          id: "banner-renewal",
          title: "续航一套D计划",
          imageUrl: "fallback://home-banner",
          alt: "续航一套D计划",
          event: {
            type: "h5_route",
            target: "/promotion",
            params: {
              source: "home_banner"
            }
          },
          trackingId: "home_banner_renewal",
          priority: true,
          enabled: true,
          sortOrder: 10
        }
      ]
    },
    {
      id: "home-category",
      type: "category_grid",
      enabled: true,
      sortOrder: 20,
      columns: 5,
      rows: 2,
      items: [
        { id: "cat-hot", name: "热门商品", event: { type: "h5_route", target: "/category" }, enabled: true, sortOrder: 10 },
        { id: "cat-fresh", name: "生鲜蔬菜", event: { type: "h5_route", target: "/category" }, enabled: true, sortOrder: 20 },
        { id: "cat-snack", name: "零食饮料", event: { type: "h5_route", target: "/category" }, enabled: true, sortOrder: 30 },
        { id: "cat-health", name: "保健品", event: { type: "h5_route", target: "/category" }, enabled: true, sortOrder: 40 },
        { id: "cat-beauty", name: "洗护彩妆", event: { type: "h5_route", target: "/category" }, enabled: true, sortOrder: 50 },
        { id: "cat-clean", name: "纸品家清", event: { type: "h5_route", target: "/category" }, enabled: true, sortOrder: 60 },
        { id: "cat-mom", name: "母婴用品", event: { type: "h5_route", target: "/category" }, enabled: true, sortOrder: 70 },
        { id: "cat-kitchen", name: "厨房家居", event: { type: "h5_route", target: "/category" }, enabled: true, sortOrder: 80 },
        { id: "cat-digital", name: "家电3C", event: { type: "h5_route", target: "/category" }, enabled: true, sortOrder: 90 },
        { id: "cat-more", name: "更多分类", event: { type: "h5_route", target: "/category" }, enabled: true, sortOrder: 100 }
      ]
    },
    {
      id: "home-activity",
      type: "activity_section",
      enabled: true,
      sortOrder: 30,
      title: "限时活动",
      displayMode: "card_grid",
      items: [
        {
          id: "act-seckill",
          kind: "promotion",
          title: "限时秒杀",
          subtitle: "让实惠飞一会",
          imageUrl: "fallback://activity-seckill",
          event: { type: "h5_route", target: "/seckill" },
          enabled: true,
          sortOrder: 10
        },
        {
          id: "act-promotion",
          kind: "promotion",
          title: "推广带货",
          subtitle: "佣金至高50%!",
          imageUrl: "fallback://activity-promotion",
          badge: "免费",
          event: { type: "h5_route", target: "/promotion" },
          enabled: true,
          sortOrder: 20
        }
      ]
    }
  ]
};
