import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import CategoryPage from "./page";

describe("CategoryPage", () => {
  test("renders the Figma category layout without legacy commerce shell copy", () => {
    const html = renderToStaticMarkup(<CategoryPage />);

    expect(html).toContain("商品分类");
    expect(html).toContain('aria-label="一级分类"');
    expect(html).toContain('aria-label="分类内容"');
    expect(html).toContain("二级分类");
    expect(html).toContain("三级分类");
    expect(html).toContain("bg-brand-action");
    expect(html).toContain("aspect-square");
    expect(html).not.toContain('href="#level-');
    expect(html).not.toContain("分类结果骨架");
    expect(html).not.toContain("CATEGORY");
    expect(html).not.toContain('src="/assets/');
    expect(html).not.toContain('href="/assets/');
  });
});
