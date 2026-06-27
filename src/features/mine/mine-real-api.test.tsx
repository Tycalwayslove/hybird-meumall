import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";

import { MineScreen } from "./components/MineScreen";
import { fetchMineSummaryData } from "./server/mine-summary-real-service";

describe("mine real api service", () => {
  test("requests profile summary and my level, then maps real metrics to the mine view model", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      if (path === "/p/app/profile/summary") {
        return makeBackendSuccess({
          data: {
            walletBalance: 123.45,
            yearSavedAmount: 67,
            couponCount: 8,
            banners: [
              {
                imgUrl: "/mine/banner.png",
                seq: 1,
                title: "真实个人中心 Banner"
              }
            ]
          },
          success: true
        });
      }
      if (path === "/p/daren/level/myLevel") {
        return makeBackendSuccess({
          data: {
            currentLevelName: "黄金达人",
            currentLevelValue: 3
          },
          success: true
        });
      }
      throw new Error(`Unexpected path ${path}`);
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    const result = await fetchMineSummaryData({
      backendClient: { request },
      javaOssAssetBaseUrl: "https://oss.example.com/"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.metrics).toEqual([
        { href: "/wallet", label: "钱包余额", prefix: "¥", value: "123.45" },
        { label: "今年已省", prefix: "¥", value: "67" },
        { href: "/coupons", label: "优惠券", value: "8" }
      ]);
      expect(result.data.profile.levelCode).toBe("V3");
      expect(result.data.profile.levelLabel).toBe("黄金达人");
      expect(result.data.profile.levelBadgeAssetKey).toBe("mine.levelBadge.v3");
      expect(result.data.benefitsHref).toBe("/promotion/benefits?level=v3");
      expect(result.data.banner?.imageUrl).toBe("https://oss.example.com/mine/banner.png");
    }

    expect(request).toHaveBeenCalledWith(expect.objectContaining({ path: "/p/app/profile/summary", route: "/mine" }));
    expect(request).toHaveBeenCalledWith(expect.objectContaining({ path: "/p/daren/level/myLevel", route: "/mine" }));
  });

  test("renders real metric values and remote banner without static mock business numbers", async () => {
    const dataResult = await fetchMineSummaryData({
      backendClient: {
        request: vi.fn(async ({ path }: BackendRequestOptions) => {
          if (path === "/p/app/profile/summary") {
            return makeBackendSuccess({
              data: {
                walletBalance: 12,
                yearSavedAmount: 34,
                couponCount: 5,
                banners: [{ imgUrl: "https://cdn.example.com/mine-banner.png" }]
              },
              success: true
            });
          }
          return makeBackendSuccess({
            data: {
              currentLevelName: "白银达人",
              currentLevelValue: 2
            },
            success: true
          });
        }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>
      }
    });

    expect(dataResult.ok).toBe(true);
    if (dataResult.ok) {
      const html = renderToStaticMarkup(<MineScreen data={dataResult.data} />);

      expect(html).toContain("12");
      expect(html).toContain("34");
      expect(html).toContain("5");
      expect(html).toContain("https://cdn.example.com/mine-banner.png");
      expect(html).not.toContain("678");
      expect(html).not.toContain("2383");
    }
  });
});

function makeBackendSuccess<T>(data: T): BackendApiResult<T> {
  return {
    data,
    meta: {
      appEnv: "test",
      backend: "java",
      h5Version: "test",
      requestId: "req-mine",
      route: "/mine"
    },
    ok: true
  };
}
