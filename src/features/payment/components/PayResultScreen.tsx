"use client";

import { useEffect, useMemo, useState } from "react";

import { StandardNavPage } from "@/design-system";
import { createH5Client } from "@/lib/http";
import { buildClientHref } from "@/lib/navigation";
import { createPaymentApi } from "../api";
import styles from "./PayResultScreen.module.css";

type PayResultStatus = "0" | "1" | "pending";
type DisplayStatus = "paid" | "pending" | "unpaid";

export type PayResultScreenProps = {
  bizOrderNo?: string;
  dvyType?: string;
  orderNumbers: string;
  orderType?: string;
  ordermold?: string;
  status: PayResultStatus;
};

export function PayResultScreen({ bizOrderNo, dvyType = "1", orderNumbers, orderType = "0", ordermold = "0", status }: PayResultScreenProps) {
  void bizOrderNo;
  void dvyType;
  void orderType;
  void ordermold;
  const api = useMemo(() => createPaymentApi(createH5Client()), []);
  const [currentStatus, setCurrentStatus] = useState<DisplayStatus>(() => displayStatusFromQuery(status));
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(status === "0" || status === "1");
  const [lastCheckedAt, setLastCheckedAt] = useState("");

  useEffect(() => {
    void checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumbers]);

  async function checkStatus() {
    setChecking(true);
    setError("");
    try {
      const result = await api.getOrderPaidStatus({ orderNumbers, payEntry: 0 });
      if (!result.success) {
        setError(result.message || "支付状态查询失败。");
        return;
      }
      setCurrentStatus(result.data.view.isPaid ? "paid" : "unpaid");
      setHasChecked(true);
      setLastCheckedAt(formatCheckedAt(new Date()));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "支付状态查询失败。");
    } finally {
      setChecking(false);
    }
  }

  const content = resultContent(currentStatus);
  const orderDetailHref = buildClientHref(`/orders/${encodeURIComponent(orderNumbers)}`);
  const orderButtonIsPrimary = currentStatus === "paid";

  return (
    <StandardNavPage title="支付结果" backHref="/orders?status=pending-payment" className={styles.screen} contentClassName={styles.content}>
      <div className={styles.page}>
        <section className={`${styles.state} ${styles[content.tone]}`}>
          <div className={styles.statusVisual} aria-hidden="true">
            <span className={styles.statusRing} />
            <span className={styles.statusGlyph} />
          </div>
          <h1 className={styles.title}>{content.title}</h1>
          <p className={styles.desc}>{checking ? "正在向订单系统确认最新支付状态。" : content.desc}</p>
          <dl className={styles.meta}>
            <div className={styles.metaRow}>
              <dt>订单号</dt>
              <dd>{orderNumbers}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt>状态来源</dt>
              <dd>{hasChecked ? "订单支付状态接口" : "等待首次查询"}</dd>
            </div>
            <div className={styles.metaRow}>
              <dt>更新时间</dt>
              <dd>{lastCheckedAt || "正在确认"}</dd>
            </div>
          </dl>
          {error ? <p className={styles.error}>{error}</p> : null}
        </section>

        <div className={styles.actions}>
          <button className={`${styles.button} ${orderButtonIsPrimary ? styles.secondary : styles.primary}`} disabled={checking} onClick={checkStatus} type="button">
            {checking ? "正在查询" : "查看支付状态"}
          </button>
          <a className={`${styles.button} ${orderButtonIsPrimary ? styles.primary : styles.secondary}`} href={orderDetailHref}>
            查看订单
          </a>
        </div>
      </div>
    </StandardNavPage>
  );
}

function displayStatusFromQuery(status: PayResultStatus): DisplayStatus {
  if (status === "1") {
    return "paid";
  }
  if (status === "0") {
    return "unpaid";
  }
  return "pending";
}

function resultContent(status: DisplayStatus) {
  if (status === "paid") {
    return {
      desc: "订单已完成支付，后续会进入发货和履约流程。",
      title: "支付成功",
      tone: "success" as const
    };
  }
  if (status === "unpaid") {
    return {
      desc: "暂未查询到支付成功记录。如你刚从微信返回，可以稍后再次查看支付状态。",
      title: "暂未支付成功",
      tone: "failed" as const
    };
  }
  return {
    desc: "已发起支付，请在完成微信收银台流程后回到 App 查看最终状态。",
    title: "等待支付结果",
    tone: "pending" as const
  };
}

function formatCheckedAt(date: Date) {
  return `${formatPart(date.getHours())}:${formatPart(date.getMinutes())}:${formatPart(date.getSeconds())}`;
}

function formatPart(value: number) {
  return value.toString().padStart(2, "0");
}
