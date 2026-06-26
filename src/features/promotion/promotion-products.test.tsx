import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";
import type { BackendApiResult, BackendRequestOptions } from "@/server/http/backend-client";

import { PromotionProductsScreen } from "./components/PromotionProductsScreen";
import { buildPromotionSharePayload, mapPromotionProductsSort, sharePromotionProduct } from "./components/PromotionProductsScreen";
import { promotionProducts } from "./mock/products";
import { fetchPromotionProductsData } from "./server/promotion-products-real-service";

describe("PromotionProductsScreen", () => {
  test("keeps filter switching inside the current promotion products page state", () => {
    const html = renderToStaticMarkup(<PromotionProductsScreen />);

    expect(html).not.toContain("filter=category");
    expect(html).not.toContain("filter=commission");
    expect(html).not.toContain("filter=property");
    expect(html).not.toContain("filter=sales");
    expect(html).not.toContain("filter=price");
  });

  test("renders the search icon through local asset registry", () => {
    const html = renderToStaticMarkup(<PromotionProductsScreen />);

    expect(html).toContain("/assets/common/icons/search.png");
  });

  test("renders an empty state instead of mock product cards before Java data is loaded", () => {
    const html = renderToStaticMarkup(<PromotionProductsScreen />);

    expect(html).not.toContain('data-product-image-placeholder="true"');
    expect(html).toContain('data-empty-state="true"');
    expect(html).toContain("/assets/placeholders/empty-state-mascot.png");
    expect(html).toContain("暂无推广商品");
    expect(html).not.toContain("没有更多了");
  });

  test("shows the selected dropdown option as the active filter label", () => {
    const html = renderToStaticMarkup(<PromotionProductsScreen filter="category" />);

    expect(html).toMatch(/aria-current="true"[^>]*><span>生鲜熟食<\/span>/);
  });

  test("builds a bridge share payload from the promotion product card", () => {
    expect(buildPromotionSharePayload(promotionProducts[0])).toEqual({
      productId: "promotion-product-1",
      title: "夏季纯棉短袖T恤男女同款宽松百搭休闲圆领上衣ins潮牌打底衫",
      source: "promotion_products"
    });
  });

  test("emits the promotion share payload through native bridge when available", () => {
    const messages: unknown[] = [];
    const bridge = {
      emit(eventName: string, payload: unknown) {
        messages.push({ eventName, payload });
      },
      isAvailable() {
        return true;
      }
    };

    expect(sharePromotionProduct(promotionProducts[0], bridge)).toBe(true);
    expect(messages).toEqual([
      {
        eventName: "share",
        payload: {
          productId: "promotion-product-1",
          title: "夏季纯棉短袖T恤男女同款宽松百搭休闲圆领上衣ins潮牌打底衫",
          source: "promotion_products"
        }
      }
    ]);
  });

  test("renders real promotion product links and images when initial data is provided", () => {
    const html = renderToStaticMarkup(
      <PromotionProductsScreen
        initialProducts={[
          {
            commissionRate: "",
            estimatedCommission: 12,
            href: "/product/5001",
            id: "5001",
            imageUrl: "https://cdn.example.com/promotion.png",
            sales: 88,
            title: "真实推广商品",
            userPrice: 66
          }
        ]}
      />
    );

    expect(html).toContain("/product/5001");
    expect(html).toContain("https://cdn.example.com/promotion.png");
    expect(html).toContain("/assets/promotion/icons/share.png");
    expect(html).toContain("/assets/promotion/icons/collect.png");
    expect(html).toContain("真实推广商品");
  });

  test("maps active filters to Java promotion product sort values", () => {
    expect(mapPromotionProductsSort("sales", {})).toBe(1);
    expect(mapPromotionProductsSort("price", { price: "price_desc" })).toBe(2);
    expect(mapPromotionProductsSort("price", { price: "price_asc" })).toBe(3);
    expect(mapPromotionProductsSort("commission", { commission: "commission_amount_desc" })).toBe(4);
    expect(mapPromotionProductsSort("commission", { commission: "commission_amount_asc" })).toBe(5);
    expect(mapPromotionProductsSort("commission", { commission: "commission_rate_desc" })).toBe(6);
    expect(mapPromotionProductsSort("commission", { commission: "commission_rate_asc" })).toBe(7);
  });
});

describe("promotion products real api service", () => {
  test("requests Java promotion product page and maps records to the H5 view model", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      if (path === "/p/distribution/prod/productPage?current=1&size=5&prodName=%E7%9F%AD%E8%A2%96&sort=4") {
        return makeBackendSuccess({
          data: {
            current: 1,
            pages: 2,
            records: [
              {
                commissionAmount: 12.5,
                isFavorite: true,
                pic: "/promotion/item.png",
                price: 66,
                prodId: 5001,
                prodName: "真实推广商品",
                soldNum: 88
              }
            ],
            size: 5,
            total: 8
          }
        });
      }
      throw new Error(`Unexpected path ${path}`);
    }) as unknown as <T>(options: BackendRequestOptions) => Promise<BackendApiResult<T>>;

    const result = await fetchPromotionProductsData({
      backendClient: { request },
      current: 1,
      javaOssAssetBaseUrl: "https://oss.example.com/",
      prodName: "短袖",
      size: 5,
      sort: 4
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.view.products[0]).toMatchObject({
        estimatedCommission: 12.5,
        href: "/product/5001",
        id: "5001",
        imageUrl: "https://oss.example.com/promotion/item.png",
        isFavorite: true,
        sales: 88,
        title: "真实推广商品",
        userPrice: 66
      });
      expect(result.data.page).toEqual({
        current: 1,
        hasMore: true,
        pages: 2,
        size: 5,
        total: 8
      });
    }
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({
        backend: "java",
        method: "GET",
        path: "/p/distribution/prod/productPage?current=1&size=5&prodName=%E7%9F%AD%E8%A2%96&sort=4",
        route: "/promotion/products"
      })
    );
  });

  test("does not fall back to mock products when Java returns an empty promotion product page", async () => {
    const request = vi.fn(async ({ path }: BackendRequestOptions) => {
      if (path === "/p/distribution/prod/productPage?current=1&size=10") {
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

    const result = await fetchPromotionProductsData({
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
      requestId: "req-promotion-products",
      route: "/promotion/products"
    },
    ok: true
  };
}
