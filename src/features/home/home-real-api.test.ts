import { describe, expect, test, vi } from "vitest";
import type { H5BffResult } from "@/lib/http";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";
import { homeExperienceData } from "./mock/home-page-data";
import { resolveHomeExperienceState } from "./HomeScreen";
import { fetchHomeExperienceData, fetchHomeForYouProductsData, fetchHomeRecommendProductsData, mapHomeApiToExperienceData } from "./server/home-real-service";
import type { HomeBffData, HomeRecommendProductsBffData } from "./server/home-real-service";

describe("home real api mapper", () => {
  test("maps Apifox home payloads into the H5 home experience model", () => {
    const data = mapHomeApiToExperienceData({
      aggregate: makeAggregatePayload(),
      fallback: homeExperienceData
    });

    expect(data.banner).toMatchObject({
      alt: "首页 Banner",
      href: "/product/1001",
      imageUrl: "https://cdn.example.com/banner.png"
    });
    expect(data.categories[0]).toMatchObject({
      href: "/search?categoryId=10",
      iconUrl: "https://cdn.example.com/category.png",
      label: "零食饮料"
    });
    expect(data.products).toBe(homeExperienceData.products);
  });

  test("prefixes Java relative image paths with OSS asset base url", () => {
    const data = mapHomeApiToExperienceData({
      aggregate: {
        ...makeAggregatePayload(),
        banners: [
          {
            imgUrl: "banner/home.png",
            jumpType: 2,
            jumpValue: "1001",
            seq: 1
          }
        ],
        categoryTop8: [
          {
            categoryId: 10,
            categoryName: "零食饮料",
            icon: "/category/snack.png"
          }
        ]
      },
      fallback: homeExperienceData,
      javaOssAssetBaseUrl: "https://awu-mall-file.oss-cn-guangzhou.aliyuncs.com/"
    });

    expect(data.banner.imageUrl).toBe("https://awu-mall-file.oss-cn-guangzhou.aliyuncs.com/banner/home.png");
    expect(data.categories[0]?.iconUrl).toBe("https://awu-mall-file.oss-cn-guangzhou.aliyuncs.com/category/snack.png");
  });
});

