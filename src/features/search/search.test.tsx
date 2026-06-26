import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import {
  buildNextSearchCategoryLevels,
  getSearchCategoryRequestState,
  getNextSearchSortState,
  getSearchSubmitMode,
  shouldAutoLoadNextSearchPage,
  getSearchSortOrderBy,
  handleSearchExitNavigation,
  SearchRankingScreen,
  SearchScreen
} from "./components/SearchScreen";
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

  test("shows hot keyword skeleton instead of mock hot words before the real API returns", () => {
    const html = renderToStaticMarkup(<SearchScreen data={{ ...searchPageData, historyKeywords: [], hotKeywords: [] }} />);

    expect(html).toContain('data-search-hot-keywords-skeleton="true"');
    expect(html).not.toContain(">保健品</a>");
    expect(html).toContain("暂无搜索历史");
  });

  test("shows ranking skeleton instead of mock ranking products before the ranking API returns", () => {
    const html = renderToStaticMarkup(<SearchScreen data={{ ...searchPageData, activeRankingTab: "", products: [], rankingTabs: [] }} />);

    expect(html).toContain('data-search-ranking-skeleton="true"');
    expect(html).not.toContain("棉短袖T恤");
  });

  test("uses the shared empty state when ranking products are empty", () => {
    const html = renderToStaticMarkup(<SearchScreen data={{ ...searchPageData, products: [] }} />);

    expect(html).toContain('data-empty-state="true"');
    expect(html).toContain("暂无榜单商品");
    expect(html).toContain("/hybird/assets/placeholders/empty-state-mascot.png");
  });

  test("keeps the search ranking empty state off the white card background", () => {
    const css = readFileSync(new URL("./components/SearchScreen.module.css", import.meta.url), "utf8");

    expect(css).toMatch(/\.rankingEmptyState\s*\{[^}]*background:\s*transparent;/s);
  });

  test("renders only the shared placeholder icon in the static mock phase", () => {
    const html = renderToStaticMarkup(<SearchScreen data={searchPageData} />);

    expect(html).toContain('data-product-image-placeholder-icon="true"');
    expect(html).toContain("/hybird/assets/placeholders/product-image-placeholder.png");
    expect(html).not.toContain('src="/assets/');
  });

  test("uses the shared product image placeholder for product cards", () => {
    const homeHtml = renderToStaticMarkup(<SearchScreen data={searchPageData} />);
    const resultHtml = renderToStaticMarkup(<SearchScreen data={searchPageData} query="短袖" />);

    expect(homeHtml).toContain('data-product-image-placeholder="true"');
    expect(resultHtml).not.toContain('data-product-image-placeholder="true"');
    expect(resultHtml).toContain('data-search-products-skeleton="true"');
  });

  test("does not render local mock products or categories on the real result page before the API returns", () => {
    const html = renderToStaticMarkup(<SearchScreen data={searchPageData} query="短袖" />);

    expect(html).toContain('data-search-products-skeleton="true"');
    expect(html).not.toContain("夏季纯棉短袖");
    expect(html).not.toContain("棉短袖T恤");
    expect(html).not.toContain("价格从低到高");
    expect(html).not.toContain("男装");
  });

  test("renders search, close and delete icons through local asset registry", () => {
    const homeHtml = renderToStaticMarkup(<SearchScreen data={searchPageData} />);
    const resultHtml = renderToStaticMarkup(<SearchScreen data={searchPageData} query="短袖" />);

    expect(resultHtml).toContain("/assets/common/icons/search.png");
    expect(resultHtml).toContain("/assets/common/icons/close.png");
    expect(homeHtml).toContain("/assets/common/icons/delete.png");
  });

  test("uses one custom clear affordance without the native search cancel icon", () => {
    const resultHtml = renderToStaticMarkup(<SearchScreen data={searchPageData} query="短袖" />);

    expect(resultHtml).toContain('type="text"');
    expect(resultHtml).not.toContain('type="search"');
    expect(resultHtml.match(/aria-label="清空搜索词"/g)).toHaveLength(1);
  });

  test("renders per-keyword delete controls for search history", () => {
    const html = renderToStaticMarkup(<SearchScreen data={{ ...searchPageData, historyKeywords: ["保健品", "生鲜"] }} />);

    expect(html).toContain('aria-label="删除搜索历史：保健品"');
    expect(html).toContain('aria-label="删除搜索历史：生鲜"');
    expect(html.match(/aria-label="清空搜索历史"/g)).toHaveLength(1);
  });

  test("keeps ranking tab switching inside the current search page state", () => {
    const html = renderToStaticMarkup(<SearchScreen data={searchPageData} />);

    expect(html).not.toContain("?ranking=");
  });

  test("links the full ranking page to the currently selected category ranking tab", () => {
    const html = renderToStaticMarkup(<SearchScreen data={{ ...searchPageData, activeRankingTab: "rank-2-1001" }} />);

    expect(html).toContain('href="/search/ranking?rankType=2&amp;categoryId=1001"');
  });

  test("marks the active ranking tab as non-refreshable", () => {
    const html = renderToStaticMarkup(<SearchScreen data={searchPageData} />);

    expect(html).toMatch(/<button[^>]*aria-disabled="true"[^>]*aria-current="page"[^>]*>喵呜热榜<\/button>/);
  });

  test("lets the home ranking section fill the remaining viewport with its background", () => {
    const css = readFileSync(new URL("./components/SearchScreen.module.css", import.meta.url), "utf8");

    expect(css).toMatch(/\.content\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;[^}]*min-height:\s*calc\(/s);
    expect(css).toMatch(/\.ranking\s*\{[^}]*flex:\s*1\s+1\s+auto;[^}]*background:\s*#f9fff3;/s);
  });

  test("replaces search history when leaving search for product detail or the full ranking page", () => {
    const replacements: string[] = [];
    const productClick = createSearchExitClickEvent();
    const rankingClick = createSearchExitClickEvent();

    expect(handleSearchExitNavigation(productClick, "/product/1000054", (href) => replacements.push(href))).toBe(true);
    expect(handleSearchExitNavigation(rankingClick, "/search/ranking", (href) => replacements.push(href))).toBe(true);

    expect(productClick.preventDefaultCalled).toBe(true);
    expect(rankingClick.preventDefaultCalled).toBe(true);
    expect(replacements).toEqual(["/product/1000054", "/search/ranking"]);
  });

  test("keeps modified search exit clicks as normal browser actions", () => {
    const replacements: string[] = [];
    const event = createSearchExitClickEvent({ metaKey: true });

    expect(handleSearchExitNavigation(event, "/product/1000054", (href) => replacements.push(href))).toBe(false);

    expect(event.preventDefaultCalled).toBe(false);
    expect(replacements).toEqual([]);
  });

  test("keeps result filter switching inside the current search page state", () => {
    const html = renderToStaticMarkup(<SearchScreen data={searchPageData} query="短袖" />);

    expect(html).not.toContain("filter=category");
    expect(html).not.toContain("filter=price");
  });

  test("keeps result sort and category state when submitting a new keyword", () => {
    expect(getSearchSubmitMode({ isResultPage: true })).toBe("local");
    expect(getSearchSubmitMode({ isResultPage: false })).toBe("navigate");
  });

  test("renders mutually exclusive sales and price sort controls with direction arrows", () => {
    const html = renderToStaticMarkup(<SearchScreen data={searchPageData} query="短袖" />);

    expect(html).toContain('aria-label="销量降序"');
    expect(html).toContain('aria-label="价格升序"');
    expect(html).toContain("↑");
    expect(html).toContain("↓");
    expect(html).not.toContain("价格从低到高");
    expect(html).not.toContain("价格从高到低");
  });

  test("maps search sort state to the Java orderBy parameter", () => {
    expect(getSearchSortOrderBy({ direction: "desc", field: "soldNum" })).toBe("-soldNum");
    expect(getSearchSortOrderBy({ direction: "asc", field: "soldNum" })).toBe("+soldNum");
    expect(getSearchSortOrderBy({ direction: "asc", field: "price" })).toBe("+price");
    expect(getSearchSortOrderBy({ direction: "desc", field: "price" })).toBe("-price");
    expect(getNextSearchSortState({ direction: "desc", field: "soldNum" }, "soldNum")).toEqual({ direction: "asc", field: "soldNum" });
    expect(getNextSearchSortState({ direction: "asc", field: "soldNum" }, "price")).toEqual({ direction: "asc", field: "price" });
  });

  test("appends category descendants level by level", () => {
    const secondLevel = [{ id: "111", label: "低温奶" }];
    const firstLevel = [{ children: secondLevel, id: "110", label: "乳品" }];
    const thirdLevel = [{ id: "11101", label: "儿童奶" }];

    expect(buildNextSearchCategoryLevels({ levels: [firstLevel], nextCategories: [], selectedPath: ["110"] })).toEqual([firstLevel, secondLevel]);
    expect(buildNextSearchCategoryLevels({ levels: [firstLevel, secondLevel], nextCategories: thirdLevel, selectedPath: ["110", "111"] })).toEqual([
      firstLevel,
      secondLevel,
      thirdLevel
    ]);
    expect(buildNextSearchCategoryLevels({ levels: [firstLevel, secondLevel, thirdLevel], nextCategories: [], selectedPath: ["110", "111"] })).toEqual([
      firstLevel,
      secondLevel
    ]);
  });

  test("renders refined result filter controls and cascade level labels", () => {
    const html = renderToStaticMarkup(<SearchScreen data={searchPageData} filter="category" query="短袖" />);

    expect(html).toContain("resultFilterShell");
    expect(html).toContain("综合筛选");
    expect(html).toContain("一级类目");
  });

  test("renders a blocking overlay and explicit category filter actions", () => {
    const html = renderToStaticMarkup(<SearchScreen data={searchPageData} filter="category" query="短袖" />);
    const css = readFileSync(new URL("./components/SearchScreen.module.css", import.meta.url), "utf8");

    expect(html).toContain("resultViewportLocked");
    expect(html).toContain("categoryCascadeOverlay");
    expect(html).toContain("重置");
    expect(html).toContain("确认");
    expect(css).toMatch(/\.resultViewportLocked\s*\{[^}]*overflow:\s*hidden;/s);
    expect(css).toMatch(/\.categoryCascadeOverlay\s*\{[^}]*position:\s*fixed;/s);
  });

  test("keeps category choices pending until the user confirms them", () => {
    expect(getSearchCategoryRequestState({ appliedCategoryPath: [], categoryScopeId: "110" })).toEqual({
      categoryOptionsParentId: "110",
      selectedCategoryId: "110"
    });
    expect(getSearchCategoryRequestState({ appliedCategoryPath: ["111"], categoryScopeId: "110" })).toEqual({
      categoryOptionsParentId: "111",
      selectedCategoryId: "111"
    });
  });

  test("uses an automatic bottom sentinel instead of a load more button", () => {
    const css = readFileSync(new URL("./components/SearchScreen.module.css", import.meta.url), "utf8");

    expect(css).toMatch(/\.resultAutoLoadSentinel\s*\{/);
    expect(css).not.toMatch(/\.resultLoadMore\s*\{/);
    expect(shouldAutoLoadNextSearchPage({ hasMore: true, productCount: 2, status: "success" })).toBe(true);
    expect(shouldAutoLoadNextSearchPage({ hasMore: true, productCount: 2, status: "loading" })).toBe(false);
    expect(shouldAutoLoadNextSearchPage({ hasMore: false, productCount: 2, status: "success" })).toBe(false);
  });

  test("shows the selected result filter option as the active filter label", () => {
    const categoryHtml = renderToStaticMarkup(<SearchScreen data={searchPageData} filter="category" query="短袖" />);
    const priceHtml = renderToStaticMarkup(<SearchScreen data={searchPageData} filter="price" query="短袖" />);

    expect(categoryHtml).toContain("categoryCascadePanel");
    expect(priceHtml).toContain('aria-label="价格升序"');
  });

  test("keeps the full ranking tabs in a sticky top area below the fixed nav", () => {
    const html = renderToStaticMarkup(<SearchRankingScreen data={searchPageData} />);

    expect(html).toContain("rankingTabsSticky");
    expect(html).toContain("喵呜热榜");
  });
});

function createSearchExitClickEvent(overrides: Partial<Parameters<typeof handleSearchExitNavigation>[0]> = {}) {
  return {
    altKey: false,
    button: 0,
    ctrlKey: false,
    defaultPrevented: false,
    metaKey: false,
    preventDefaultCalled: false,
    shiftKey: false,
    preventDefault() {
      this.preventDefaultCalled = true;
    },
    ...overrides
  };
}
