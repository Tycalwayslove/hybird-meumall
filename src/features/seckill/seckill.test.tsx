import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { SeckillScreen } from "./components/SeckillScreen";

describe("SeckillScreen", () => {
  test("renders the seckill hero background through local asset registry", () => {
    const html = renderToStaticMarkup(<SeckillScreen />);

    expect(html).toContain("/assets/seckill/seckill-hero-bg.png");
  });

  test("uses the shared product image placeholder for seckill product cards", () => {
    const html = renderToStaticMarkup(<SeckillScreen />);

    expect(html).toContain('data-product-image-placeholder="true"');
  });
});
