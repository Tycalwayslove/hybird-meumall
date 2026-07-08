"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState, ProductImagePlaceholder, StandardNavPage, cn } from "@/design-system";
import { createH5Client } from "@/lib/http";
import { buildClientHref } from "@/lib/navigation";
import { createCashierHrefFromSubmitResult } from "@/features/payment/cashier-links";
import { createPaymentApi } from "@/features/payment/api";

import { createOrdersApi } from "../api";
import type { OrderAction, OrderCardView, OrderProductView, OrderStatus } from "../server/orders-real-service";
import styles from "./OrdersScreen.module.css";

type OrdersScreenProps = {
  initialStatus?: OrderStatus;
};

const orderStatusTabs: Array<{ id: OrderStatus; title: string }> = [
  { id: "all", title: "全部" },
  { id: "pending-payment", title: "待付款" },
  { id: "pending-shipment", title: "待发货" },
  { id: "pending-receipt", title: "待收货" },
  { id: "completed", title: "已完成" }
];

export function OrdersScreen({ initialStatus = "all" }: OrdersScreenProps) {
  const [status, setStatus] = useState<OrderStatus>(() => normalizeOrderStatus(initialStatus));
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [orders, setOrders] = useState<OrderCardView[]>([]);
  const [page, setPage] = useState<{ current: number; hasMore: boolean } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const api = useMemo(() => createOrdersApi(createH5Client()), []);
  const paymentApi = useMemo(() => createPaymentApi(createH5Client()), []);

  const loadOrders = useCallback(
    async (nextStatus: OrderStatus, nextKeyword: string, current = 1, append = false) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError("");

      const result = await api.getOrders({
        current,
        keyword: nextKeyword,
        size: 10,
        status: nextStatus
      });
      if (!result.success) {
        if (!append) setOrders([]);
        setError(result.message || "订单加载失败，请稍后重试。");
        setLoading(false);
        setLoadingMore(false);
        return;
      }
      setOrders((prev) => (append ? [...prev, ...result.data.view.orders] : result.data.view.orders));
      setPage({ current: result.data.page.current, hasMore: result.data.page.hasMore });
      setLoading(false);
      setLoadingMore(false);
    },
    [api]
  );

  useEffect(() => {
    queueMicrotask(() => {
      void loadOrders(status, submittedKeyword);
    });
  }, [loadOrders, status, submittedKeyword]);

  const onTabChange = (nextStatus: OrderStatus) => {
    setStatus(nextStatus);
    const query = new URLSearchParams({ status: nextStatus });
    window.history.replaceState(null, "", `${window.location.pathname}?${query.toString()}`);
  };

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmittedKeyword(keyword.trim());
  };

  const loadMore = () => {
    if (!page?.hasMore || loadingMore) return;
    void loadOrders(status, submittedKeyword, page.current + 1, true);
  };

  const onOrderAction = async (order: OrderCardView, action: OrderAction) => {
    if (action.id === "pay") {
      const payInfo = await paymentApi.getOrderPayInfo({
        dvyType: String(order.dvyType ?? 1),
        isPurePoints: "0",
        orderNumbers: order.orderNumber,
        orderType: String(order.orderType ?? 0),
        ordermold: "0"
      });
      if (!payInfo.success) {
        setError(payInfo.message || "订单支付信息获取失败。");
        return;
      }
      if (isExpired(payInfo.data.view.endTime)) {
        setError("订单已过期，请重新下单。");
        await loadOrders(status, submittedKeyword);
        return;
      }
      window.location.assign(createCashierHrefFromSubmitResult({
        dvyType: String(order.dvyType ?? 1),
        orderNumbers: order.orderNumber,
        orderType: String(order.orderType ?? 0)
      }));
      return;
    }
    if (action.id === "logistics") {
      window.location.assign(buildClientHref(`/orders/logistics/${encodeURIComponent(order.orderNumber)}`));
      return;
    }
    if (action.id === "contact") {
      const messageContent = window.prompt("请描述你要咨询的问题", "");
      if (!messageContent) return;
      const userMobile = window.prompt("请输入联系方式", "") || "";
      if (!userMobile) return;
      const result = await api.submitContactMessage({
        messageContent,
        orderNumber: order.orderNumber,
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
        ? await api.deleteOrder(order.orderNumber)
        : action.id === "receipt"
          ? await api.receiptOrder(order.orderNumber)
          : await api.cancelOrder(order.orderNumber);
    if (!result.success) {
      setError(result.message || "订单操作失败。");
      return;
    }
    await loadOrders(status, submittedKeyword);
  };

  const hasData = orders.length > 0;

  return (
    <StandardNavPage title="订单列表" backHref="/mine" className={styles.screen} contentClassName={styles.content}>
      <div className={styles.stickyTop}>
        <form className={styles.searchBox} onSubmit={onSearch}>
          <span aria-hidden="true" className={styles.searchIcon} />
          <input placeholder="搜索商品名称" type="search" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
        </form>
        <nav className={styles.orderTabs} aria-label="订单状态" role="tablist">
          <span className={cn(styles.orderTabTrack, styles[`orderTabTrack_${status}`])} aria-hidden="true" />
          {orderStatusTabs.map((tab) => (
            <button
              aria-selected={tab.id === status}
              className={cn(styles.orderTab, tab.id === status ? styles.activeTab : "")}
              key={tab.id}
              role="tab"
              type="button"
              onClick={() => onTabChange(tab.id)}
            >
              {tab.title}
            </button>
          ))}
        </nav>
      </div>

      {error ? <p className={styles.errorText}>{error}</p> : null}
      {loading ? <LoadingOrders /> : hasData ? (
        <div className={styles.orderList} key={status} aria-live="polite">
          {orders.map((order) => (
            <OrderCard key={order.orderNumber} order={order} onAction={onOrderAction} />
          ))}
          {page?.hasMore ? (
            <button className={styles.loadMoreButton} type="button" disabled={loadingMore} onClick={loadMore}>
              {loadingMore ? "加载中..." : "加载更多"}
            </button>
          ) : (
            <p className={styles.endText}>没有更多了</p>
          )}
        </div>
      ) : (
        <OrderEmptyState text="这里空空如也~" />
      )}
    </StandardNavPage>
  );
}

function isExpired(endTime: string) {
  if (!endTime) return false;
  const timestamp = new Date(endTime.replace(/-/g, "/")).getTime();
  return Number.isFinite(timestamp) && timestamp <= Date.now();
}

export function normalizeOrderStatus(status: string | undefined): OrderStatus {
  const knownStatuses = new Set<OrderStatus>(["all", "pending-payment", "pending-shipment", "pending-receipt", "completed"]);
  return knownStatuses.has(status as OrderStatus) ? (status as OrderStatus) : "all";
}

function OrderCard({ order, onAction }: { order: OrderCardView; onAction: (order: OrderCardView, action: OrderAction) => void }) {
  return (
    <article className={styles.orderCard}>
      <a className={styles.orderHeader} href={buildClientHref(order.detailHref)}>
        <span className={styles.shopName}>
          <span aria-hidden="true" className={styles.shopIcon} />
          {order.shopName}
        </span>
        <span className={order.status === "completed" ? styles.completedStatus : styles.pendingStatus}>{order.statusLabel}</span>
      </a>
      {order.refundStatusTexts.length ? <p className={styles.refundStatus}>{order.refundStatusTexts.join("，")}</p> : null}
      <div className={styles.orderItems}>
        {order.items.map((item) => (
          <OrderProductItem item={item} key={`${order.orderNumber}-${item.prodId}-${item.skuId}`} />
        ))}
      </div>
      <p className={styles.total}>
        共 {order.totalCount} 件，合计：<strong>¥{order.totalAmount.toFixed(2)}</strong>
      </p>
      <div className={styles.actions}>
        {order.actions.map((action) => (
          <button className={action.tone === "primary" ? styles.primaryAction : ""} key={action.id} type="button" onClick={() => onAction(order, action)}>
            {action.label}
          </button>
        ))}
      </div>
    </article>
  );
}

export function OrderProductItem({ item }: { item: OrderProductView }) {
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
        {item.afterSaleTags.length > 0 ? (
          <div className={styles.orderTags}>
            {item.afterSaleTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function LoadingOrders() {
  return (
    <div className={styles.orderList} aria-live="polite">
      <article className={cn(styles.orderCard, styles.loadingCard)} />
      <article className={cn(styles.orderCard, styles.loadingCard)} />
    </div>
  );
}

export function OrderEmptyState({ text }: { text: string }) {
  return <EmptyState className={styles.emptyState} imageSize={150} text={text} textColor="rgb(var(--mm-color-text-muted))" textSize={14} />;
}
