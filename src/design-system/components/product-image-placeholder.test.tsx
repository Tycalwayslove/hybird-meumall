import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { ProductImagePlaceholder } from "./ProductImagePlaceholder";

describe("ProductImagePlaceholder", () => {
  test("renders a reusable gray product image placeholder", () => {
    const html = renderToStaticMarkup(<ProductImagePlaceholder ariaLabel="商品图片占位" className="h-20 w-20" />);

    expect(html).toContain('data-product-image-placeholder="true"');
    expect(html).toContain('data-product-image-placeholder-icon="true"');
    expect(html).toContain("/hybird/assets/placeholders/product-image-placeholder.png");
    expect(html).toContain('aria-label="商品图片占位"');
    expect(html).toContain("h-20 w-20");
    expect(html).not.toContain("rounded-full");
    expect(html).not.toContain("bg-white");
  });

  test("can hide the default icon for custom placeholder artwork", () => {
    const html = renderToStaticMarkup(
      <ProductImagePlaceholder decorative hideDefaultIcon>
        <span>custom</span>
      </ProductImagePlaceholder>
    );

    expect(html).toContain("custom");
    expect(html).not.toContain('data-product-image-placeholder-icon="true"');
  });
});
