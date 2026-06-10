import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import { buildHomeConfigUrl, fetchActiveHomeConfig, HomeConfigError, parseHomeConfig } from "./api";
import { defaultHomeConfig } from "./default-config";
import { HomeExperience } from "./components/HomeExperience";
import { HomeSkeleton } from "./HomeSkeleton";
import { getVisibleHomeModules, HomeModules } from "./HomeModules";
import { resolveHomeConfigState } from "./HomeScreen";
import { getHomeConfigCacheKey, readHomeConfigCache, writeHomeConfigCache } from "./home-cache";
import { homeExperienceData } from "./mock/home-page-data";
import type { ActivitySectionModule, CategoryGridModule, HomeConfig } from "./types";

describe("home config api", () => {
  test("fetches active prod config and validates the payload", async () => {
    const remoteConfig = makeHomeConfig("remote-001");
    const fetcher = vi.fn(async () => Response.json(remoteConfig)) as unknown as typeof fetch;

    const config = await fetchActiveHomeConfig({ fetcher, environment: "prod", timeoutMs: 1000 });

    expect(fetcher).toHaveBeenCalledWith(buildHomeConfigUrl("prod"), expect.objectContaining({ headers: { accept: "application/json" } }));
    expect(config.configVersion).toBe("remote-001");
  });

  test("rejects invalid config payloads", () => {
    expect(() => parseHomeConfig({ ...makeHomeConfig(), pageId: "profile" })).toThrow(HomeConfigError);
  });
});

describe("home config cache", () => {
  test("reads fresh cache and removes expired cache", () => {
    const storage = new MemoryStorage();
    const now = Date.parse("2026-06-01T00:00:00Z");
    const config = makeHomeConfig("cache-001");

    writeHomeConfigCache({ config, storage, now });

    expect(readHomeConfigCache({ storage, now: now + 299_000 })?.freshness).toBe("fresh");
    expect(readHomeConfigCache({ storage, now: now + 301_000 })?.freshness).toBe("stale");
    expect(readHomeConfigCache({ storage, now: now + 2_200_000 })).toBeNull();
    expect(storage.getItem(getHomeConfigCacheKey("prod"))).toBeNull();
  });
});

