import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProductRichContent } from "./components/ProductRichContent";

describe("ProductRichContent", () => {
  it("renders sanitized rich text as React elements", () => {
    const html = renderToStaticMarkup(
      <ProductRichContent
        html={
          '<p>第一段</p><ul><li>卖点一</li></ul><img src="https://cdn.example.com/detail.jpg" onerror="alert(1)" /><script>alert(1)</script>'
        }
      />
    );

    expect(html).toContain("<p>第一段</p>");
    expect(html).toContain("<li>卖点一</li>");
    expect(html).toContain('src="https://cdn.example.com/detail.jpg"');
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("<script");
  });

  it("renders a fallback when rich text is empty", () => {
    const html = renderToStaticMarkup(<ProductRichContent fallback="暂无详情" html="" />);

    expect(html).toContain("暂无详情");
  });
});
