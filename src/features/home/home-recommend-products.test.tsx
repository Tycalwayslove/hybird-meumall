import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { HomeRecommendProductsScreen, loadNextRecommendProductsPage } from "./components/HomeRecommendProductsScreen";
import type { HomeApi } from "./home-api";
import { homeExperienceData } from "./mock/home-page-data";

describe("HomeRecommendProductsScreen", () => {
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
