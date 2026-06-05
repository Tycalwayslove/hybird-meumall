import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { SearchScreen } from "./components/SearchScreen";
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

  test("does not hardcode local public asset paths or product images", () => {
    const html = renderToStaticMarkup(<SearchScreen data={searchPageData} />);

    expect(html).not.toContain("/assets/");
    expect(html).not.toContain("<img");
  });
});
