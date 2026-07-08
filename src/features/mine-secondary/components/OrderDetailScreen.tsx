"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductImagePlaceholder, StandardNavPage } from "@/design-system";
import { createH5Client } from "@/lib/http";
import { buildClientHref } from "@/lib/navigation";
import { createCashierHrefFromSubmitResult } from "@/features/payment/cashier-links";
import { createPaymentApi } from "@/features/payment/api";

import { createOrdersApi } from "../api";
import type { OrderAction, OrderDetailView, OrderProductView } from "../server/orders-real-service";
import styles from "./OrdersScreen.module.css";

export function OrderDetailScreen({ orderNumber }: { orderNumber: string }) {
  const [detail, setDetail] = useState<OrderDetailView | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const api = useMemo(() => createOrdersApi(createH5Client()), []);
  const paymentApi = useMemo(() => createPaymentApi(createH5Client()), []);

  useEffect(() => {
    let cancelled = false;
    async function loadDetail() {
      setLoading(true);
      setError("");
      const result = await api.getOrderDetail(orderNumber);
      if (cancelled) return;
      if (!result.success) {
        setError(result.message || "订单详情加载失败。");
        setLoading(false);
        return;
      }
      setDetail(result.data.view);
      setLoading(false);
    }
    void loadDetail();
    return () => {
      cancelled = true;
    };
  }, [api, orderNumber]);

  const onAction = async (action: OrderAction) => {
    if (!detail) return;
    if (action.id === "pay") {
      const payInfo = await paymentApi.getOrderPayInfo({
        dvyType: String(detail.dvyType),
        isPurePoints: "0",
        orderNumbers: detail.orderNumber,
        orderType: String(detail.orderType),
        ordermold: String(detail.orderMold)
      });
      if (!payInfo.success) {
        setError(payInfo.message || "订单支付信息获取失败。");
        return;
      }
      if (isExpired(payInfo.data.view.endTime)) {
        setError("订单已过期，请重新下单。");
        return;
      }
      window.location.assign(createCashierHrefFromSubmitResult({
        dvyType: String(detail.dvyType),
        orderNumbers: detail.orderNumber,
        orderType: String(detail.orderType)
      }));
      return;
    }
    if (action.id === "logistics") {
      window.location.assign(buildClientHref(`/orders/logistics/${encodeURIComponent(detail.orderNumber)}`));
      return;
    }
    if (action.id === "contact") {
      const messageContent = window.prompt("请描述你要咨询的问题", "");
      if (!messageContent) return;
      const userMobile = window.prompt("请输入联系方式", "") || "";
      if (!userMobile) return;
      const result = await api.submitContactMessage({
        messageContent,
        orderNumber: detail.orderNumber,
        userMobile
      });
      if (!result.success) {
        setError(result.message || "留言提交失败。");
      }
      return;
    }
    const confirmText = action.id === "delete" ? "确认删除该订单？" : action.id === "receipt" ? "确认已收到商品？" : "确认取消该订单？";
    if (!window.confirm(confirmText)) return;
    const result =
      action.id === "delete"
        ? await api.deleteOrder(detail.orderNumber)
        : action.id === "receipt"
          ? await api.receiptOrder(detail.orderNumber)
          : await api.cancelOrder(detail.orderNumber);
    if (!result.success) {
      setError(result.message || "订单操作失败。");
      return;
    }
    window.location.assign(buildClientHref("/orders"));
  };

  return (
    <StandardNavPage title="订单详情" backHref="/orders" className={styles.screen} contentClassName={styles.content}>
      {loading ? <DetailSkeleton /> : error ? <p className={styles.errorText}>{error}</p> : detail ? <OrderDetailContent detail={detail} onAction={onAction} /> : null}
    </StandardNavPage>
  );
}

