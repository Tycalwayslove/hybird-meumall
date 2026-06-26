"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ProductImagePlaceholder, StandardNavPage } from "@/design-system";
import { createAddressApi } from "@/features/mine-secondary/api";
import { createHybridAddressApi } from "@/features/mine-secondary/address-hybrid-api";
import { createCashierHrefFromSubmitResult } from "@/features/payment/cashier-links";
import { createWindowProtocolBridge } from "@/lib/bridge/protocol-bridge";
import { createH5Client } from "@/lib/http";

import { createProductApi } from "../api";
import { createOrderSubmitFlowLogParam, recordOrderConfirmFlow } from "../order-flow-log";
import type { OrderConfirmData, OrderConfirmFeeRow, OrderConfirmItem } from "../types";
import styles from "./OrderConfirmScreen.module.css";

type OrderConfirmScreenProps = {
  data: OrderConfirmData;
};

export function OrderConfirmRuntimeScreen({
  addressId,
  productId,
  quantity,
  skuId
}: {
  addressId?: string;
  productId: string;
  quantity?: string;
  skuId: string;
}) {
  const [data, setData] = useState<OrderConfirmData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;
    recordOrderConfirmFlow();
    const api = createProductApi(createH5Client());
    const addressApi = createHybridAddressApi({
      bridge: createWindowProtocolBridge(),
      fallback: createAddressApi(createH5Client())
    });

    async function loadOrderConfirm() {
      let resolvedAddressId = addressId;
      if (!resolvedAddressId) {
        const addressResult = await addressApi.getDefaultAddress().catch(() => undefined);
        if (addressResult?.success && addressResult.data?.addrId) {
          resolvedAddressId = addressResult.data.addrId;
        }
      }

      const result = await api
        .getOrderConfirm({
          addrId: resolvedAddressId,
          productId,
          quantity: Number(quantity ?? 1),
          skuId
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
      setErrorMessage(result && !result.success ? result.message : "订单确认失败，请返回商品详情重试。");
    }

    void loadOrderConfirm();

    return () => {
      disposed = true;
    };
  }, [addressId, productId, quantity, skuId]);

  if (data) {
    return <OrderConfirmScreen data={data} />;
  }

  return (
    <StandardNavPage backHref={`/product/${productId}`} title="提交订单" className={styles.screen} contentClassName={styles.content}>
      <div className={styles.page}>
        <section className={styles.stateCard} aria-label={errorMessage ? "订单确认失败" : "正在确认订单"}>
          <strong>{errorMessage ? "订单确认失败" : "正在确认订单"}</strong>
          <p>{errorMessage ?? "正在实时校验商品价格、库存和规格，请稍候。"}</p>
        </section>
      </div>
    </StandardNavPage>
  );
}

export function OrderConfirmScreen({ data }: OrderConfirmScreenProps) {
  return (
    <StandardNavPage backHref={`/product/${data.productId}`} title="提交订单" className={styles.screen} contentClassName={styles.content}>
      <div className={styles.page}>
        <AddressCard data={data} />
        <section className={styles.itemsCard} aria-label="确认商品">
          {data.items.map((item) => (
            <OrderItemCard item={item} key={item.id} />
          ))}
        </section>
        <section className={styles.summaryCard} aria-label="订单费用明细">
          <div className={styles.summaryRows}>
            {data.serviceRows.map((row) => (
              <SummaryRow key={row.label} row={row} />
            ))}
          </div>
          <div className={styles.summaryDivider} />
          <div className={styles.summaryRows}>
            {data.discountRows.map((row) => (
              <SummaryRow key={row.label} row={row} />
            ))}
          </div>
        </section>
      </div>
      <SubmitBar data={data} />
    </StandardNavPage>
  );
}