describe("home BFF service", () => {
  test("requests only Java home aggregate for the first-screen BFF", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      if (path === "/p/app/home/index") {
        return makeBackendSuccess({ data: makeAggregatePayload() });
      }
      throw new Error(`Unexpected path ${path}`);
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    const result = await fetchHomeExperienceData({
      backendClient: { request },
      clientContext: { h5Route: "/" },
      fallback: homeExperienceData
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.banner).toMatchObject({
        href: "/product/1001",
        imageUrl: "https://cdn.example.com/banner.png"
      });
      expect(result.data.modules.banners[0]).toMatchObject({
        imgUrl: "https://cdn.example.com/banner.png",
        jumpType: 2,
        jumpValue: "1001"
      });
      expect(result.data.modules.hotCategory).toMatchObject({
        icon: "rank/hot-icon.png",
        rankName: "喵呜热榜",
        top3: [
          expect.objectContaining({
            pic: "https://cdn.example.com/rank-product.png",
            rankNo: 1
          })
        ]
      });
      expect(result.data.modules.categoryTop8[0]).toMatchObject({
        categoryId: 10,
        categoryName: "零食饮料"
      });
      expect(result.data.modules.seckillModule).toMatchObject({
        products: [
          expect.objectContaining({
            commissionAmount: 1.5,
            endTime: "2026-06-12 10:00:00",
            pic: "seckill/sku.png",
            prodId: 3001
          })
        ]
      });
      expect(result.data.debugRaw).toBeUndefined();
    }
    expect(request).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        backend: "java",
        clientContext: { h5Route: "/" },
        method: "GET",
        path: "/p/app/home/index",
        route: "/"
      })
    );
    expect(request).toHaveBeenCalledTimes(1);
  });

  test("can include raw Java home envelope for local or test debugging", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      if (path === "/p/app/home/index") {
        return makeBackendSuccess({ data: makeAggregatePayload(), version: "mall4j.v231225" });
      }
      throw new Error(`Unexpected path ${path}`);
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    const result = await fetchHomeExperienceData({
      backendClient: { request },
      fallback: homeExperienceData,
      includeDebugRaw: true
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.debugRaw?.homeIndex).toMatchObject({
        data: expect.objectContaining({
          banners: expect.any(Array),
          hotCategory: expect.any(Object)
        }),
        version: "mall4j.v231225"
      });
    }
    expect(request).toHaveBeenCalledTimes(1);
  });

  test("requests Java for-you products as an independent paged BFF", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      if (path === "/p/app/home/forYouProds?current=2&size=5") {
        return makeBackendSuccess({ data: { ...makeForYouPayload(), current: 2, pages: 3, size: 5, total: 13 } });
      }
      throw new Error(`Unexpected path ${path}`);
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    const result = await fetchHomeForYouProductsData({
      backendClient: { request },
      current: 2,
      fallbackProducts: homeExperienceData.products,
      size: 5
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.products[0]).toMatchObject({
        badge: "热卖",
        href: "/product/2001",
        id: "2001",
        imageUrl: "https://cdn.example.com/product.png",
        originalPrice: "29.9",
        price: "19.9",
        promoType: "seckill",
        soldText: "已售 123",
        title: "达人推荐短袖"
      });
      expect(result.data.page).toEqual({
        current: 2,
        hasMore: true,
        pages: 3,
        size: 5,
        total: 13
      });
      expect(result.data.modules.forYouProducts[0]).toMatchObject({
        bestCoupon: expect.objectContaining({ couponName: "满减券" }),
        commissionAmount: 2.5,
        couponDiscountAmount: 3,
        hasMultiSku: true,
        prodId: 2001
      });
    }
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        backend: "java",
        method: "GET",
        path: "/p/app/home/forYouProds?current=2&size=5",
        route: "/"
      })
    );
  });

  test("requests Java home recommended products for the home first-screen product grid", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      if (path === "/p/app/home/recommendProds?current=1&size=10") {
        return makeBackendSuccess({ data: { ...makeForYouPayload(), current: 1, pages: 2, size: 10, total: 12 } });
      }
      throw new Error(`Unexpected path ${path}`);
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    const result = await fetchHomeRecommendProductsData({
      backendClient: { request },
      current: 1,
      fallbackProducts: homeExperienceData.products,
      size: 10
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.products[0]).toMatchObject({
        id: "2001",
        title: "达人推荐短袖"
      });
      expect(result.data.page.hasMore).toBe(true);
      expect(result.data.modules.recommendProducts[0]).toMatchObject({
        prodId: 2001,
        prodName: "达人推荐短袖"
      });
    }
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        path: "/p/app/home/recommendProds?current=1&size=10"
      })
    );
  });

  test("stops after aggregate business auth failure", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      if (path === "/p/app/home/index") {
        return makeBackendSuccess({
          code: "A00004",
          data: null,
          msg: "Unauthorized",
          success: false
        });
      }
      throw new Error(`Unexpected path ${path}`);
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    const result = await fetchHomeExperienceData({
      backendClient: { request },
      fallback: homeExperienceData
    });

    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({
        code: "AUTH_FAILED",
        message: "Unauthorized",
        requestId: "req-home"
      })
    });
    expect(request).toHaveBeenCalledTimes(1);
  });

  test("maps Java server exception business code to HTTP_ERROR", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      if (path === "/p/app/home/index") {
        return makeBackendSuccess({
          code: "A00005",
          data: null,
          msg: "服务器出了点小差",
          success: false
        });
      }
      throw new Error(`Unexpected path ${path}`);
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    const result = await fetchHomeExperienceData({
      backendClient: { request },
      fallback: homeExperienceData
    });

    expect(result).toEqual({
      ok: false,
      error: expect.objectContaining({
        code: "HTTP_ERROR",
        details: {
          code: "A00005",
          codeName: "EXCEPTION"
        },
        message: "服务器出了点小差",
        requestId: "req-home"
      })
    });
    expect(request).toHaveBeenCalledTimes(1);
  });
});

