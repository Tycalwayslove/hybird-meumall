import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  test("renders the shared empty artwork and default copy", () => {
    const html = renderToStaticMarkup(<EmptyState />);

    expect(html).toContain('data-empty-state="true"');
    expect(html).toContain("/hybird/assets/placeholders/empty-state-mascot.png");
    expect(html).toContain("这里空空如也～");
    expect(html).toContain("width:160px");
    expect(html).toContain("font-size:14px");
    expect(html).toContain("color:#575757");
  });

  test("allows callers to customize text, image size, font size and spacing", () => {
    const html = renderToStaticMarkup(
      <EmptyState
        className="custom-empty"
        gap={16}
        imageAlt="没有商品"
        imageSize={120}
        text="暂无秒杀商品"
        textColor="#333333"
        textSize={13}
      />
    );

    expect(html).toContain("custom-empty");
    expect(html).toContain('alt="没有商品"');
    expect(html).toContain("暂无秒杀商品");
    expect(html).toContain("gap:16px");
    expect(html).toContain("width:120px");
    expect(html).toContain("font-size:13px");
    expect(html).toContain("color:#333333");
  });
});
