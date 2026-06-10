"use client";

import Link from "next/link";
import { useState } from "react";

import { StandardNavPage } from "@/design-system";

import type { ProductDetailData, ProductReview, ProductSelectionItem, ProductServiceItem } from "../types";
import styles from "./ProductDetailScreen.module.css";
import { ProductPurchaseSheet } from "./ProductPurchaseSheet";

type ProductDetailScreenProps = {
  data: ProductDetailData;
};

export function ProductDetailScreen({ data }: ProductDetailScreenProps) {
  const [showPurchaseSheet, setShowPurchaseSheet] = useState(false);

  return (
    <StandardNavPage backHref="/" title="商品详情" contentClassName={styles.scrollBody}>
      <article className={styles.page}>
        <ProductHero data={data} />
        <ProductInfoCard data={data} onOpenPurchaseSheet={() => setShowPurchaseSheet(true)} />
        <ReviewSection data={data} />
        <DetailSection data={data} />
      </article>
      <BottomActionBar data={data} onBuy={() => setShowPurchaseSheet(true)} />
      {showPurchaseSheet ? <ProductPurchaseSheet data={data} onClose={() => setShowPurchaseSheet(false)} /> : null}
    </StandardNavPage>
  );
}

export function ProductNotFoundScreen() {
  return (
    <StandardNavPage backHref="/" title="商品详情" contentClassName={styles.notFoundBody}>
      <section className={styles.notFoundCard} aria-label="商品未找到">
        <div className={styles.notFoundIcon} aria-hidden="true" />
        <h2>商品暂时不可见</h2>
        <p>该商品可能已下架或链接已失效，请返回首页重新选择。</p>
        <Link href="/" className={styles.notFoundLink}>
          返回首页
        </Link>
      </section>
    </StandardNavPage>
  );
}

function ProductHero({ data }: ProductDetailScreenProps) {
  return (
    <section className={styles.hero} aria-label="商品图片和价格">
      <div className={styles.productVisual} aria-label="商品图占位">
        <div className={styles.visualBackdrop} />
        <div className={styles.shirtShape} />
        <div className={styles.visualShadow} />
        <span className={styles.galleryBadge}>{data.galleryText}</span>
      </div>
      <div className={styles.priceStrip}>
        <div className={styles.priceLeft}>
          <span className={styles.talentLabel}>{data.talentLevelLabel}</span>
          <div className={styles.priceLine}>
            <strong aria-label={`￥${data.price}`}>
              <span>￥</span>
              {data.price}
            </strong>
            <del>￥{data.originalPrice}</del>
          </div>
        </div>
        <div className={styles.priceRight}>
          <div className={styles.countdown} aria-label={`倒计时 ${data.countdown.join(":")}`}>
            {data.countdown.map((part, index) => (
              <span className={styles.countdownPart} key={`${part}-${index}`}>
                {index > 0 ? <span className={styles.countdownSeparator}>:</span> : null}
                <span className={styles.countdownBox}>{part}</span>
              </span>
            ))}
          </div>
          <span className={styles.soldText}>{data.soldText}</span>
        </div>
      </div>
    </section>
  );
}

function ProductInfoCard({ data, onOpenPurchaseSheet }: ProductDetailScreenProps & { onOpenPurchaseSheet: () => void }) {
  return (
    <section className={styles.infoCard} aria-label="商品基础信息">
      <div className={styles.titleBlock}>
        <h2>{data.title}</h2>
        <p>{data.subtitle}</p>
        <div className={styles.serviceRow}>
          {data.services.map((service) => (
            <ServicePill key={service.label} service={service} />
          ))}
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.selectionList}>
        {data.selectionRows.map((item) => (
          <SelectionRow item={item} key={item.label} onOpenPurchaseSheet={onOpenPurchaseSheet} />
        ))}
      </div>

      <div className={styles.licenseBox}>
        {data.licenseTags.map((tag, index) => (
          <span key={tag}>
            {index > 0 ? <i aria-hidden="true" /> : null}
            {tag}
          </span>
        ))}
      </div>
    </section>
  );
}

function ServicePill({ service }: { service: ProductServiceItem }) {
  return (
    <span className={styles.servicePill}>
      <i aria-hidden="true" />
      {service.label}
    </span>
  );
}

function SelectionRow({ item, onOpenPurchaseSheet }: { item: ProductSelectionItem; onOpenPurchaseSheet: () => void }) {
  const suffix = item.accentPrefix && item.value.startsWith(item.accentPrefix) ? item.value.slice(item.accentPrefix.length) : item.value;
  const isInteractive = Boolean(item.href || item.action);
  const content = (
    <>
      <span className={styles.selectionLabel}>{item.label}</span>
      <span className={item.accentPrefix ? styles.selectionValueAccent : styles.selectionValue}>
        {item.accentPrefix ? <strong>{item.accentPrefix}</strong> : null}
        {suffix}
      </span>
      {isInteractive ? <span className={styles.rowArrow} aria-hidden="true" /> : null}
    </>
  );

  if (item.action === "purchase") {
    return (
      <button className={styles.selectionRow} type="button" onClick={onOpenPurchaseSheet}>
        {content}
      </button>
    );
  }

  if (item.action === "address") {
    return (
      <button className={styles.selectionRow} type="button" aria-label="地址列表暂未开发">
        {content}
      </button>
    );
  }

  if (item.href) {
    return (
      <Link href={item.href} className={styles.selectionRow}>
        {content}
      </Link>
    );
  }

  return <div className={styles.selectionRow}>{content}</div>;
}

function ReviewSection({ data }: ProductDetailScreenProps) {
  return (
    <section className={styles.reviewCard} aria-label="商品评价">
      <div className={styles.reviewHeader}>
        <h2>{data.reviewSummary.countText}</h2>
        <Link href="#reviews" className={styles.reviewMore}>
          {data.reviewSummary.positiveRateText}
          <span aria-hidden="true" />
        </Link>
      </div>
      <div className={styles.reviewTags}>
        {data.reviewSummary.tags.map((tag, index) => (
          <span key={`${tag}-${index}`}>{tag}</span>
        ))}
      </div>
      <div className={styles.reviewList}>
        {data.reviewSummary.reviews.map((review) => (
          <ReviewItem key={`${review.author}-${review.content}`} review={review} />
        ))}
      </div>
    </section>
  );
}

function ReviewItem({ review }: { review: ProductReview }) {
  return (
    <article className={styles.reviewItem}>
      <div className={styles.reviewAuthor}>
        <span className={styles.avatar} aria-hidden="true">
          <span />
        </span>
        <strong>{review.author}</strong>
      </div>
      <p>{review.content}</p>
    </article>
  );
}

function DetailSection({ data }: ProductDetailScreenProps) {
  return (
    <section className={styles.detailCard} aria-label="商品详情内容">
      <h2>{data.detail.title}</h2>
      <p>{data.detail.description}</p>
      <div className={styles.detailVisual} aria-label={data.detail.imageLabel}>
        <div className={styles.detailSky} />
        <div className={styles.detailGround} />
        <div className={styles.detailPerson} />
      </div>
    </section>
  );
}

function BottomActionBar({ data, onBuy }: ProductDetailScreenProps & { onBuy: () => void }) {
  return (
    <div className={styles.actionBar}>
      <div className={styles.actionInner}>
        <Link href={data.consultHref} className={styles.consultBox}>
          <span className={styles.consultAvatar} aria-hidden="true">
            <span />
          </span>
          <span>{data.consultPlaceholder}</span>
        </Link>
        <button className={styles.buyButton} type="button" onClick={onBuy}>
          立即购买
        </button>
      </div>
    </div>
  );
}
