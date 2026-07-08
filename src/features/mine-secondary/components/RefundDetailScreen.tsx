"use client";

import { useEffect, useMemo, useState } from "react";
import { StandardNavPage } from "@/design-system";
import { createH5Client } from "@/lib/http";
import { buildClientHref } from "@/lib/navigation";

import { createOrdersApi } from "../api";
import type { RefundDetailView } from "../server/orders-real-service";
import { saveRefundContext } from "./OrderDetailScreen";
import styles from "./OrdersScreen.module.css";

export function RefundDetailScreen({ refundSn }: { refundSn: string }) {
  const [detail, setDetail] = useState<RefundDetailView | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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

  const reload = async () => {
    const result = await api.getRefundDetail(refundSn);
    if (result.success) setDetail(result.data.view);
  };

  const onAction = async (actionId: RefundDetailView["actions"][number]["id"]) => {
    if (!detail) return;
    if (actionId === "apply-platform" || actionId === "supplement-voucher") {
      const pageType = actionId === "supplement-voucher" ? 2 : 1;
      window.location.assign(buildClientHref(`/refunds/platform-intervention?refundSn=${encodeURIComponent(detail.refundSn)}&pageType=${pageType}`));
      return;
    }
    if (actionId === "submit-logistics" || actionId === "modify-logistics") {
      const isModify = actionId === "modify-logistics" ? 1 : 0;
      window.location.assign(buildClientHref(`/refunds/return-logistics?refundSn=${encodeURIComponent(detail.refundSn)}&isModify=${isModify}`));
      return;
    }
    if (actionId === "modify-application") {
      const result = await api.getOrderDetail(detail.orderNumber);
      if (!result.success) {
        setError(result.message || "订单详情加载失败，无法修改申请。");
        return;
      }
      const order = result.data.view;
      const item = detail.refundType === 2 ? order.items.find((entry) => entry.orderItemId === detail.items[0]?.orderItemId) ?? order.items[0] : undefined;
      saveRefundContext({ item, order, refundType: detail.refundType === 1 ? 1 : 2 });
      if (order.status === "pending-shipment") {
        window.location.assign(buildClientHref(`/refunds/apply?type=1&refundType=${detail.refundType}`));
      } else {
        window.location.assign(buildClientHref(`/refunds/choose-way?refundType=${detail.refundType}`));
      }
      return;
    }
    if (actionId === "modify-amount") {
      const refundAmount = window.prompt("请输入新的退款金额", detail.refundAmount.toFixed(2));
      if (!refundAmount) return;
      setSubmitting(true);
      const result = await api.submitRefundAction({ action: "modify-amount", refundAmount, refundSn: detail.refundSn });
      setSubmitting(false);
      if (!result.success) {
        setError(result.message || "修改退款金额失败。");
        return;
      }
      await reload();
      return;
    }
    const confirmText = actionId === "cancel-platform" ? "确定要撤销本次平台介入申请？" : "确定要撤销退款申请？";
    if (!window.confirm(confirmText)) return;
    setSubmitting(true);
    const result =
      actionId === "cancel-platform"
        ? await api.submitRefundAction({ action: "cancel-platform", orderNumber: detail.orderNumber, refundId: detail.refundId, refundSn: detail.refundSn })
        : await api.submitRefundAction({ action: "cancel-refund", refundSn: detail.refundSn });
    setSubmitting(false);
    if (!result.success) {
      setError(result.message || "售后操作失败。");
      return;
    }
    await reload();
  };

  return (
    <StandardNavPage title="退款详情" backHref="/refunds" className={styles.screen} contentClassName={styles.content}>
      {error ? <p className={styles.errorText}>{error}</p> : null}
      {loading ? <section className={styles.detailHero} /> : detail ? <RefundDetailContent detail={detail} onAction={onAction} submitting={submitting} /> : null}
    </StandardNavPage>
  );
}

function RefundDetailContent({ detail, onAction, submitting }: { detail: RefundDetailView; onAction: (actionId: RefundDetailView["actions"][number]["id"]) => void; submitting: boolean }) {
  return (
    <div className={styles.detailStack}>
      <section className={styles.detailHero}>
        <h2>{detail.statusLabel}</h2>
        <p>退款编号：{detail.refundSn}</p>
        <p>{detail.processText}</p>
      </section>
      <section className={styles.detailSection}>
        <h3>{detail.shopName}</h3>
        <p>关联订单：{detail.orderNumber || "-"}</p>
        <p>申请时间：{detail.applyTime || "-"}</p>
        <p>
          退款金额：<strong className={styles.priceText}>¥{detail.refundAmount.toFixed(2)}</strong>
        </p>
        {detail.refundScore ? <p>退回积分：{detail.refundScore}</p> : null}
        <p>退款原因：{detail.buyerReason || "-"}</p>
        <p>退款说明：{detail.buyerDesc || "-"}</p>
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
      {detail.photoFiles.length ? (
        <section className={styles.detailSection}>
          <h3>退款凭证</h3>
          <div className={styles.voucherGrid}>
            {detail.photoFiles.map((src) => (
              <img src={src} alt="" key={src} />
            ))}
          </div>
        </section>
      ) : null}
      {detail.refundDelivery ? (
        <section className={styles.detailSection}>
          <h3>退货物流</h3>
          <p>{detail.refundDelivery.companyName || "-"}：{detail.refundDelivery.expressNo || "-"}</p>
          <p>{detail.refundDelivery.senderRemarks || ""}</p>
        </section>
      ) : null}
      {detail.timeline.length ? (
        <section className={styles.detailSection}>
          <h3>售后进度</h3>
          <div className={styles.timeline}>
            {detail.timeline.map((item) => (
              <div className={styles.timelineItem} key={`${item.label}-${item.time}`}>
                <strong>{item.label}</strong>
                <span>{item.time}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {detail.actions.length ? (
        <div className={styles.detailActions}>
          {detail.actions.map((action) => (
            <button className={action.tone === "primary" ? styles.primaryAction : ""} disabled={submitting} key={action.id} type="button" onClick={() => onAction(action.id)}>
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
