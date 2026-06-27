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
        dvyType: "1",
        isPurePoints: "0",
        orderNumbers: detail.orderNumber,
        orderType: "0",
        ordermold: "0"
      });
      if (!payInfo.success) {
        setError(payInfo.message || "订单支付信息获取失败。");
        return;
      }
      window.location.href = createCashierHrefFromSubmitResult({ orderNumbers: detail.orderNumber });
      return;
    }
    if (action.id === "logistics") {
      const deliverySection = document.getElementById("order-delivery");
      if (!deliverySection) {
        setError("暂无物流信息。");
        return;
      }
      deliverySection.scrollIntoView({ behavior: "smooth", block: "start" });
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
    window.location.href = buildClientHref("/orders");
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
            <DetailProductItem item={item} key={`${detail.orderNumber}-${item.prodId}-${item.skuId}`} />
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
        {detail.actions.map((action) => (
          <button className={action.tone === "primary" ? styles.primaryAction : ""} key={action.id} type="button" onClick={() => onAction(action)}>
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function DetailProductItem({ item }: { item: OrderProductView }) {
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
