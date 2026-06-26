import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";

import { SeckillScreen } from "./components/SeckillScreen";
import { fetchSeckillProductsData } from "./server/seckill-real-service";

describe("SeckillScreen", () => {
  test("renders the seckill hero background through local asset registry", () => {
    const html = renderToStaticMarkup(<SeckillScreen />);

    expect(html).toContain("/assets/seckill/seckill-hero-bg.png");
  });

  test("renders an empty state instead of mock product cards before Java data is loaded", () => {
    const html = renderToStaticMarkup(<SeckillScreen />);

    expect(html).not.toContain('data-product-image-placeholder="true"');
    expect(html).toContain('data-empty-state="true"');
    expect(html).toContain("/assets/placeholders/empty-state-mascot.png");
    expect(html).toContain("暂无秒杀商品");
    expect(html).not.toContain("没有更多了");
  });

  test("renders real seckill product links and images when initial data is provided", () => {
    const html = renderToStaticMarkup(
      <SeckillScreen
        initialProducts={[
          {
            countdown: "01:02:03",
            href: "/product/3001",
            id: "7001",
            imageUrl: "https://cdn.example.com/seckill.png",
            limitText: "限购2件",
            originalPrice: 99,
            price: 49,
            progress: 60,
            soldText: "已售: 30",
            stockText: "还剩: 20件",
            title: "真实秒杀商品",
            tone: "blue"
          }
        ]}
      />
    );

    expect(html).toContain("/product/3001");
    expect(html).toContain("https://cdn.example.com/seckill.png");
    expect(html).toContain("真实秒杀商品");
  });
});

describe("seckill real api service", () => {
  test("requests Java seckill product page and maps records to the H5 view model", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      if (path === "/p/app/home/seckillProds?current=2&size=5") {
        return makeBackendSuccess({
          data: {
            current: 2,
            pages: 3,
            records: [
              {
                endTime: "2026-06-24 20:00:00",
                limitNum: 2,
                originalPrice: 99,
                pic: "/seckill/item.png",
                prodId: 3001,
                prodName: "真实秒杀商品",
                remainingSeconds: 3723,
                remainingStocks: 20,
                seckillId: 7001,
                seckillPrice: 49,
                soldNum: 30
              }
            ],
            size: 5,
            total: 11
          }
        });
      }
      throw new Error(`Unexpected path ${path}`);
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    const result = await fetchSeckillProductsData({
      backendClient: { request },
      current: 2,
      javaOssAssetBaseUrl: "https://oss.example.com/",
      size: 5
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.products[0]).toMatchObject({
        countdown: "01:02:03",
        href: "/product/3001",
        id: "7001",
        imageUrl: "https://oss.example.com/seckill/item.png",
        limitText: "限购2件",
        originalPrice: 99,
        price: 49,
        progress: 60,
        soldText: "已售: 30",
        stockText: "还剩: 20件",
        title: "真实秒杀商品"
      });
      expect(result.data.page).toEqual({
        current: 2,
        hasMore: true,
        pages: 3,
        size: 5,
        total: 11
      });
    }
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        backend: "java",
        method: "GET",
        path: "/p/app/home/seckillProds?current=2&size=5",
        route: "/seckill"
      })
    );
  });

  test("does not fall back to mock products when Java returns an empty seckill page", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      if (path === "/p/app/home/seckillProds?current=1&size=10") {
        return makeBackendSuccess({
          data: {
            current: 1,
            pages: 0,
            records: [],
            size: 10,
            total: 0
          }
        });
      }
      throw new Error(`Unexpected path ${path}`);
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    const result = await fetchSeckillProductsData({
      backendClient: { request },
      current: 1,
      size: 10
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.products).toEqual([]);
      expect(result.data.page.hasMore).toBe(false);
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
      requestId: "req-seckill",
      route: "/seckill"
    },
    ok: true
  };
}
