"use client";

import { useState } from "react";
import { ProductImagePlaceholder, StandardNavPage, cn } from "@/design-system";

import { mineOrders, orderStatusTabs, type MineOrder, type OrderItem, type OrderStatus } from "../mock/data";
import { ProductThumb } from "./ProductThumb";
import styles from "./OrdersScreen.module.css";

type OrdersScreenProps = {
  initialStatus?: OrderStatus;
};

export function OrdersScreen({ initialStatus = "all" }: OrdersScreenProps) {
  const [status, setStatus] = useState<OrderStatus>(() => normalizeOrderStatus(initialStatus));
  const orders = status === "empty" ? [] : status === "all" ? mineOrders : mineOrders.filter((order) => order.status === status);

  return (
    <StandardNavPage title="订单列表" backHref="/mine" className={styles.screen} contentClassName={styles.content}>
      <div className={styles.stickyTop}>
        <label className={styles.searchBox}>
          <span aria-hidden="true" className={styles.searchIcon} />
          <input placeholder="搜索..." type="search" />
        </label>
        <nav className={styles.orderTabs} aria-label="订单状态" role="tablist">
          <span className={cn(styles.orderTabTrack, styles[`orderTabTrack_${status}`])} aria-hidden="true" />
          {orderStatusTabs.map((tab) => (
            <button
              aria-selected={tab.id === status}
              className={cn(styles.orderTab, tab.id === status ? styles.activeTab : "")}
              key={tab.id}
              role="tab"
              type="button"
              onClick={() => setStatus(tab.id)}
            >
              {tab.title}
            </button>
          ))}
        </nav>
      </div>
      {orders.length > 0 ? (
        <div className={styles.orderList} key={status} aria-live="polite">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <EmptyOrders />
      )}
    </StandardNavPage>
  );
}

export function normalizeOrderStatus(status: string | undefined): OrderStatus {
  const knownStatuses = new Set<OrderStatus>(["all", "pending-payment", "pending-shipment", "pending-receipt", "completed", "empty"]);
  return knownStatuses.has(status as OrderStatus) ? (status as OrderStatus) : "all";
}

function OrderCard({ order }: { order: MineOrder }) {
  return (
    <article className={styles.orderCard}>
      <div className={styles.orderHeader}>
        <span className={styles.shopName}>
          <span aria-hidden="true" className={styles.shopIcon} />
          {order.shopName}
        </span>
        <span className={order.status === "completed" ? styles.completedStatus : styles.pendingStatus}>{order.statusLabel}</span>
      </div>
      <div className={styles.orderItems}>
        {order.items.map((item) => (
          <OrderProductItem item={item} key={item.id} />
        ))}
      </div>
      {order.total ? (
        <p className={styles.total}>
          合计：<strong>¥{order.total}</strong>
        </p>
      ) : null}
      <div className={styles.actions}>
        {order.status === "completed" ? <button type="button">更多操作</button> : <button type="button">取消订单</button>}
        <button type="button">联系商家</button>
        <button className={styles.primaryAction} type="button">
          继续付款
        </button>
      </div>
    </article>
  );
}

function OrderProductItem({ item }: { item: OrderItem }) {
  return (
    <div className={styles.orderProduct}>
      <ProductThumb className={styles.orderThumb} />
      <div className={styles.orderProductInfo}>
        <h2>{item.title}</h2>
        <p>数量：1件</p>
        <div className={styles.orderPrice}>
          <strong>¥{item.price}</strong>
          {item.originalPrice ? <del>¥{item.originalPrice}</del> : null}
        </div>
        {item.tags && item.tags.length > 0 ? (
          <div className={styles.orderTags}>
            {item.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function EmptyOrders() {
  return (
    <section className={styles.emptyState} aria-label="订单为空">
      <ProductImagePlaceholder className={styles.emptyMascot} decorative hideDefaultIcon>
        <span className={styles.boxTop} />
        <span className={styles.boxBody} />
        <span className={styles.emptyFace} />
      </ProductImagePlaceholder>
      <p>这里空空如也~</p>
    </section>
  );
}
