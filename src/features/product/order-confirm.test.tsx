import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import OrderConfirmPage from "@/app/order-confirm/page";

function expectNoBareLocalAssetUrls(html: string) {
  expect(html).not.toContain('src="/assets/');
  expect(html).not.toContain('href="/assets/');
  expect(html).not.toContain("url(/assets/");
}

describe("order confirm page", () => {
  it("renders the default submit order page with address and enabled submit button", async () => {
    const html = renderToStaticMarkup(
      await OrderConfirmPage({
        searchParams: Promise.resolve({
          productId: "p-1001",
          quantity: "1",
          skuId: "shirt-m"
        })
      })
    );

    expect(html).toContain("提交订单");
    expect(html).toContain("广东省广州市越秀区东风中路268号");
    expect(html).toContain("秦先生");
    expect(html).toContain("夏季纯棉短袖 T 恤男女同款宽松百搭休闲圆领上衣");
    expect(html).toContain("黑色，M");
    expect(html).toContain("黑色，L");
    expect(html).toContain("配送服务");
    expect(html).toContain("平台优惠券");
    expect(html).toContain("共4件 合计:");
    expect(html).toContain("￥8976");
    expect(html).toContain("submitButton");
    expect(html).toContain('data-product-image-placeholder="true"');
    expectNoBareLocalAssetUrls(html);
  });

  it("renders the missing-address state with a disabled submit button", async () => {
    const html = renderToStaticMarkup(
      await OrderConfirmPage({
        searchParams: Promise.resolve({
          address: "missing",
          productId: "p-1001",
          quantity: "1",
          skuId: "shirt-m"
        })
      })
    );

    expect(html).toContain("请先填写收货人信息");
    expect(html).toContain("disabled=\"\"");
    expect(html).toContain("submitButtonDisabled");
    expectNoBareLocalAssetUrls(html);
  });
});
