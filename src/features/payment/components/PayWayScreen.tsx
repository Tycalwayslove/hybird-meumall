"use client";

import { useEffect, useMemo, useState } from "react";

import { StandardNavPage } from "@/design-system";
import { createWindowProtocolBridge, type ProtocolBridge } from "@/lib/bridge/protocol-bridge";
import { createH5Client } from "@/lib/http";
import { buildClientHref } from "@/lib/navigation";
import { createPaymentApi } from "../api";
import type { CashierPaymentMethod, CashierViewData, PaymentExecution } from "../server/cashier-service";
import styles from "./PayWayScreen.module.css";

export const paymentStartedMessage = "正在发起支付";

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
        <section className={`${styles.stateCard} ${errorMessage ? styles.stateCardError : ""}`} aria-label={errorMessage ? "收银台加载失败" : "正在读取订单支付信息"}>
          <span className={styles.stateAccent} aria-hidden="true" />
          <strong>{errorMessage ? "收银台加载失败" : "正在读取订单支付信息"}</strong>
          <p>{errorMessage ?? "正在确认订单金额、支付状态和可用支付方式。"}</p>
        </section>
      </div>
    </StandardNavPage>
  );
}

export function PayWayScreen({ data }: { data: CashierViewData }) {
  const [selectedPayType, setSelectedPayType] = useState(data.defaultPayType);
  const [isPaying, setIsPaying] = useState(false);
  const [message, setMessage] = useState("");
  const api = useMemo(() => createPaymentApi(createH5Client()), []);
  const bridge = useMemo(() => createWindowProtocolBridge({ timeoutMs: 120_000 }), []);
  const amount = splitAmount(data.totalAmount);
  const countdownText = useCountdownText(data.endTime);
  const selectedMethod = data.methods.find((method) => method.payType === selectedPayType) ?? data.methods[0];
  const canPay = data.status === "pending" && data.methods.length > 0 && !isPaying;

  async function handlePay() {
    if (!canPay) {
      return;
    }
    setIsPaying(true);
    setMessage(paymentStartedMessage);

    try {
      const result = await api.submitOrderPayment({
        dvyType: data.dvyType,
        isPurePoints: data.isPurePoints,
        orderNumbers: data.orderNumbers,
        orderType: data.orderType,
        ordermold: data.ordermold,
        payType: selectedMethod?.payType ?? selectedPayType
      });

      if (!result.success) {
        setMessage(result.message || "支付申请失败，请稍后重试。");
        return;
      }

      await executePayment({
        api,
        bridge,
        execution: result.data.view.execution,
        fallback: data
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "支付发起失败，请稍后重试。");
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <StandardNavPage title="收银台" backHref="/orders?status=pending-payment" className={styles.screen} contentClassName={styles.content}>
      <div className={styles.page}>
        <section className={styles.payNumber} aria-label="订单支付金额">
          <div className={styles.summaryTop}>
            <span>需支付</span>
            {data.paySettlementType === 1 ? <span className={styles.settlement}>通联支付</span> : null}
          </div>
          <div className={styles.price}>
            <span className={styles.currency}>￥</span>
            <span className={styles.integer}>{amount.integer}</span>
            <span className={styles.decimal}>.{amount.decimal}</span>
          </div>
          <div className={styles.summaryMeta}>
            {countdownText ? <span className={styles.time}>剩余 {countdownText}</span> : null}
            <span className={styles.status}>{data.statusText}</span>
          </div>
        </section>

        <section className={styles.ways} aria-label="支付方式">
          <div className={styles.sectionHeader}>
            <span>支付方式</span>
            <span>{selectedMethod ? selectedMethod.label : "暂无可用"}</span>
          </div>
          <div className={styles.methodList}>
            {data.methods.map((method) => (
              <PaymentMethodRow
                checked={method.payType === selectedPayType}
                key={method.id}
                method={method}
                onSelect={() => setSelectedPayType(method.payType)}
              />
            ))}
          </div>
        </section>
      </div>

      {message ? <div className={styles.message} role="status">{message}</div> : null}
      <div className={styles.submitBar}>
        <button className={styles.submitButton} disabled={!canPay} onClick={handlePay} type="button">
          {isPaying ? "支付处理中" : selectedMethod ? "确定支付" : "暂无可用支付方式"}
        </button>
      </div>
    </StandardNavPage>
  );
}

async function executePayment({
  api,
  bridge,
  execution,
  fallback
}: {
  api: ReturnType<typeof createPaymentApi>;
  bridge: ProtocolBridge;
  execution: PaymentExecution;
  fallback: CashierViewData;
}) {
  if (execution.type === "paid") {
    navigateToPayResult({ orderNumbers: execution.orderNumbers, status: "1", view: fallback });
    return;
  }

  if (execution.type === "native-sdk") {
    if (!bridge.isAvailable()) {
      throw new Error("当前 App 版本暂不支持支付，请升级后重试。");
    }
    const nativeResult = await bridge.rpc("payment.pay", {
      ...(execution.bizOrderNo ? { bizOrderNo: execution.bizOrderNo } : {}),
      ...(execution.miniProgram ? { miniProgram: execution.miniProgram } : {}),
      orderNumbers: execution.orderNumbers,
      ...(execution.paymentMode ? { paymentMode: execution.paymentMode } : {}),
      payType: execution.payType,
      provider: execution.provider,
      ...(execution.settlementProvider ? { settlementProvider: execution.settlementProvider } : {}),
      sdkPayload: execution.paymentPayload
    });
    const status = await resolveOrderPaymentStatus(api, execution.orderNumbers, fallback, nativeResult.status);
    navigateToPayResult({ bizOrderNo: execution.bizOrderNo, orderNumbers: execution.orderNumbers, status, view: fallback });
    return;
  }

  if (bridge.isAvailable()) {
    await bridge.rpc("payment.openUrl", {
      ...(execution.bizOrderNo ? { bizOrderNo: execution.bizOrderNo } : {}),
      orderNumbers: execution.orderNumbers,
      provider: execution.provider,
      url: execution.url
    });
  } else {
    window.location.assign(execution.url);
    return;
  }

  navigateToPayResult({
    bizOrderNo: execution.bizOrderNo,
    orderNumbers: execution.orderNumbers,
    status: "pending",
    view: fallback
  });
}

async function resolveOrderPaymentStatus(
  api: ReturnType<typeof createPaymentApi>,
  orderNumbers: string,
  fallback: CashierViewData,
  nativeStatus: "cancelled" | "failed" | "success" | "unknown"
) {
  const result = await api
    .getOrderPayInfo({
      dvyType: fallback.dvyType,
      isPurePoints: fallback.isPurePoints ? "1" : "0",
      orderNumbers,
      orderType: fallback.orderType,
      ordermold: fallback.ordermold
    })
    .catch(() => undefined);

  if (result?.success) {
    if (result.data.view.status === "paid") {
      return "1" as const;
    }
    if (result.data.view.status === "failed") {
      return "0" as const;
    }
  }

  if (nativeStatus === "cancelled" || nativeStatus === "failed") {
    return "0" as const;
  }
  return "pending" as const;
}

function navigateToPayResult({
  bizOrderNo,
  orderNumbers,
  status,
  view
}: {
  bizOrderNo?: string;
  orderNumbers: string;
  status: "0" | "1" | "pending";
  view: CashierViewData;
}) {
  const query = new URLSearchParams({
    orderNumbers,
    sts: status,
    dvyType: view.dvyType,
    orderType: view.orderType ?? "0",
    ordermold: view.ordermold ?? "0"
  });
  if (bizOrderNo) {
    query.set("bizOrderNo", bizOrderNo);
  }
  window.location.href = buildClientHref(`/pay-result?${query.toString()}`);
}

function PaymentMethodRow({ checked, method, onSelect }: { checked: boolean; method: CashierPaymentMethod; onSelect: () => void }) {
  const hint = method.id === "aliPay" ? "支付宝 App 支付" : "微信 App 支付";

  return (
    <button className={`${styles.method} ${checked ? styles.methodActive : ""}`} aria-pressed={checked} onClick={onSelect} type="button">
      <span className={styles.methodName}>
        <span className={`${styles.methodIcon} ${method.id === "aliPay" ? styles.ali : styles.wechat}`} aria-hidden="true">
          {method.id === "aliPay" ? "支" : "微"}
        </span>
        <span className={styles.methodText}>
          <span className={styles.methodLabel}>{method.label}</span>
          <span className={styles.methodHint}>{hint}</span>
        </span>
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