describe("home screen loading decision", () => {
  test("uses remote config and writes cache on success", async () => {
    const storage = new MemoryStorage();
    const remoteConfig = makeHomeConfig("remote-success");
    const fetcher = vi.fn(async () => Response.json(remoteConfig)) as unknown as typeof fetch;

    const state = await resolveHomeConfigState({ fetcher, storage, now: Date.parse("2026-06-01T00:00:00Z") });

    expect(state.source).toBe("remote");
    expect(state.config.configVersion).toBe("remote-success");
    expect(readHomeConfigCache({ storage })?.entry.config.configVersion).toBe("remote-success");
  });

  test("falls back to stale cache when remote fetch fails", async () => {
    const storage = new MemoryStorage();
    const now = Date.parse("2026-06-01T00:00:00Z");
    const cachedConfig = makeHomeConfig("cache-stale");
    const fetcher = vi.fn(async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;

    writeHomeConfigCache({ config: cachedConfig, storage, now });

    const state = await resolveHomeConfigState({ fetcher, storage, now: now + 700_000 });

    expect(state.source).toBe("cache");
    expect(state.config.configVersion).toBe("cache-stale");
  });

  test("uses static default when remote fetch fails without cache", async () => {
    const fetcher = vi.fn(async () => new Response("missing", { status: 404 })) as unknown as typeof fetch;

    const state = await resolveHomeConfigState({ fetcher, storage: new MemoryStorage() });

    expect(state.source).toBe("default");
    expect(state.config.configVersion).toBe(defaultHomeConfig.configVersion);
  });
});

describe("home module rendering", () => {
  test("renders the loading skeleton", () => {
    const html = renderToStaticMarkup(<HomeSkeleton />);

    expect(html).toContain("首页加载中");
  });

  test("renders the header search icon through local asset registry", () => {
    const html = renderToStaticMarkup(<HomeExperience data={homeExperienceData} />);

    expect(html).toContain("/assets/common/icons/search.png");
  });

  test("skips disabled, unknown, cart, and out-of-window modules", () => {
    const config = makeHomeConfig("render-001");
    config.modules.push({
      id: "unknown",
      type: "coupon_stack",
      enabled: true,
      sortOrder: 15
    });
    config.modules.push({
      id: "disabled",
      type: "category_grid",
      enabled: false,
      sortOrder: 16,
      columns: 4,
      rows: 1,
      items: [{ id: "disabled-cat", name: "隐藏分类", event: { type: "h5_route", target: "/category" }, enabled: true, sortOrder: 1 }]
    });
    (config.modules[1] as CategoryGridModule).items.push({
      id: "cart-cat",
      name: "购物车",
      event: { type: "h5_route", target: "/cart" },
      enabled: true,
      sortOrder: 5
    });
    (config.modules[2] as ActivitySectionModule).items.push({
      id: "future-act",
      kind: "promotion",
      title: "未开始活动",
      startsAt: "2026-07-01T00:00:00Z",
      event: { type: "h5_route", target: "/promotion" },
      enabled: true,
      sortOrder: 5
    });

    const modules = getVisibleHomeModules(config.modules, new Date("2026-06-10T00:00:00Z"));
    const html = renderToStaticMarkup(<HomeModules modules={config.modules} now={new Date("2026-06-10T00:00:00Z")} />);

    expect(modules.map((module) => module.type)).toEqual(["banner_carousel", "category_grid", "activity_section"]);
    expect(html).toContain("远程会员日");
    expect(html).toContain("美妆个护");
    expect(html).toContain("新人专享");
    expect(html).toContain("为您推荐");
    expect(html).not.toContain("隐藏分类");
    expect(html).not.toContain("购物车");
    expect(html).not.toContain("未开始活动");
  });
});

describe("home experience data", () => {
  test("links recommended products to the available product detail mock", () => {
    expect(homeExperienceData.products).toHaveLength(10);
    expect(homeExperienceData.products.every((product) => product.href === "/product/p-1001")).toBe(true);
  });
});

function makeHomeConfig(configVersion = "test-001"): HomeConfig {
  return {
    schemaVersion: "1.0",
    pageId: "home",
    configVersion,
    generatedAt: "2026-06-01T00:00:00Z",
    cache: {
      ttlSeconds: 300,
      staleWhileRevalidateSeconds: 1800
    },
    performance: {
      requestTimeoutMs: 1000,
      skeletonMinMs: 1,
      preloadImageCount: 1
    },
    modules: [
      {
        id: "home-banner",
        type: "banner_carousel",
        enabled: true,
        sortOrder: 10,
        items: [
          {
            id: "banner-1",
            title: "远程会员日",
            imageUrl: "https://cdn.example.com/banner.png",
            alt: "远程会员日",
            event: { type: "h5_route", target: "/promotion", params: { source: "home_banner" } },
            trackingId: "home_banner_member_day",
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
        columns: 4,
        rows: 1,
        items: [
          { id: "cat-beauty", name: "美妆个护", iconUrl: "https://cdn.example.com/beauty.png", event: { type: "h5_route", target: "/category" }, enabled: true, sortOrder: 10 },
          { id: "cat-food", name: "食品生鲜", event: { type: "h5_route", target: "/category" }, enabled: true, sortOrder: 20 }
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
            id: "act-1",
            kind: "promotion",
            title: "新人专享",
            subtitle: "首单立减",
            startsAt: "2026-06-01T00:00:00Z",
            endsAt: "2026-06-30T23:59:59Z",
            event: { type: "h5_route", target: "/promotion" },
            enabled: true,
            sortOrder: 10
          }
        ]
      }
    ]
  };
}

class MemoryStorage implements Storage {
  private readonly data = new Map<string, string>();

  get length() {
    return this.data.size;
  }

  clear() {
    this.data.clear();
  }

  getItem(key: string) {
    return this.data.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.data.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.data.delete(key);
  }

  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}