function OrderDetailContent({ detail, onAction }: { detail: OrderDetailView; onAction: (action: OrderAction) => void }) {
  if (!detail.canRenderAsOrdinaryExpress) {
    return (
      <section className={styles.detailSection}>
        <h2>{detail.statusLabel}</h2>
        <p>该订单类型需要专属详情页，当前 H5 首期暂未开放。</p>
      </section>
    );
  }

  const startRefund = (refundType: 1 | 2, item?: OrderProductView) => {
    saveRefundContext({ item, order: detail, refundType });
    if (detail.status === "pending-shipment") {
      window.location.assign(buildClientHref(`/refunds/apply?type=1&refundType=${refundType}`));
      return;
    }
    if (detail.orderMold === 1) {
      window.location.assign(buildClientHref(`/refunds/apply?type=1&refundType=${refundType}&orderMold=1`));
      return;
    }
    window.location.assign(buildClientHref(`/refunds/choose-way?refundType=${refundType}`));
  };

  return (
    <div className={styles.detailStack}>
      <section className={styles.detailHero}>
        <h2>{detail.statusLabel}</h2>
        <p>订单号：{detail.orderNumber}</p>
      </section>
      {detail.delivery ? (
        <section className={styles.detailSection} id="order-delivery">
          <h3>物流信息</h3>
          <p>{detail.delivery.stateLabel}</p>
          <p>{detail.delivery.latestTrace}</p>
          <span>{detail.delivery.latestTime}</span>
        </section>
      ) : null}
      <section className={styles.detailSection}>
        <h3>收货信息</h3>
        <p>
          {detail.contactName} {detail.contactPhone}
        </p>
        <p>{detail.address || "暂无收货地址"}</p>
      </section>
      <section className={styles.detailSection}>
        <h3>{detail.shopName}</h3>
        <div className={styles.orderItems}>
          {detail.items.map((item) => (
            <DetailProductItem item={item} key={`${detail.orderNumber}-${item.prodId}-${item.skuId}`} orderCanRefund={detail.canRefund} onRefund={() => startRefund(2, item)} />
          ))}
        </div>
      </section>
      <section className={styles.detailSection}>
        <h3>费用明细</h3>
        <div className={styles.feeRows}>
          {detail.feeRows.map((row) => (
            <p key={row.label}>
              <span>{row.label}</span>
              <strong>{row.value}</strong>
            </p>
          ))}
        </div>
      </section>
      <section className={styles.detailSection}>
        <h3>订单信息</h3>
        <p>创建时间：{detail.createTime || "-"}</p>
        <p>支付时间：{detail.payTime || "-"}</p>
      </section>
      <div className={styles.detailActions}>
        {detail.canAllRefund && detail.orderType !== 3 && detail.orderMold !== 1 && detail.totalAmount > 0 ? (
          <button type="button" onClick={() => startRefund(1)}>
            申请退款
          </button>
        ) : null}
        {detail.actions.map((action) => (
          <button className={action.tone === "primary" ? styles.primaryAction : ""} key={action.id} type="button" onClick={() => onAction(action)}>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DetailProductItem({ item, onRefund, orderCanRefund }: { item: OrderProductView; onRefund: () => void; orderCanRefund: boolean }) {
  return (
    <div className={styles.orderProduct}>
      {item.imageUrl ? <img alt="" className={styles.orderThumbImage} src={item.imageUrl} /> : <ProductImagePlaceholder className={styles.orderThumb} decorative />}
      <div className={styles.orderProductInfo}>
        <h2>{item.title}</h2>
        <p>{item.properties || "默认规格"}</p>
        <p>数量：{item.quantity}件</p>
        <div className={styles.orderPrice}>
          <strong>¥{item.price.toFixed(2)}</strong>
        </div>
        <div className={styles.itemActions}>
          {item.refundSn ? (
            <a href={buildClientHref(`/refunds/${encodeURIComponent(item.refundSn)}`)}>查看退款</a>
          ) : orderCanRefund && item.canRefund && item.actualTotal > 0 ? (
            <button type="button" onClick={onRefund}>
              申请退款
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className={styles.detailStack}>
      <section className={styles.detailHero} />
      <section className={styles.detailSection} />
      <section className={styles.detailSection} />
    </div>
  );
}

const refundContextKey = "meumall_refund_context";

export type RefundSessionContext = {
  item?: OrderProductView;
  order: OrderDetailView;
  refundType: 1 | 2;
};

export function saveRefundContext(context: RefundSessionContext) {
  window.sessionStorage.setItem(refundContextKey, JSON.stringify(context));
}

export function readRefundContext(): RefundSessionContext | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(refundContextKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as RefundSessionContext;
  } catch {
    return null;
  }
}

function isExpired(endTime: string) {
  if (!endTime) return false;
  const timestamp = new Date(endTime.replace(/-/g, "/")).getTime();
  return Number.isFinite(timestamp) && timestamp <= Date.now();
}