function AddressCard({ data }: { data: OrderConfirmData }) {
  const href = createAddressSelectHref(data);

  if (!data.address) {
    return (
      <Link className={styles.addressCard} href={href} aria-label="收货信息">
        <span className={styles.locationIcon} aria-hidden="true" />
        <strong>请先填写收货人信息</strong>
        <span className={styles.arrowIcon} aria-hidden="true" />
      </Link>
    );
  }

  return (
    <Link className={styles.addressCardLarge} href={href} aria-label="更换收货地址">
      <div className={styles.addressTitleRow}>
        <span className={styles.locationIcon} aria-hidden="true" />
        <strong>{data.address.fullAddress}</strong>
        <span className={styles.arrowIcon} aria-hidden="true" />
      </div>
      <p>
        <span>{data.address.name}</span>
        <span>{data.address.phone}</span>
      </p>
      <span className={styles.addressHint}>更换收货地址</span>
    </Link>
  );
}

function OrderItemCard({ item }: { item: OrderConfirmItem }) {
  return (
    <article className={styles.orderItem}>
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.itemImage} src={item.imageUrl} alt="" />
      ) : (
        <ProductImagePlaceholder ariaLabel={item.imageLabel} className={styles.itemImage} />
      )}
      <div className={styles.itemInfo}>
        <h2>{item.title}</h2>
        <p>{item.specsText}</p>
        <strong>￥{item.price}</strong>
      </div>
      <span className={styles.itemQuantity}>x{item.quantity}</span>
    </article>
  );
}

function SummaryRow({ row }: { row: OrderConfirmFeeRow }) {
  const valueClassName =
    row.tone === "price" ? styles.summaryValuePrice : row.tone === "primary" ? styles.summaryValuePrimary : styles.summaryValueMuted;

  return (
    <div className={styles.summaryRow}>
      <span>{row.label}</span>
      <span className={valueClassName}>
        {row.value}
        {row.navigable ? <i aria-hidden="true" /> : null}
      </span>
    </div>
  );
}

function SubmitBar({ data }: { data: OrderConfirmData }) {
  const [submitState, setSubmitState] = useState<{
    message?: string;
    orderNumbers?: string;
    status: "error" | "idle" | "submitting" | "success";
  }>({ status: "idle" });
  const canSubmit = data.canSubmit && submitState.status !== "submitting" && submitState.status !== "success";

  async function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    setSubmitState({ message: "正在提交订单...", status: "submitting" });
    const api = createProductApi(createH5Client());
    const result = await api
      .submitOrder({
        productId: data.productId,
        addrId: data.selectedAddressId,
        orderFlowLogParam: createOrderSubmitFlowLogParam(),
        quantity: data.totalQuantity,
        skuId: data.selectedSkuId
      })
      .catch(() => undefined);

    if (result?.success) {
      window.location.assign(
        createCashierHrefFromSubmitResult({
          dvyType: "1",
          orderNumbers: result.data.view.orderNumbers,
          orderType: "0",
          ordermold: "0"
        })
      );
      setSubmitState({
        message: result.data.view.message,
        orderNumbers: result.data.view.orderNumbers,
        status: "success"
      });
      return;
    }

    setSubmitState({
      message: result && !result.success ? result.message : "订单提交失败，请稍后重试。",
      status: "error"
    });
  }

  return (
    <div className={styles.submitBar}>
      <div className={styles.submitInner}>
        <div className={styles.submitText}>
          <p>
            共{data.totalQuantity}件 合计:
            <strong>
              <span>￥</span>
              {data.totalAmount}
            </strong>
          </p>
          {submitState.status !== "idle" ? (
            <span className={submitState.status === "error" ? styles.submitError : styles.submitMessage}>
              {submitState.orderNumbers ? `${submitState.message} 订单号：${submitState.orderNumbers}` : submitState.message}
            </span>
          ) : null}
        </div>
        <button
          className={canSubmit ? styles.submitButton : styles.submitButtonDisabled}
          disabled={!canSubmit}
          onClick={handleSubmit}
          type="button"
        >
          {submitState.status === "submitting" ? "提交中" : submitState.status === "success" ? "已下单" : "提交订单"}
        </button>
      </div>
    </div>
  );
}

function createAddressSelectHref(data: OrderConfirmData) {
  const query = new URLSearchParams({
    select: "1",
    productId: data.productId,
    quantity: String(data.totalQuantity),
    skuId: data.selectedSkuId
  });

  if (data.selectedAddressId) {
    query.set("addressId", data.selectedAddressId);
  }

  return `/address?${query.toString()}`;
}
