"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { EmptyState, StandardNavPage, cn } from "@/design-system";
import { createH5Client } from "@/lib/http";
import { buildClientHref } from "@/lib/navigation";

import { createOrdersApi } from "../api";
import type { RefundCardView } from "../server/orders-real-service";
import { OrderProductItem } from "./OrdersScreen";
import styles from "./OrdersScreen.module.css";

export function RefundsScreen() {
  const [refunds, setRefunds] = useState<RefundCardView[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const api = useMemo(() => createOrdersApi(createH5Client()), []);

  const loadRefunds = useCallback(async () => {
    setLoading(true);
    setError("");
    const result = await api.getRefundOrders({ current: 1, size: 10 });
    if (!result.success) {
      setRefunds([]);
      setError(result.message || "退货退款加载失败，请稍后重试。");
      setLoading(false);
      return;
    }
    setRefunds(result.data.view.refunds);
    setLoading(false);
  }, [api]);

  useEffect(() => {
    void loadRefunds();
  }, [loadRefunds]);

  return (
    <StandardNavPage title="退货退款" backHref="/mine" className={styles.screen} contentClassName={styles.content}>
      {error ? <p className={styles.errorText}>{error}</p> : null}
      {loading ? <LoadingRefunds /> : refunds.length > 0 ? (
        <div className={styles.orderList} aria-live="polite">
          {refunds.map((refund) => (
            <RefundCard key={refund.refundSn} refund={refund} />
          ))}
        </div>
      ) : (
        <RefundsEmptyState />
      )}
    </StandardNavPage>
  );
}

function RefundCard({ refund }: { refund: RefundCardView }) {
  return (
    <a className={styles.orderCard} href={buildClientHref(refund.detailHref)}>
      <div className={styles.orderHeader}>
        <span className={styles.shopName}>
          <span aria-hidden="true" className={styles.shopIcon} />
          {refund.shopName}
        </span>
        <span className={styles.pendingStatus}>{refund.statusLabel}</span>
      </div>
      <div className={styles.orderItems}>
        {refund.items.map((item) => (
          <OrderProductItem item={item} key={`${refund.refundSn}-${item.prodId}-${item.skuId}`} />
        ))}
      </div>
      <p className={styles.total}>
        退款金额：<strong>¥{refund.refundAmount.toFixed(2)}</strong>
      </p>
    </a>
  );
}

function LoadingRefunds() {
  return (
    <div className={styles.orderList} aria-live="polite" aria-label="退款记录加载中">
      <article className={cn(styles.orderCard, styles.loadingCard)} />
      <article className={cn(styles.orderCard, styles.loadingCard)} />
    </div>
  );
}

export function RefundsEmptyState() {
  return <EmptyState className={styles.emptyState} imageSize={150} text="暂无退货退款记录" textColor="rgb(var(--mm-color-text-muted))" textSize={14} />;
}
