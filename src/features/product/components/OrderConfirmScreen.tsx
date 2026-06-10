import { ProductImagePlaceholder, StandardNavPage } from "@/design-system";

import type { OrderConfirmData, OrderConfirmFeeRow, OrderConfirmItem } from "../types";
import styles from "./OrderConfirmScreen.module.css";

type OrderConfirmScreenProps = {
  data: OrderConfirmData;
};

export function OrderConfirmScreen({ data }: OrderConfirmScreenProps) {
  return (
    <StandardNavPage backHref="/product/p-1001" title="提交订单" className={styles.screen} contentClassName={styles.content}>
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
  if (!data.address) {
    return (
      <section className={styles.addressCard} aria-label="收货信息">
        <span className={styles.locationIcon} aria-hidden="true" />
        <strong>请先填写收货人信息</strong>
        <span className={styles.arrowIcon} aria-hidden="true" />
      </section>
    );
  }

  return (
    <section className={styles.addressCardLarge} aria-label="收货信息">
      <div className={styles.addressTitleRow}>
        <span className={styles.locationIcon} aria-hidden="true" />
        <strong>{data.address.fullAddress}</strong>
        <span className={styles.arrowIcon} aria-hidden="true" />
      </div>
      <p>
        <span>{data.address.name}</span>
        <span>{data.address.phone}</span>
      </p>
    </section>
  );
}

function OrderItemCard({ item }: { item: OrderConfirmItem }) {
  return (
    <article className={styles.orderItem}>
      <ProductImagePlaceholder ariaLabel={item.imageLabel} className={styles.itemImage} />
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
  return (
    <div className={styles.submitBar}>
      <div className={styles.submitInner}>
        <p>
          共{data.totalQuantity}件 合计:
          <strong>
            <span>￥</span>
            {data.totalAmount}
          </strong>
        </p>
        <button className={data.canSubmit ? styles.submitButton : styles.submitButtonDisabled} disabled={!data.canSubmit} type="button">
          提交订单
        </button>
      </div>
    </div>
  );
}