describe("home experience state", () => {
  test("falls back to local home data when BFF request fails", async () => {
    const state = await resolveHomeExperienceState({
      fallbackData: homeExperienceData,
      homeApi: {
        getHome: async () =>
          ({
            code: "NETWORK_ERROR",
            message: "failed",
            recoverable: true,
            success: false
          }) satisfies H5BffResult<HomeBffData>
      }
    });

    expect(state.source).toBe("default");
    expect(state.data).toBe(homeExperienceData);
  });

  test("uses mapped view data from the home BFF response", async () => {
    const remoteView = {
      ...homeExperienceData,
      banner: {
        ...homeExperienceData.banner,
        href: "/product/remote",
        imageUrl: "https://cdn.example.com/remote-banner.png"
      }
    };

    const state = await resolveHomeExperienceState({
      fallbackData: homeExperienceData,
      homeApi: {
        getHome: async () =>
          ({
            data: {
              modules: {
                banners: [{ imgUrl: "https://cdn.example.com/raw-banner.png" }],
                categoryTop8: [],
                hotCategory: null,
                seckillModule: null
              },
              view: remoteView
            },
            requestId: "req-home",
            success: true
          }) satisfies H5BffResult<HomeBffData>
      }
    });

    expect(state.source).toBe("remote");
    expect(state.data).toBe(remoteView);
  });

  test("merges independently loaded recommended products into the home view", async () => {
    const remoteView = {
      ...homeExperienceData,
      products: []
    };
    const remoteProducts = [
      {
        ...homeExperienceData.products[0],
        id: "remote-product",
        title: "远程推荐商品"
      }
    ];

    const state = await resolveHomeExperienceState({
      fallbackData: homeExperienceData,
      homeApi: {
        getRecommendProducts: async () =>
          ({
            data: {
              modules: {
                recommendPage: { records: [] },
                recommendProducts: []
              },
              page: {
                current: 1,
                hasMore: false,
                size: 10
              },
              view: {
                products: remoteProducts
              }
            },
            requestId: "req-for-you",
            success: true
          }) satisfies H5BffResult<HomeRecommendProductsBffData>,
        getHome: async () =>
          ({
            data: {
              modules: {
                banners: [],
                categoryTop8: [],
                hotCategory: null,
                seckillModule: null
              },
              view: remoteView
            },
            requestId: "req-home",
            success: true
          }) satisfies H5BffResult<HomeBffData>
      }
    });

    expect(state.source).toBe("remote");
    expect(state.data.products).toBe(remoteProducts);
  });
});

function makeAggregatePayload() {
  return {
    banners: [
      {
        imgUrl: "https://cdn.example.com/banner.png",
        jumpType: 2,
        jumpValue: "1001",
        seq: 1
      }
    ],
    categoryTop8: [
      {
        categoryId: 10,
        categoryName: "零食饮料",
        icon: "https://cdn.example.com/category.png"
      }
    ],
    hotCategory: {
      icon: "rank/hot-icon.png",
      rankName: "喵呜热榜",
      rankType: 1,
      top3: [
        {
          pic: "https://cdn.example.com/rank-product.png",
          price: 39.9,
          prodId: 9001,
          prodName: "热榜商品",
          rankNo: 1,
          soldNum: 456
        }
      ]
    },
    seckillModule: {
      products: [
        {
          commissionAmount: 1.5,
          darenPrice: 8.8,
          endTime: "2026-06-12 10:00:00",
          pic: "seckill/sku.png",
          prodId: 3001,
          prodName: "秒杀商品",
          seckillId: 7001,
          seckillPrice: 9.9
        }
      ]
    }
  };
}

function makeForYouPayload() {
  return {
    current: 1,
    records: [
      {
        activityTag: 2,
        bestCoupon: {
          cashCondition: 50,
          couponId: 101,
          couponName: "满减券",
          couponType: 1,
          couponUserId: 10001,
          reduceAmount: 3
        },
        commissionAmount: 2.5,
        couponDiscountAmount: 3,
        darenPrice: 19.9,
        hasMultiSku: true,
        pic: "https://cdn.example.com/product.png",
        price: 29.9,
        prodId: 2001,
        prodName: "达人推荐短袖",
        prodTag: "热卖",
        soldNum: 123
      }
    ],
    size: 10,
    total: 1
  };
}

function makeBackendSuccess<T>(data: T) {
  return {
    data,
    meta: {
      appEnv: "test",
      backend: "java",
      h5Version: "test",
      requestId: "req-home",
      route: "/"
    },
    ok: true
  } as const;
}
