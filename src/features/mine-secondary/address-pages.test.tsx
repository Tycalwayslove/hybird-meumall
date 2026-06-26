import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import AddressEditPage from "@/app/address/edit/page";
import AddressPage from "@/app/address/page";
import OrderConfirmPage from "@/app/order-confirm/page";

function expectNoBareLocalAssetUrls(html: string) {
  expect(html).not.toContain('src="/assets/');
  expect(html).not.toContain('href="/assets/');
  expect(html).not.toContain("url(/assets/");
}

describe("address pages", () => {
  test("renders the address list without local address fallback data before real data loads", async () => {
    const html = renderToStaticMarkup(
      await AddressPage({
        searchParams: Promise.resolve({
          select: "1"
        })
      })
    );

    expect(html).toContain("收货地址");
    expect(html).toContain("正在同步地址");
    expect(html).toContain("暂无收货地址");
    expect(html).not.toContain("广东省广州市越秀区");
    expect(html).not.toContain("东风中路268号");
    expect(html).not.toContain("秦先生");
    expect(html).not.toContain("使用");
    expect(html).not.toContain("删除");
    expect(html).toContain("新增收货地址");
    expect(html).toContain("/address/edit");
    expectNoBareLocalAssetUrls(html);
  });

  test("renders the empty address state with the copied legacy empty image", async () => {
    const html = renderToStaticMarkup(
      await AddressPage({
        searchParams: Promise.resolve({
          state: "empty"
        })
      })
    );

    expect(html).toContain("暂无收货地址");
    expect(html).toContain("/assets/address/empty-address.png");
    expectNoBareLocalAssetUrls(html);
  });

  test("renders the add address form with recipient, phone, area and default controls", async () => {
    const html = renderToStaticMarkup(
      await AddressEditPage({
        searchParams: Promise.resolve({})
      })
    );

    expect(html).toContain("新增收货地址");
    expect(html).toContain("收货人");
    expect(html).toContain("手机号码");
    expect(html).toContain("所在地区");
    expect(html).toContain("正在同步省市区数据");
    expect(html).not.toContain('<option value="广东省">广东省</option>');
    expect(html).toContain("详细地址");
    expect(html).toContain("定位（Bridge 预留）");
    expect(html).toContain("设为默认地址");
    expect(html).toContain("保存");
    expect(html).toContain("/assets/address/location.png");
    expectNoBareLocalAssetUrls(html);
  });

  test("links order confirm address card to the selectable address list", async () => {
    const html = renderToStaticMarkup(
      await OrderConfirmPage({
        searchParams: Promise.resolve({
          productId: "p-1001",
          quantity: "1",
          skuId: "shirt-m"
        })
      })
    );

    expect(html).toContain("/address?select=1");
    expect(html).toContain("更换收货地址");
    expectNoBareLocalAssetUrls(html);
  });
});
