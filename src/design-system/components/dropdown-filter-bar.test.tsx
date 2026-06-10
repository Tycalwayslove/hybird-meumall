import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { DropdownFilterBar } from "./DropdownFilterBar";

describe("DropdownFilterBar", () => {
  test("renders a clickable overlay only for the expanded filter", () => {
    const html = renderToStaticMarkup(
      <DropdownFilterBar
        expandedKey="category"
        items={[
          {
            active: true,
            href: "/search",
            key: "category",
            label: "分类",
            options: [{ href: "/search", key: "fresh", label: "生鲜熟食", selected: true }]
          },
          {
            active: false,
            href: "/search",
            key: "price",
            label: "价格",
            options: [{ href: "/search", key: "price_asc", label: "价格从低到高" }]
          }
        ]}
      />
    );

    expect(html).toContain('aria-label="收起筛选条件"');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain("生鲜熟食");
    expect(html).not.toContain("价格从低到高");
  });

  test("uses the selected option label for the active dropdown item", () => {
    const html = renderToStaticMarkup(
      <DropdownFilterBar
        expandedKey={null}
        items={[
          {
            active: true,
            href: "/search",
            key: "category",
            label: "分类",
            options: [{ href: "/search", key: "fresh", label: "生鲜熟食", selected: true }],
            selectedOptionKey: "fresh"
          }
        ]}
      />
    );

    expect(html).toContain("<span>生鲜熟食</span>");
    expect(html).not.toContain("<span>分类</span>");
  });
});
