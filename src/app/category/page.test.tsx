import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import CategoryPage from "./page";

describe("CategoryPage", () => {
  test("renders the Figma category layout without legacy commerce shell copy", () => {
    const html = renderToStaticMarkup(<CategoryPage />);

    expect(html).toContain("商品分类");
    expect(html).toContain('data-category-skeleton="true"');
    expect(html).not.toContain("一级分类");
    expect(html).not.toContain("二级分类");
    expect(html).not.toContain("三级分类");
    expect(html).not.toContain('href="#level-');
    expect(html).not.toContain("CATEGORY");
    expect(html).not.toContain('src="/assets/');
    expect(html).not.toContain('href="/assets/');
  });
});
