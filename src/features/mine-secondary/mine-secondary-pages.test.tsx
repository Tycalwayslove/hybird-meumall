import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { CouponsScreen } from "./components/CouponsScreen";
import { OrdersScreen } from "./components/OrdersScreen";
import { ProductCollectionScreen } from "./components/ProductCollectionScreen";
import { WalletScreen } from "./components/WalletScreen";

describe("mine secondary pages", () => {
  test("renders the wallet balance card and settlement records", () => {
    const html = renderToStaticMarkup(<WalletScreen />);

    expect(html).toContain("我的钱包");
    expect(html).toContain("帐户余额(元)");
    expect(html).toContain("2383.43");
    expect(html).toContain("已结算");
    expect(html).toContain("待结算");
    expect(html).toContain("历史钱包");
    expect(html).toContain("本月(1月1日~1月31日)");
    expect(html).not.toContain("/wallet?tab=");
  });

  test("renders favorites and edit controls", () => {
    const html = renderToStaticMarkup(<ProductCollectionScreen mode="favorites" initialEditing />);

    expect(html).toContain("我的收藏");
    expect(html).toContain("夏季纯棉短袖T恤");
    expect(html).toContain("全选");
    expect(html).toContain("已选8条");
    expect(html).toContain("删除");
    expect(html).not.toContain("确认删除");
  });

  test("renders footprints with the same product list structure", () => {
    const html = renderToStaticMarkup(<ProductCollectionScreen mode="footprints" />);

    expect(html).toContain("我的足迹");
    expect(html).toContain("编辑");
    expect(html).toContain("已售: 1w+");
  });

  test("renders coupon cards", () => {
    const html = renderToStaticMarkup(<CouponsScreen />);

    expect(html).toContain("我的优惠券");
    expect(html).toContain("可使用优惠券");
    expect(html).toContain("优惠券名称");
    expect(html).toContain("去使用");
  });

  test("renders orders by status and empty state", () => {
    const receivingHtml = renderToStaticMarkup(<OrdersScreen initialStatus="pending-receipt" />);
    const emptyHtml = renderToStaticMarkup(<OrdersScreen initialStatus="empty" />);

    expect(receivingHtml).toContain("订单列表");
    expect(receivingHtml).toContain("待收货");
    expect(receivingHtml).toContain("继续付款");
    expect(emptyHtml).toContain("这里空空如也~");
    expect(receivingHtml).not.toContain("/orders?status=");
  });
});
