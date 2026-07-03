import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

import type { H5BffResult } from "@/lib/http";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";

import { createSellerActivityApi } from "./api";
import { SellerActivitiesScreen, SellerActivityProductFormScreen, SellerActivityProductsScreen, SellerActivityProductSelectScreen } from "./components/SellerActivityScreens";
import {
  batchUpdateSellerActivityStatus,
  fetchSellerActivitiesData,
  fetchSellerActivityProductsData,
  fetchSellerAvailableProductsData,
  saveSellerActivity,
  type SellerActivitiesBffData
} from "./server/seller-activity-service";

describe("seller activity api adapter", () => {
  test("centralizes seller activity BFF endpoints and mutation methods", async () => {
    const expectedResult = {
      data: {} as SellerActivitiesBffData,
      requestId: "req-seller-activities",
      success: true
    } satisfies H5BffResult<SellerActivitiesBffData>;
    const request = vi.fn(async () => expectedResult);
    const client = {
      request: request as unknown as <T>(path: string, options?: unknown) => Promise<H5BffResult<T>>
    };
    const api = createSellerActivityApi(client);

    await api.getActivities();
    await api.getActivityProducts(88, { current: 2, size: 5, status: 0 });
    await api.getAvailableProducts(88, { categoryId: 10, current: 3, keyword: "猫粮", orderBy: "+price" });
    await api.getProductDetail(88, 5001);
    await api.batchStatus({ ids: [10, 11], status: 0 });

    expect(request).toHaveBeenNthCalledWith(1, "/api/bff/seller-activities");
    expect(request).toHaveBeenNthCalledWith(2, "/api/bff/seller-activities/88/products?current=2&size=5&status=0");
    expect(request).toHaveBeenNthCalledWith(3, "/api/bff/seller-activities/88/available-products?categoryId=10&current=3&keyword=%E7%8C%AB%E7%B2%AE&orderBy=%2Bprice&size=10");
    expect(request).toHaveBeenNthCalledWith(4, "/api/bff/seller-activities/88/products/5001");
    expect(request).toHaveBeenNthCalledWith(5, "/api/bff/seller-activities/batch-status", {
      body: { ids: [10, 11], status: 0 },
      method: "POST"
    });
  });
});

describe("seller activity service", () => {
  test("maps available seller activities to marketing cards", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      expect(path).toBe("/p/sellerActivity/availableList");
      return makeBackendSuccess({
        data: [
          {
            activityCode: "flash",
            activityDesc: "真的很低价",
            activityImg: "/activity/flash.png",
            activityName: "限时秒杀",
            id: 88,
            orderCount: 68,
            runningProductCount: 12,
            status: 1
          }
        ],
        success: true
      });
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    const result = await fetchSellerActivitiesData({
      authToken: "token",
      backendClient: { request },
      javaOssAssetBaseUrl: "https://oss.example.com"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.activities[0]).toMatchObject({
        description: "真的很低价",
        href: "/seller/activities/88",
        imageUrl: "https://oss.example.com/activity/flash.png",
        orderCount: 68,
        runningProductCount: 12,
        title: "限时秒杀"
      });
    }
  });

  test("requests configured seller activity products by activity and status", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      expect(path).toBe("/p/sellerActivity/page?activityId=88&current=1&size=5&status=1");
      return makeBackendSuccess({
        data: {
          current: 1,
          pages: 2,
          records: [
            {
              activityId: 88,
              brief: "新人专享",
              id: 901,
              limitNum: 2,
              oriPrice: 99,
              pic: "/product/a.png",
              price: 69,
              prodId: 5001,
              prodName: "活动商品",
              skuList: [{ activityPrice: 69, commission: 6, skuId: 7001, skuName: "100g" }],
              soldNum: 200,
              status: 1
            }
          ],
          size: 5,
          total: 8
        },
        success: true
      });
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    const result = await fetchSellerActivityProductsData({
      activityId: 88,
      authToken: "token",
      backendClient: { request },
      javaOssAssetBaseUrl: "https://oss.example.com",
      size: 5,
      status: 1
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.page.hasMore).toBe(true);
      expect(result.data.view.products[0]).toMatchObject({
        activityId: "88",
        brief: "新人专享",
        commissionText: "佣金: ¥6",
        id: "901",
        imageUrl: "https://oss.example.com/product/a.png",
        limitNum: 2,
        originalPrice: 99,
        price: 69,
        prodId: "5001",
        title: "活动商品"
      });
    }
  });

  test("uses promotion product page as the source for adding activity products", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      expect(path).toBe("/p/distribution/prod/productPage?current=2&size=10&keyword=%E7%8C%AB%E7%B2%AE&orderBy=-soldNum");
      return makeBackendSuccess({
        data: {
          current: 2,
          pages: 2,
          records: [
            {
              commissionAmount: 12,
              originalPrice: 89,
              pic: "/product/b.png",
              price: 59,
              prodId: 6001,
              prodName: "可选商品",
              soldNum: 18
            }
          ],
          size: 10,
          total: 11
        },
        success: true
      });
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    const result = await fetchSellerAvailableProductsData({
      activityId: 88,
      authToken: "token",
      backendClient: { request },
      current: 2,
      javaOssAssetBaseUrl: "https://oss.example.com",
      keyword: "猫粮",
      orderBy: "-soldNum"
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.products[0]).toMatchObject({
        commissionAmount: 12,
        href: "/seller/activities/88/products/6001",
        imageUrl: "https://oss.example.com/product/b.png",
        prodId: "6001",
        title: "可选商品"
      });
    }
  });

  test("posts batch status and saveOrUpdate to Java seller activity endpoints", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      if (path === "/p/sellerActivity/batchStatus" || path === "/p/sellerActivity/saveOrUpdate") {
        return makeBackendSuccess({ data: true, msg: "操作成功", success: true });
      }
      throw new Error(`Unexpected path ${path}`);
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    await batchUpdateSellerActivityStatus({
      authToken: "token",
      backendClient: { request },
      body: { ids: [901], status: 0 }
    });
    await saveSellerActivity({
      authToken: "token",
      backendClient: { request },
      body: {
        activityId: 88,
        limitNum: 1,
        prodId: 5001,
        skuList: [{ activityPrice: 66, skuId: 7001 }]
      }
    });

    expect(request).toHaveBeenNthCalledWith(1, expect.objectContaining({
      body: { ids: [901], status: 0 },
      method: "POST",
      path: "/p/sellerActivity/batchStatus"
    }));
    expect(request).toHaveBeenNthCalledWith(2, expect.objectContaining({
      method: "POST",
      path: "/p/sellerActivity/saveOrUpdate"
    }));
  });
});

