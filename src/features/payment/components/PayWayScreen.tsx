"use client";

import { useEffect, useMemo, useState } from "react";

import { StandardNavPage } from "@/design-system";
import { createH5Client } from "@/lib/http";
import { createPaymentApi } from "../api";
import type { CashierPaymentMethod, CashierViewData } from "../server/cashier-service";
import styles from "./PayWayScreen.module.css";

export const paymentStartedMessage = "已发起支付";

type PayWayRuntimeScreenProps = {
  dvyType?: string;
  isPurePoints?: string;
  orderNumbers: string;
  orderType?: string;
  ordermold?: string;
};

export function PayWayRuntimeScreen({ dvyType, isPurePoints, orderNumbers, orderType, ordermold }: PayWayRuntimeScreenProps) {
  const [data, setData] = useState<CashierViewData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    const api = createPaymentApi(createH5Client());

    async function load() {
      const result = await api
        .getOrderPayInfo({
          dvyType,
          isPurePoints,
          orderNumbers,
          orderType,
          ordermold
        })
        .catch(() => undefined);

      if (disposed) {
        return;
      }
      if (result?.success) {
        setData(result.data.view);
        setErrorMessage(null);
        return;
      }
      setErrorMessage(result && !result.success ? result.message : "订单支付信息获取失败，请稍后重试。");
    }

    void load();

    return () => {
      disposed = true;
    };
  }, [dvyType, isPurePoints, orderNumbers, orderType, ordermold]);

  if (data) {
    return <PayWayScreen data={data} />;
  }

  return (
    <StandardNavPage title="收银台" backHref="/orders?status=pending-payment" className={styles.screen} contentClassName={styles.content}>
      <div className={styles.page}>
        <section className={styles.stateCard} aria-label={errorMessage ? "收银台加载失败" : "正在读取订单支付信息"}>
          <strong>{errorMessage ? "收银台加载失败" : "正在读取订单支付信息"}</strong>
          <p>{errorMessage ?? "正在确认订单金额、支付状态和可用支付方式。"}</p>
        </section>
      </div>
    </StandardNavPage>
  );
}

export function PayWayScreen({ data }: { data: CashierViewData }) {
  const [selectedPayType, setSelectedPayType] = useState(data.defaultPayType);
  const [message, setMessage] = useState("");
  const amount = splitAmount(data.totalAmount);
  const countdownText = useCountdownText(data.endTime);
  const selectedMethod = data.methods.find((method) => method.payType === selectedPayType) ?? data.methods[0];
  const canPay = data.status === "pending" && data.methods.length > 0;

  function handlePay() {
    if (!canPay) {
      return;
    }
    setMessage(paymentStartedMessage);
  }

  return (
    <StandardNavPage title="收银台" backHref="/orders?status=pending-payment" className={styles.screen} contentClassName={styles.content}>
      <div className={styles.page}>
        <section className={styles.payNumber} aria-label="订单支付金额">
          <div className={styles.price}>
            <span className={styles.currency}>￥</span>
            <span className={styles.integer}>{amount.integer}</span>
            <span className={styles.decimal}>.{amount.decimal}</span>
          </div>
          {countdownText ? <p className={styles.time}>剩余支付时间&nbsp;{countdownText}</p> : null}
          <p className={styles.status}>{data.statusText}</p>
        </section>

        <section className={styles.ways} aria-label="支付方式">
          {data.methods.map((method) => (
            <PaymentMethodRow
              checked={method.payType === selectedPayType}
              key={method.id}
              method={method}
              onSelect={() => setSelectedPayType(method.payType)}
            />
          ))}
        </section>
      </div>

      {message ? <div className={styles.message} role="status">{message}</div> : null}
      <div className={styles.submitBar}>
        <button className={styles.submitButton} disabled={!canPay} onClick={handlePay} type="button">
          {selectedMethod ? "确定支付" : "暂无可用支付方式"}
        </button>
      </div>
    </StandardNavPage>
  );
}

function PaymentMethodRow({ checked, method, onSelect }: { checked: boolean; method: CashierPaymentMethod; onSelect: () => void }) {
  return (
    <button className={styles.method} onClick={onSelect} type="button">
      <span className={styles.methodName}>
        <span className={`${styles.methodIcon} ${method.id === "aliPay" ? styles.ali : styles.wechat}`} aria-hidden="true">
          {method.id === "aliPay" ? "支" : "微"}
        </span>
        <span className={styles.methodLabel}>{method.label}</span>
      </span>
      <span className={`${styles.radio} ${checked ? styles.radioActive : ""}`} aria-hidden="true" />
    </button>
  );
}

function useCountdownText(endTime: string) {
  const [now, setNow] = useState(() => Date.now());
  const endTimestamp = useMemo(() => parseEndTime(endTime), [endTime]);

  useEffect(() => {
    if (!endTimestamp) {
      return undefined;
    }
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [endTimestamp]);

  if (!endTimestamp) {
    return "";
  }

  const seconds = Math.max(0, Math.floor((endTimestamp - now) / 1000));
  const hour = Math.floor((seconds % (60 * 60 * 24)) / 3600);
  const minute = Math.floor((seconds % 3600) / 60);
  const second = seconds % 60;
  return `${formatTimerPart(hour)}:${formatTimerPart(minute)}:${formatTimerPart(second)}`;
}

function splitAmount(amount: number) {
  const normalized = amount.toFixed(2);
  const [integer = "0", decimal = "00"] = normalized.split(".");
  return { decimal, integer };
}

function parseEndTime(endTime: string) {
  if (!endTime) {
    return 0;
  }
  const timestamp = new Date(endTime.replace(/-/g, "/")).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatTimerPart(value: number) {
  return value < 10 ? `0${value}` : String(value);
}
