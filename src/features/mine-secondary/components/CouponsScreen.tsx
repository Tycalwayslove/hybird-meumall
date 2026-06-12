import { StandardNavPage } from "@/design-system";

import { couponItems, type CouponItem } from "../mock/data";
import styles from "./CouponsScreen.module.css";

export function CouponsScreen() {
  return (
    <StandardNavPage title="我的优惠券" backHref="/mine" className={styles.screen} contentClassName={styles.content}>
      <p className={styles.summary}>
        可使用优惠券<span>{couponItems.length}</span>个
      </p>
      <div className={styles.couponList}>
        {couponItems.map((coupon) => (
          <CouponCard coupon={coupon} key={coupon.id} />
        ))}
      </div>
    </StandardNavPage>
  );
}

function CouponCard({ coupon }: { coupon: CouponItem }) {
  return (
    <article className={styles.couponCard}>
      <div className={styles.amountBlock}>
        <strong>
          <span>¥</span>
          {coupon.amount}
        </strong>
        <p>{coupon.threshold}</p>
      </div>
      <div className={styles.couponDivider} aria-hidden="true" />
      <div className={styles.couponInfo}>
        <h2>
          {coupon.name}
          <span>({coupon.type})</span>
        </h2>
        <p>有效期:{coupon.dateRange}</p>
      </div>
      <button className={styles.useButton} type="button">
        去使用
      </button>
    </article>
  );
}