describe("seller activity screens", () => {
  test("renders empty marketing activity state without mock cards", () => {
    const html = renderToStaticMarkup(<SellerActivitiesScreen activities={[]} />);

    expect(html).toContain("暂无可参加的营销活动");
    expect(html).toContain('data-empty-state="true"');
    expect(html).not.toContain("限时秒杀");
  });

  test("renders configured product list and keeps the add button on seller route", () => {
    const html = renderToStaticMarkup(
      <SellerActivityProductsScreen
        activityId="88"
        activityTitle="限时秒杀"
        initialPage={{ current: 1, hasMore: false, size: 10, total: 1 }}
        initialProducts={[
          {
            activityId: "88",
            id: "901",
            limitNum: 1,
            originalPrice: 99,
            price: 69,
            prodId: "5001",
            skuList: [],
            soldNum: 200,
            title: "真实活动商品"
          }
        ]}
      />
    );

    expect(html).toContain("限时秒杀");
    expect(html).toContain("批量编辑");
    expect(html).toContain("真实活动商品");
    expect(html).toContain("/seller/activities/88/products");
    expect(html).not.toContain("<h1>活动商品</h1>");
    expect(html).not.toContain("暂无商品，快去新增活动商品吧~");
  });

  test("hides batch edit action when the current activity tab has no products", () => {
    const html = renderToStaticMarkup(
      <SellerActivityProductsScreen
        activityId="88"
        activityTitle="限时秒杀"
        initialPage={{ current: 1, hasMore: false, size: 10, total: 0 }}
        initialProducts={[]}
      />
    );

    expect(html).toContain("限时秒杀");
    expect(html).toContain("暂无商品，快去新增活动商品吧~");
    expect(html).toContain("/seller/activities/88/products");
    expect(html).not.toContain("批量编辑");
  });

  test("renders available product cards with load more entry", () => {
    const html = renderToStaticMarkup(
      <SellerActivityProductSelectScreen
        activityId="88"
        initialPage={{ current: 1, hasMore: true, size: 10, total: 12 }}
        initialProducts={[
          {
            commissionAmount: 12,
            href: "/seller/activities/88/products/6001",
            imageUrl: "https://oss.example.com/product/b.png",
            originalPrice: 89,
            price: 59,
            prodId: "6001",
            soldNum: 18,
            title: "可选商品"
          }
        ]}
      />
    );

    expect(html).toContain("选择商品");
    expect(html).toContain("商品分类");
    expect(html).toContain("佣金比率");
    expect(html).toContain("可选商品");
    expect(html).toContain("佣金:");
    expect(html).toContain("¥12");
    expect(html).toContain("加载更多");
    expect(html).not.toContain("暂无可选商品");
  });

  test("renders empty available product state without load more", () => {
    const html = renderToStaticMarkup(
      <SellerActivityProductSelectScreen
        activityId="88"
        initialPage={{ current: 1, hasMore: true, size: 10, total: 0 }}
        initialProducts={[]}
      />
    );

    expect(html).toContain("暂无可选商品");
    expect(html).toContain('data-empty-state="true"');
    expect(html).not.toContain("加载更多");
  });

  test("renders product setting rows with seckill price and commission", () => {
    const html = renderToStaticMarkup(
      <SellerActivityProductFormScreen
        activityId="88"
        prodId="6001"
        initialProduct={{
          activityId: "88",
          commissionText: "佣金: ¥12",
          id: "901",
          imageUrl: "https://oss.example.com/product/b.png",
          limitNum: 1,
          originalPrice: 89,
          price: 59,
          prodId: "6001",
          skuList: [{ commission: 6, skuId: "7001", skuName: "默认规格" }],
          soldNum: 18,
          title: "可选商品"
        }}
      />
    );

    expect(html).toContain("商品设置");
    expect(html).toContain("用户价");
    expect(html).toContain("¥59");
    expect(html).toContain("¥89");
    expect(html).toContain("根据您设置的折扣价格，商品佣金会相应降低");
    expect(html).toContain("活动时间");
    expect(html).toContain("秒杀价格");
    expect(html).toContain("商品佣金");
    expect(html).toContain("6元/件");
    expect(html).toContain("确认修改");
    expect(html).not.toContain("活动价");
  });
});

function makeBackendSuccess<T>(data: T): BackendApiResult<T> {
  return {
    data,
    meta: {
      appEnv: "test",
      backend: "java",
      h5Version: "test",
      requestId: "req-seller-activity",
      route: "/seller-activity"
    },
    ok: true
  };
}
