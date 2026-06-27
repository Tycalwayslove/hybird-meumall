"use client";

import { useEffect, useMemo, useState } from "react";
import { StandardNavPage } from "@/design-system";
import { createH5Client } from "@/lib/http";

import { createOrdersApi } from "../api";
import type { RefundDetailView } from "../server/orders-real-service";
import styles from "./OrdersScreen.module.css";

export function RefundDetailScreen({ refundSn }: { refundSn: string }) {
  const [detail, setDetail] = useState<RefundDetailView | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const api = useMemo(() => createOrdersApi(createH5Client()), []);

  useEffect(() => {
    let cancelled = false;
    async function loadDetail() {
      setLoading(true);
      setError("");
      const result = await api.getRefundDetail(refundSn);
      if (cancelled) return;
      if (!result.success) {
        setError(result.message || "退款详情加载失败。");
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
  }, [api, refundSn]);

  return (
    <StandardNavPage title="退款详情" backHref="/refunds" className={styles.screen} contentClassName={styles.content}>
      {loading ? <section className={styles.detailHero} /> : error ? <p className={styles.errorText}>{error}</p> : detail ? <RefundDetailContent detail={detail} /> : null}
    </StandardNavPage>
  );
}

function RefundDetailContent({ detail }: { detail: RefundDetailView }) {
  return (
    <div className={styles.detailStack}>
      <section className={styles.detailHero}>
        <h2>{detail.statusLabel}</h2>
        <p>退款编号：{detail.refundSn}</p>
      </section>
      <section className={styles.detailSection}>
        <h3>{detail.shopName}</h3>
        <p>关联订单：{detail.orderNumber || "-"}</p>
        <p>申请时间：{detail.applyTime || "-"}</p>
        <p>
          退款金额：<strong className={styles.priceText}>¥{detail.refundAmount.toFixed(2)}</strong>
        </p>
      </section>
      <section className={styles.detailSection}>
        <h3>退款商品</h3>
        <div className={styles.orderItems}>
          {detail.items.map((item) => (
            <div className={styles.orderProduct} key={`${detail.refundSn}-${item.prodId}-${item.skuId}`}>
              {item.imageUrl ? <img alt="" className={styles.orderThumbImage} src={item.imageUrl} /> : null}
              <div className={styles.orderProductInfo}>
                <h2>{item.title}</h2>
                <p>{item.properties || "默认规格"}</p>
                <p>数量：{item.quantity}件</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
