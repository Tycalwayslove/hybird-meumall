import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import ProductDetailPage from "@/app/product/[id]/page";

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
    expect(html).toContain('href="/order-confirm"');
    expectNoBareLocalAssetUrls(html);
  });

  it("renders a recoverable not-found state for unknown products", async () => {
    const html = renderToStaticMarkup(await ProductDetailPage({ params: Promise.resolve({ id: "missing-product" }) }));

    expect(html).toContain("商品暂时不可见");
    expect(html).toContain("返回首页");
    expect(html).not.toContain("NEXT_NOT_FOUND");
  });
});
