import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { PromotionProductsScreen } from "./components/PromotionProductsScreen";
import { buildPromotionSharePayload, sharePromotionProduct } from "./components/PromotionProductsScreen";
import { promotionProducts } from "./mock/products";

describe("PromotionProductsScreen", () => {
  test("keeps filter switching inside the current promotion products page state", () => {
    const html = renderToStaticMarkup(<PromotionProductsScreen />);

    expect(html).not.toContain("filter=category");
    expect(html).not.toContain("filter=commission");
    expect(html).not.toContain("filter=property");
    expect(html).not.toContain("filter=sales");
    expect(html).not.toContain("filter=price");
  });

  test("renders search, share and collect icons through local asset registry", () => {
    const html = renderToStaticMarkup(<PromotionProductsScreen />);

    expect(html).toContain("/assets/common/icons/search.png");
    expect(html).toContain("/assets/promotion/icons/share.png");
    expect(html).toContain("/assets/promotion/icons/collect.png");
  });

  test("uses the shared product image placeholder for promotion product cards", () => {
    const html = renderToStaticMarkup(<PromotionProductsScreen />);

    expect(html).toContain('data-product-image-placeholder="true"');
  });

  test("shows the selected dropdown option as the active filter label", () => {
    const html = renderToStaticMarkup(<PromotionProductsScreen filter="category" />);

    expect(html).toMatch(/aria-current="true"[^>]*><span>生鲜熟食<\/span>/);
  });

  test("builds a bridge share payload from the promotion product card", () => {
    expect(buildPromotionSharePayload(promotionProducts[0])).toEqual({
      productId: "1001",
      title: "夏季纯棉短袖T恤男女同款宽松百搭休闲圆领上衣ins潮牌打底衫",
      source: "promotion_products"
    });
  });

  test("emits the promotion share payload through native bridge when available", () => {
    const messages: unknown[] = [];
    const bridge = {
      emit(eventName: string, payload: unknown) {
        messages.push({ eventName, payload });
      },
      isAvailable() {
        return true;
      }
    };

    expect(sharePromotionProduct(promotionProducts[0], bridge)).toBe(true);
    expect(messages).toEqual([
      {
        eventName: "share",
        payload: {
          productId: "1001",
          title: "夏季纯棉短袖T恤男女同款宽松百搭休闲圆领上衣ins潮牌打底衫",
          source: "promotion_products"
        }
      }
    ]);
  });
});
