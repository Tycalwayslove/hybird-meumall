"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { ProductImagePlaceholder } from "@/design-system";

import type { ProductDetailData, ProductSkuOption } from "../types";
import styles from "./ProductDetailScreen.module.css";

type ProductPurchaseSheetProps = {
  data: ProductDetailData;
  onClose: () => void;
};

export function ProductPurchaseSheet({ data, onClose }: ProductPurchaseSheetProps) {
  const [selectedSkuId, setSelectedSkuId] = useState(data.purchase.defaultSkuId);
  const [quantity, setQuantity] = useState(data.purchase.defaultQuantity);
  const selectedSku = useMemo(
    () => data.purchase.skus.find((sku) => sku.id === selectedSkuId) ?? data.purchase.skus[0],
    [data.purchase.skus, selectedSkuId]
  );
  const confirmHref = buildOrderConfirmHref(data, selectedSku, quantity);

  return (
    <div aria-label="购买规格选择" aria-modal="true" className={styles.purchaseLayer} role="dialog">
      <button aria-label="关闭购买弹窗" className={styles.purchaseMask} type="button" onClick={onClose} />
      <section className={styles.purchaseSheet}>
        <button aria-label="关闭" className={styles.purchaseClose} type="button" onClick={onClose}>
          <span aria-hidden="true" />
        </button>
        <div className={styles.purchaseHeader}>
          <ProductImagePlaceholder ariaLabel={data.purchase.imageLabel} className={styles.purchaseImage} />
          <div className={styles.purchaseSummary}>
            <p>
              <span>已选</span>
              <strong>{selectedSku.selectedLabel}</strong>
            </p>
            <p>
              <span>库存</span>
              <strong>{selectedSku.stock}件</strong>
            </p>
            <div className={styles.purchasePriceRow}>
              <strong>
                <span>￥</span>
                {selectedSku.price}.<small>00</small>
              </strong>
              <QuantityStepper max={selectedSku.stock} value={quantity} onChange={setQuantity} />
            </div>
          </div>
        </div>

        <div className={styles.purchaseGroup}>
          <h3>{data.purchase.specsTitle}</h3>
          <div className={styles.purchaseOptions}>
            {data.purchase.skus.map((sku) => (
              <button
                key={sku.id}
                className={sku.id === selectedSku.id ? styles.purchaseOptionActive : styles.purchaseOption}
                type="button"
                onClick={() => {
                  setSelectedSkuId(sku.id);
                  setQuantity((current) => Math.min(current, sku.stock));
                }}
              >
                {sku.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.purchaseGroup}>
          <h3>{data.purchase.deliveryTitle}</h3>
          <div className={styles.purchaseOptions}>
            {data.purchase.deliveryOptions.map((delivery) => (
              <button
                key={delivery.id}
                className={delivery.id === data.purchase.defaultDeliveryId ? styles.purchaseOptionActive : styles.purchaseOption}
                type="button"
              >
                {delivery.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.purchaseFooter}>
          <Link className={styles.purchaseConfirm} href={confirmHref}>
            确认
          </Link>
        </div>
      </section>
    </div>
  );
}

function QuantityStepper({
  max,
  onChange,
  value
}: {
  max: number;
  onChange: (value: number) => void;
  value: number;
}) {
  return (
    <div className={styles.quantityStepper} aria-label="购买数量">
      <button aria-label="减少数量" disabled={value <= 1} type="button" onClick={() => onChange(Math.max(1, value - 1))}>
        -
      </button>
      <span>{value}</span>
      <button aria-label="增加数量" disabled={value >= max} type="button" onClick={() => onChange(Math.min(max, value + 1))}>
        +
      </button>
    </div>
  );
}

function buildOrderConfirmHref(data: ProductDetailData, sku: ProductSkuOption, quantity: number) {
  const params = new URLSearchParams({
    productId: data.id,
    skuId: sku.id,
    quantity: String(quantity)
  });

  return `${data.buyHref}?${params.toString()}`;
}
