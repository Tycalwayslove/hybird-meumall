import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";

import { CouponsScreen } from "./components/CouponsScreen";
import { OrderEmptyState, OrdersScreen } from "./components/OrdersScreen";
import { RefundsEmptyState, RefundsScreen } from "./components/RefundsScreen";
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
    expect(html).toContain("商品列表加载中");
    expect(html).toContain("全选");
    expect(html).toContain("已选<span>0</span>条");
    expect(html).toContain("删除");
    expect(html).not.toContain("夏季纯棉短袖T恤");
  });

  test("renders footprints in real-api loading state without mock products", () => {
    const html = renderToStaticMarkup(<ProductCollectionScreen mode="footprints" />);

    expect(html).toContain("我的足迹");
    expect(html).toContain("编辑");
    expect(html).toContain("商品列表加载中");
    expect(html).not.toContain("已售: 1w+");
  });

  test("renders coupon cards", () => {
    const html = renderToStaticMarkup(<CouponsScreen />);

    expect(html).toContain("我的优惠券");
    expect(html).toContain("可使用优惠券");
    expect(html).toContain("优惠券名称");
    expect(html).toContain("去使用");
  });

  test("renders orders tabs in real-api loading state without after-sales refund tab", () => {
    const receivingHtml = renderToStaticMarkup(<OrdersScreen initialStatus="pending-receipt" />);

    expect(receivingHtml).toContain("订单列表");
    expect(receivingHtml).toContain("待收货");
    expect(receivingHtml).not.toContain("退货退款");
    expect(receivingHtml).not.toContain("夏季纯棉短袖");
    expect(receivingHtml).not.toContain("/orders?status=");
  });

  test("uses the shared empty state component for order empty state", () => {
    const html = renderToStaticMarkup(<OrderEmptyState text="这里空空如也~" />);

    expect(html).toContain('data-empty-state="true"');
    expect(html).toContain("/hybird/assets/placeholders/empty-state-mascot.png");
    expect(html).not.toContain("boxTop");
    expect(html).not.toContain("boxBody");
  });

  test("renders refunds as a standalone page", () => {
    const refundHtml = renderToStaticMarkup(<RefundsScreen />);

    expect(refundHtml).toContain("退货退款");
    expect(refundHtml).toContain("退款记录加载中");
    expect(refundHtml).not.toContain("待付款");
  });

  test("uses the shared empty state component for refund list empty state", () => {
    const html = renderToStaticMarkup(<RefundsEmptyState />);

    expect(html).toContain('data-empty-state="true"');
    expect(html).toContain("/hybird/assets/placeholders/empty-state-mascot.png");
    expect(html).toContain("暂无退货退款记录");
  });
});
