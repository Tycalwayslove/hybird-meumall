import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import ProductDetailPage from "@/app/product/[id]/page";
import { ProductPurchaseSheet } from "./components/ProductPurchaseSheet";
import { mockProductDetails } from "./mock/product-detail";

function expectNoBareLocalAssetUrls(html: string) {
  expect(html).not.toContain('src="/assets/');
  expect(html).not.toContain('href="/assets/');
  expect(html).not.toContain("url(/assets/");
}

describe("product detail page", () => {
  it("renders the Figma-aligned product detail structure for a known product", async () => {
    const html = renderToStaticMarkup(await ProductDetailPage({ params: Promise.resolve({ id: "p-1001" }) }));

    expect(html).toContain("商品详情");
    expect(html).toContain("V3达人专享价");
    expect(html).toContain("￥2898");
    expect(html).toContain("夏季纯棉短袖 T 恤男女同款宽松百搭休闲圆领上衣");
    expect(html).toContain("7天无理由退货");
    expect(html).toContain("假一罚十");
    expect(html).toContain("退货免运费");
    expect(html).toContain("已选：海参唤醒金装送人礼盒1盒");
    expect(html).toContain("7天内发货");
    expect(html).toContain("评价：100+");
    expect(html).toContain("好评率90%");
    expect(html).toContain("商品详情");
    expect(html).toContain("衣服质量如何？");
    expect(html).toContain('href="/consult"');
    expect(html).toContain("立即购买");
    expect(html).not.toContain('href="#selection"');
    expect(html).not.toContain('href="#address"');
    expectNoBareLocalAssetUrls(html);
  });

  it("renders the Figma-aligned purchase sheet with sku, quantity and confirm href", () => {
    const html = renderToStaticMarkup(<ProductPurchaseSheet data={mockProductDetails[0]} onClose={() => undefined} />);

    expect(html).toContain("购买规格选择");
    expect(html).toContain("夏季纯棉短袖T恤(2)");
    expect(html).toContain("库存");
    expect(html).toContain("1000件");
    expect(html).toContain("<span>￥</span>628.");
    expect(html).toContain("快递配送");
    expect(html).toContain("确认");
    expect(html).toContain("productId=p-1001");
    expect(html).toContain("skuId=shirt-m");
    expect(html).toContain("quantity=1");
    expect(html).toContain('data-product-image-placeholder="true"');
    expectNoBareLocalAssetUrls(html);
  });

  it("renders a recoverable not-found state for unknown products", async () => {
    const html = renderToStaticMarkup(await ProductDetailPage({ params: Promise.resolve({ id: "missing-product" }) }));

    expect(html).toContain("商品暂时不可见");
    expect(html).toContain("返回首页");
    expect(html).not.toContain("NEXT_NOT_FOUND");
  });
});
