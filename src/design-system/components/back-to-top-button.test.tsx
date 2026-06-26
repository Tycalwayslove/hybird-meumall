import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { BackToTopButton } from "./BackToTopButton";

describe("BackToTopButton", () => {
  test("renders a reusable fixed back-to-top control", () => {
    const html = renderToStaticMarkup(<BackToTopButton />);

    expect(html).toContain('data-back-to-top-button="true"');
    expect(html).toContain('aria-label="回到顶部"');
    expect(html).toContain("顶部");
  });

  test("allows callers to customize the label and className", () => {
    const html = renderToStaticMarkup(<BackToTopButton ariaLabel="返回顶部" className="custom-top" label="Top" />);

    expect(html).toContain('aria-label="返回顶部"');
    expect(html).toContain("custom-top");
    expect(html).toContain("Top");
  });
});
