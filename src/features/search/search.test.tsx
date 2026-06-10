import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { SearchRankingScreen, SearchScreen } from "./components/SearchScreen";
import { searchPageData } from "./mock/search-page-data";

describe("SearchScreen", () => {
  test("renders Figma search page sections with local mock data", () => {
    const html = renderToStaticMarkup(<SearchScreen data={searchPageData} />);

    expect(html).toContain("请输入商品名称搜索");
    expect(html).toContain("热门搜索");
    expect(html).toContain("搜索历史");
    expect(html).toContain("喵呜热榜");
    expect(html).toContain("官方榜单 · 真实数据 · 每周更新");
    expect(html).toContain("限时秒杀");
    expect(html).toContain("喵呜达人");
  });

  test("does not render product image elements in the static mock phase", () => {
    const html = renderToStaticMarkup(<SearchScreen data={searchPageData} />);

    expect(html).not.toContain("<img");
  });

  test("uses the shared product image placeholder for product cards", () => {
    const homeHtml = renderToStaticMarkup(<SearchScreen data={searchPageData} />);
    const resultHtml = renderToStaticMarkup(<SearchScreen data={searchPageData} query="短袖" />);

    expect(homeHtml).toContain('data-product-image-placeholder="true"');
    expect(resultHtml).toContain('data-product-image-placeholder="true"');
  });

  test("renders search, close and delete icons through local asset registry", () => {
    const homeHtml = renderToStaticMarkup(<SearchScreen data={searchPageData} />);
    const resultHtml = renderToStaticMarkup(<SearchScreen data={searchPageData} query="短袖" />);

    expect(resultHtml).toContain("/assets/common/icons/search.png");
    expect(resultHtml).toContain("/assets/common/icons/close.png");
    expect(homeHtml).toContain("/assets/common/icons/delete.png");
  });

  test("keeps ranking tab switching inside the current search page state", () => {
    const html = renderToStaticMarkup(<SearchScreen data={searchPageData} />);

    expect(html).not.toContain("?ranking=");
  });

  test("keeps result filter switching inside the current search page state", () => {
    const html = renderToStaticMarkup(<SearchScreen data={searchPageData} query="短袖" />);

    expect(html).not.toContain("filter=category");
    expect(html).not.toContain("filter=price");
  });

  test("shows the selected result filter option as the active filter label", () => {
    const categoryHtml = renderToStaticMarkup(<SearchScreen data={searchPageData} filter="category" query="短袖" />);
    const priceHtml = renderToStaticMarkup(<SearchScreen data={searchPageData} filter="price" query="短袖" />);

    expect(categoryHtml).toMatch(/aria-current="true"[^>]*><span>生鲜熟食<\/span>/);
    expect(priceHtml).toMatch(/aria-current="true"[^>]*><span>价格从低到高<\/span>/);
  });

  test("keeps the full ranking tabs in a sticky top area below the fixed nav", () => {
    const html = renderToStaticMarkup(<SearchRankingScreen data={searchPageData} />);

    expect(html).toContain("rankingTabsSticky");
    expect(html).toContain("喵呜热榜");
  });
});
