import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { HomeRecommendProductsScreen, loadNextRecommendProductsPage, shouldShowRecommendProductsBackToTop } from "./components/HomeRecommendProductsScreen";
import type { HomeApi } from "./home-api";
import { homeExperienceData } from "./mock/home-page-data";

describe("HomeRecommendProductsScreen", () => {
  test("renders skeleton cards instead of mock products before real products load", () => {
    const html = renderToStaticMarkup(<HomeRecommendProductsScreen />);

    expect(html).toContain('data-recommend-products-skeleton="true"');
    expect(html).not.toContain(homeExperienceData.products[0]?.title);
    expect(html).not.toContain('data-product-image-placeholder="true"');
    expect(html).not.toContain("没有更多了");
  });

  test("renders the dedicated recommendation page shell", () => {
    const html = renderToStaticMarkup(<HomeRecommendProductsScreen initialProducts={homeExperienceData.products} />);

    expect(html).toContain("相似推荐商品");
    expect(html).toContain("请输入商品名称搜索");
    expect(html).toContain("销量");
    expect(html).toContain("价格");
    expect(html).toContain("分类");
    expect(html).toContain("data-product-image-placeholder=\"true\"");
    expect(html).toContain(homeExperienceData.products[0]?.title);
  });

  test("renders a real product image without the placeholder artwork", () => {
    const product = {
      ...homeExperienceData.products[0]!,
      id: "remote-image-product",
      imageUrl: "https://cdn.example.com/recommend-product.png",
      title: "有图的相似推荐商品"
    };
    const html = renderToStaticMarkup(
      <HomeRecommendProductsScreen
        initialProducts={[product]}
      />
    );

    expect(html).toContain(product.imageUrl);
    expect(html).toContain(product.title);
    expect(html).toContain(product.soldText);
    expect(html).toContain(product.price);
    expect(html).toContain(product.originalPrice);
    expect(html).not.toContain('data-product-image-placeholder="true"');
  });

  test("opens recommendation products through the hybrid product detail webview", () => {
    const product = {
      ...homeExperienceData.products[0]!,
      href: "/product/1001",
      id: "1001",
      title: "真实相似推荐商品"
    };
    const html = renderToStaticMarkup(<HomeRecommendProductsScreen initialProducts={[product]} />);

    expect(html).toContain('data-recommend-product-link="true"');
    expect(html).toContain('data-hybrid-strategy="new-webview"');
    expect(html).toContain('href="/product/1001"');
    expect(html).toContain("真实相似推荐商品");
  });

  test("renders a reusable back-to-top button after enough products are loaded", () => {
    const html = renderToStaticMarkup(
      <HomeRecommendProductsScreen
        initialProducts={Array.from({ length: 11 }, (_, index) => ({
          ...homeExperienceData.products[index % homeExperienceData.products.length]!,
          id: `recommend-product-${index}`
        }))}
      />
    );

    expect(shouldShowRecommendProductsBackToTop({ current: 1, size: 10 }, 11)).toBe(true);
    expect(html).toContain('data-back-to-top-button="true"');
    expect(html).toContain("顶部");
  });

  test("loads the next page and appends products when reaching the bottom", async () => {
    const firstProduct = homeExperienceData.products[0]!;
    const nextProduct = {
      ...homeExperienceData.products[1]!,
      id: "remote-next-product",
      title: "第二页相似推荐商品"
    };
    const requests: Array<{ current?: number; size?: number }> = [];
    const homeApi: Pick<HomeApi, "getForYouProducts"> = {
      async getForYouProducts(params) {
        requests.push(params ?? {});

        return {
          data: {
            modules: {
              forYouPage: {
                current: 2,
                pages: 3,
                records: [],
                size: 10,
                total: 21
              },
              forYouProducts: []
            },
            page: {
              current: 2,
              hasMore: true,
              pages: 3,
              size: 10,
              total: 21
            },
            view: {
              products: [nextProduct]
            }
          },
          requestId: "req-next-page",
          success: true
        };
      }
    };

    const state = await loadNextRecommendProductsPage({
      homeApi,
      state: {
        page: {
          current: 1,
          hasMore: true,
          size: 10
        },
        products: [firstProduct],
        status: "idle"
      }
    });

    expect(requests).toEqual([{ current: 2, size: 10 }]);
    expect(state.products.map((product) => product.id)).toEqual([firstProduct.id, nextProduct.id]);
    expect(state.page).toMatchObject({
      current: 2,
      hasMore: true,
      pages: 3,
      size: 10,
      total: 21
    });
  });
});
