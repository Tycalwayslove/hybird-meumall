"use client";

import { useEffect, useMemo, useState } from "react";

import { StandardNavPage } from "@/design-system";
import { createH5Client } from "@/lib/http";
import { buildClientHref } from "@/lib/navigation";
import { createPaymentApi } from "../api";
import { createCashierHrefFromSubmitResult } from "../cashier-links";
import type { CashierViewData } from "../server/cashier-service";
import styles from "./PayResultScreen.module.css";

type PayResultStatus = "0" | "1" | "pending";

export type PayResultScreenProps = {
  bizOrderNo?: string;
  dvyType?: string;
  orderNumbers: string;
  orderType?: string;
  ordermold?: string;
  status: PayResultStatus;
};

export function PayResultScreen({ bizOrderNo, dvyType = "1", orderNumbers, orderType = "0", ordermold = "0", status }: PayResultScreenProps) {
  const api = useMemo(() => createPaymentApi(createH5Client()), []);
  const [currentStatus, setCurrentStatus] = useState<PayResultStatus>(status);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (status === "pending") {
      void checkStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, bizOrderNo, orderNumbers]);

  async function checkStatus() {
    setChecking(true);
    setError("");
    try {
      if (bizOrderNo) {
        const result = await api.getAllinpayOrderStatus({ bizOrderNo, orderNumbers });
        if (!result.success) {
          setError(result.message || "支付状态查询失败。");
          return;
        }
        setCurrentStatus(statusFromNormalized(result.data.view.normalizedStatus));
        return;
      }

      const result = await api.getOrderPayInfo({ dvyType, orderNumbers, orderType, ordermold });
      if (!result.success) {
        setError(result.message || "支付状态查询失败。");
        return;
      }
      setCurrentStatus(statusFromOrder(result.data.view));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "支付状态查询失败。");
    } finally {
      setChecking(false);
    }
  }

  const content = resultContent(currentStatus);
  const cashierHref = createCashierHrefFromSubmitResult({
    dvyType,
    orderNumbers,
    orderType,
    ordermold
  });

  return (
    <StandardNavPage title="支付结果" backHref="/orders?status=pending-payment" className={styles.screen} contentClassName={styles.content}>
      <div className={styles.page}>
        <section className={styles.state}>
          <span className={`${styles.icon} ${styles[content.tone]}`} aria-hidden="true">
            {content.icon}
          </span>
          <h1 className={styles.title}>{content.title}</h1>
          <p className={styles.desc}>{content.desc}</p>
          {error ? <p className={styles.error}>{error}</p> : null}
        </section>

        <div className={styles.actions}>
          {currentStatus === "pending" ? (
            <button className={`${styles.button} ${styles.primary}`} disabled={checking} onClick={checkStatus} type="button">
              {checking ? "查询中" : "刷新支付状态"}
            </button>
          ) : null}
          {currentStatus === "0" ? (
            <a className={`${styles.button} ${styles.primary}`} href={cashierHref}>
              重新支付
            </a>
          ) : null}
          <a className={`${styles.button} ${currentStatus === "1" ? styles.primary : styles.secondary}`} href={buildClientHref("/orders")}>
            查看订单
          </a>
        </div>
      </div>
    </StandardNavPage>
  );
}

function statusFromNormalized(status: "failed" | "paid" | "pending" | "unknown"): PayResultStatus {
  if (status === "paid") {
    return "1";
  }
  if (status === "failed") {
    return "0";
  }
  return "pending";
}

function statusFromOrder(view: CashierViewData): PayResultStatus {
  if (view.status === "paid") {
    return "1";
  }
  if (view.status === "failed") {
    return "0";
  }
  return "pending";
}

function resultContent(status: PayResultStatus) {
  if (status === "1") {
    return {
      desc: "感谢购买，订单已进入后续履约流程。",
      icon: "✓",
      title: "支付成功",
      tone: "success" as const
    };
  }
  if (status === "0") {
    return {
      desc: "订单仍保留在待付款中，你可以重新发起支付。",
      icon: "!",
      title: "支付失败",
      tone: "failed" as const
    };
  }
  return {
    desc: "如果已完成支付，请稍后刷新状态；最终结果以订单状态为准。",
    icon: "...",
    title: "支付处理中",
    tone: "pending" as const
  };
}
