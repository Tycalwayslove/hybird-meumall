"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { ProductImagePlaceholder, Skeleton, StandardNavPage } from "@/design-system";
import { createWindowProtocolBridge } from "@/lib/bridge/protocol-bridge";
import { createH5Client } from "@/lib/http";

import { createAddressApi } from "@/features/mine-secondary/api";
import { createHybridAddressApi } from "@/features/mine-secondary/address-hybrid-api";
import { formatFullAddress, type AddressEntry } from "@/features/mine-secondary/mock/address-data";

import { createProductApi } from "../api";
import { recordProductDetailFlow } from "../order-flow-log";
import type { ProductDetailData, ProductMediaItem, ProductReview, ProductSelectionItem, ProductServiceItem } from "../types";
import styles from "./ProductDetailScreen.module.css";
import { ProductPurchaseSheet } from "./ProductPurchaseSheet";
import { ProductRichContent } from "./ProductRichContent";

type ProductDetailScreenProps = {
  data: ProductDetailData;
};

type SwipePoint = {
  x: number;
  y: number;
};

export function resolveMediaSwipeDirection({
  deltaX,
  deltaY,
  threshold = 48
}: {
  deltaX: number;
  deltaY: number;
  threshold?: number;
}): -1 | 0 | 1 {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);
  if (absX < threshold || absX <= absY) {
    return 0;
  }
  return deltaX < 0 ? 1 : -1;
}

export function mergeProductAddressSelectionRows(rows: ProductSelectionItem[], address: AddressEntry | null): ProductSelectionItem[] {
  return rows.map((row) => {
    if (row.action !== "address" && row.label !== "配送") {
      return row;
    }

    const deliveryLabel = row.accentPrefix ?? "快递配送";
    const freightText = getDeliveryTailText(row);
    const value = address
      ? [deliveryLabel, formatFullAddress(address), freightText].filter(Boolean).join("  |  ")
      : `${deliveryLabel}  |  请选择收货地址`;

    return {
      ...row,
      action: "address",
      href: row.href ?? "/address",
      value
    };
  });
}

function getDeliveryTailText(row: ProductSelectionItem) {
  const deliveryLabel = row.accentPrefix ?? "";
  const suffix = deliveryLabel && row.value.startsWith(deliveryLabel) ? row.value.slice(deliveryLabel.length) : row.value;
  const parts = suffix
    .split("|")
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.at(-1) ?? "";
}

export function ProductDetailScreen({ data }: ProductDetailScreenProps) {
  const [displayData, setDisplayData] = useState(data);
  const [defaultAddress, setDefaultAddress] = useState<AddressEntry | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showPurchaseSheet, setShowPurchaseSheet] = useState(false);

  useEffect(() => {
    recordProductDetailFlow({ productId: data.id });
  }, [data.id]);

  useEffect(() => {
    let disposed = false;
    const addressApi = createHybridAddressApi({
      bridge: createWindowProtocolBridge(),
      fallback: createAddressApi(createH5Client())
    });

    async function loadDefaultAddress() {
      const result = await addressApi.getDefaultAddress().catch(() => undefined);
      if (disposed || !result?.success) {
        return;
      }
      setDefaultAddress(result.data);
    }

    void loadDefaultAddress();

    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    if (!/^\d+$/.test(data.id)) {
      return;
    }

    let disposed = false;
    const api = createProductApi(createH5Client());

    async function loadProduct() {
      const result = await api.getProductDetail({ addrId: defaultAddress?.addrId, prodId: data.id }).catch(() => undefined);
      if (disposed) {
        return;
      }
      if (result?.success) {
        setDisplayData(result.data.view);
        setLoadError(null);
        return;
      }
      if (result && !result.success) {
        setLoadError(result.message);
      }
    }

    void loadProduct();

    return () => {
      disposed = true;
    };
  }, [defaultAddress?.addrId, data.id]);

  const isLoadingProduct = Boolean(displayData.isLoading && !loadError);
  const isUnavailableProduct = Boolean(displayData.isLoading && loadError);

  return (
    <StandardNavPage backHref="/" title="商品详情" contentClassName={styles.scrollBody}>
      <article className={styles.page}>
        {loadError ? <InlineState message={loadError} title="商品加载失败" /> : null}
        {isLoadingProduct ? <ProductDetailSkeleton /> : null}
        {!isLoadingProduct && !isUnavailableProduct ? (
          <>
            <ProductHero data={displayData} />
            <ProductInfoCard data={{ ...displayData, selectionRows: mergeProductAddressSelectionRows(displayData.selectionRows, defaultAddress) }} onOpenPurchaseSheet={() => setShowPurchaseSheet(true)} />
            <ReviewSection data={displayData} />
            <DetailSection data={displayData} />
          </>
        ) : null}
      </article>
      {!displayData.isLoading ? <BottomActionBar data={displayData} onBuy={() => setShowPurchaseSheet(true)} /> : null}
      {showPurchaseSheet && !displayData.isLoading ? <ProductPurchaseSheet data={displayData} onClose={() => setShowPurchaseSheet(false)} /> : null}
    </StandardNavPage>
  );
}

function InlineState({ message, title }: { message: string; title: string }) {
  return (
    <section className={styles.inlineState} aria-label={title}>
      <strong>{title}</strong>
      <p>{message}</p>
    </section>
  );
}

function ProductDetailSkeleton() {
  return (
    <section className={styles.skeletonPage} aria-label="商品详情加载中" data-product-detail-skeleton="true">
      <Skeleton className={styles.skeletonHero} />
      <div className={styles.skeletonPriceStrip}>
        <Skeleton className={styles.skeletonPrice} />
        <Skeleton className={styles.skeletonCountdown} />
      </div>
      <section className={styles.skeletonCard}>
        <Skeleton className={styles.skeletonTitle} />
        <Skeleton className={styles.skeletonSubtitle} />
        <div className={styles.skeletonServiceRow}>
          <Skeleton className={styles.skeletonPill} />
          <Skeleton className={styles.skeletonPill} />
          <Skeleton className={styles.skeletonPillShort} />
        </div>
      </section>
      <section className={styles.skeletonCard}>
        <Skeleton className={styles.skeletonRow} />
        <Skeleton className={styles.skeletonRowShort} />
        <Skeleton className={styles.skeletonRow} />
      </section>
      <section className={styles.skeletonCard}>
        <Skeleton className={styles.skeletonTitleShort} />
        <Skeleton className={styles.skeletonParagraph} />
        <Skeleton className={styles.skeletonParagraphShort} />
      </section>
    </section>
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
  const fallbackItems = (data.heroImageUrls ?? []).map<ProductMediaItem>((url, index) => ({ id: `image-${index}`, type: "image", url }));
  const mediaItems = data.mediaItems?.length ? data.mediaItems : fallbackItems;
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const didSwipeRef = useRef(false);
  const swipeStartRef = useRef<SwipePoint | null>(null);
  const goToMedia = (direction: -1 | 1) => {
    if (mediaItems.length <= 1) {
      return;
    }
    setActiveIndex((index) => (index + direction + mediaItems.length) % mediaItems.length);
  };

  const startSwipe = (point: SwipePoint) => {
    swipeStartRef.current = point;
  };

  const finishSwipe = (point: SwipePoint) => {
    const start = swipeStartRef.current;
    swipeStartRef.current = null;
    if (!start || mediaItems.length <= 1) {
      return;
    }
    const direction = resolveMediaSwipeDirection({
      deltaX: point.x - start.x,
      deltaY: point.y - start.y
    });
    if (direction !== 0) {
      didSwipeRef.current = true;
      goToMedia(direction);
    }
  };

  const openMediaPreview = (index: number) => {
    if (didSwipeRef.current) {
      didSwipeRef.current = false;
      return;
    }
    setViewerIndex(index);
  };

  return (
    <section className={styles.hero} aria-label="商品图片和价格">
      <div
        className={styles.productVisual}
        aria-label="商品媒体轮播"
        onMouseDown={(event) => {
          if (event.button === 0) {
            startSwipe({ x: event.clientX, y: event.clientY });
          }
        }}
        onMouseLeave={(event) => {
          finishSwipe({ x: event.clientX, y: event.clientY });
        }}
        onMouseUp={(event) => {
          finishSwipe({ x: event.clientX, y: event.clientY });
        }}
        onPointerCancel={() => {
          swipeStartRef.current = null;
        }}
        onPointerDown={(event) => {
          if (event.pointerType === "touch" || event.button !== 0) {
            return;
          }
          startSwipe({ x: event.clientX, y: event.clientY });
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "touch") {
            return;
          }
          finishSwipe({ x: event.clientX, y: event.clientY });
        }}
        onPointerUp={(event) => {
          if (event.pointerType === "touch") {
            return;
          }
          finishSwipe({ x: event.clientX, y: event.clientY });
        }}
        onTouchCancel={() => {
          swipeStartRef.current = null;
        }}
        onTouchEnd={(event) => {
          const touch = event.changedTouches[0];
          if (touch) {
            finishSwipe({ x: touch.clientX, y: touch.clientY });
          }
        }}
        onTouchStart={(event) => {
          const touch = event.changedTouches[0] ?? event.touches[0];
          if (touch) {
            startSwipe({ x: touch.clientX, y: touch.clientY });
          }
        }}
      >
        {mediaItems.length > 0 ? (
          <div className={styles.mediaTrack} style={{ transform: `translate3d(-${activeIndex * 100}%, 0, 0)` }}>
            {mediaItems.map((item, index) => (
              <div className={styles.mediaSlide} key={item.id} aria-hidden={index !== activeIndex}>
                <ProductMediaFrame item={item} onPreview={() => openMediaPreview(index)} />
              </div>
            ))}
          </div>
        ) : (
          <ProductImagePlaceholder
            ariaLabel={data.detail.imageLabel}
            className={styles.heroImagePlaceholder}
            data-product-hero-empty-image="true"
          />
        )}
        {mediaItems.length > 1 ? (
          <>
            <button className={`${styles.mediaNav} ${styles.mediaPrev}`} type="button" aria-label="上一张" onClick={() => goToMedia(-1)} />
            <button className={`${styles.mediaNav} ${styles.mediaNext}`} type="button" aria-label="下一张" onClick={() => goToMedia(1)} />
          </>
        ) : null}
        <span className={styles.galleryBadge}>{mediaItems.length > 0 ? `${activeIndex + 1}/${mediaItems.length}` : data.galleryText}</span>
      </div>
      {viewerIndex !== null ? <MediaPreview items={mediaItems} index={viewerIndex} onClose={() => setViewerIndex(null)} /> : null}
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

function ProductMediaFrame({ item, onPreview }: { item: ProductMediaItem; onPreview: () => void }) {
  if (item.type === "video") {
    return (
      <div className={styles.videoFrame}>
        <video className={styles.realProductImage} controls poster={item.posterUrl} preload="metadata" src={item.url} />
        <button className={styles.videoPlayButton} type="button" onClick={onPreview} aria-label="播放商品视频">
          <span aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <button className={styles.mediaButton} type="button" onClick={onPreview} aria-label="查看商品大图">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.realProductImage} src={item.url} alt="" />
    </button>
  );
}

function MediaPreview({ items, index, onClose }: { index: number; items: ProductMediaItem[]; onClose: () => void }) {
  const [activeIndex, setActiveIndex] = useState(index);
  const item = items[activeIndex];
  const goToMedia = (direction: -1 | 1) => {
    if (items.length <= 1) {
      return;
    }
    setActiveIndex((value) => (value + direction + items.length) % items.length);
  };

  if (!item) {
    return null;
  }

  return (
    <div className={styles.mediaPreview} role="dialog" aria-modal="true" aria-label="商品媒体预览">
      <button className={styles.mediaClose} type="button" onClick={onClose} aria-label="关闭预览">
        ×
      </button>
      <div className={styles.mediaPreviewStage}>
        {item.type === "video" ? (
          <video controls autoPlay poster={item.posterUrl} src={item.url} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt="" />
        )}
      </div>
      {items.length > 1 ? (
        <>
          <button className={`${styles.mediaPreviewNav} ${styles.mediaPreviewPrev}`} type="button" onClick={() => goToMedia(-1)} aria-label="上一个媒体" />
          <button className={`${styles.mediaPreviewNav} ${styles.mediaPreviewNext}`} type="button" onClick={() => goToMedia(1)} aria-label="下一个媒体" />
        </>
      ) : null}
      <span className={styles.mediaPreviewBadge}>{`${activeIndex + 1}/${items.length}`}</span>
    </div>
  );
}

function ProductInfoCard({ data, onOpenPurchaseSheet }: ProductDetailScreenProps & { onOpenPurchaseSheet: () => void }) {
  return (
    <section className={styles.infoCard} aria-label="商品基础信息">
      <div className={styles.titleBlock}>
        <h2>{data.title}</h2>
        <p>{data.subtitle}</p>
        {data.services.length > 0 ? (
          <div className={styles.serviceRow}>
            {data.services.map((service) => (
              <ServicePill key={service.label} service={service} />
            ))}
          </div>
        ) : null}
      </div>

      <div className={styles.divider} />

      <div className={styles.selectionList}>
        {data.selectionRows.map((item) => (
          <SelectionRow item={item} key={item.label} onOpenPurchaseSheet={onOpenPurchaseSheet} />
        ))}
      </div>

      {data.licenseTags.length > 0 ? (
        <div className={styles.licenseBox}>
          {data.licenseTags.map((tag, index) => (
            <span key={tag}>
              {index > 0 ? <i aria-hidden="true" /> : null}
              {tag}
            </span>
          ))}
        </div>
      ) : null}
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
      <Link className={styles.selectionRow} href={item.href ?? "/address"} aria-label="管理收货地址">
        {content}
      </Link>
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
        {data.reviewSummary.reviews.length > 0 ? (
          data.reviewSummary.reviews.map((review) => <ReviewItem key={`${review.author}-${review.content}`} review={review} />)
        ) : (
          <p className={styles.emptyReviews}>暂无评价</p>
        )}
      </div>
    </section>
  );
}

function ReviewItem({ review }: { review: ProductReview }) {
  return (
    <article className={styles.reviewItem}>
      <div className={styles.reviewAuthor}>
        <span className={styles.avatar} aria-hidden="true">
          {review.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={review.avatarUrl} alt="" />
          ) : (
            <span />
          )}
        </span>
        <strong>{review.author}</strong>
        <span className={styles.reviewRating} aria-label={`评分 ${review.rating ?? 5}`}>
          {"★".repeat(review.rating ?? 5)}
        </span>
      </div>
      <p>{review.content}</p>
      {review.imageUrls?.length ? (
        <div className={styles.reviewImages}>
          {review.imageUrls.slice(0, 4).map((imageUrl) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" key={imageUrl} />
          ))}
        </div>
      ) : null}
      {review.skuText ? <span className={styles.reviewSku}>{review.skuText}</span> : null}
    </article>
  );
}

function DetailSection({ data }: ProductDetailScreenProps) {
  return (
    <section className={styles.detailCard} aria-label="商品详情内容">
      <h2>{data.detail.title}</h2>
      {data.detail.richContentHtml ? (
        <ProductRichContent fallback={data.detail.description} html={data.detail.richContentHtml} />
      ) : (
        <>
          <p>{data.detail.description}</p>
          <div className={styles.detailVisual} aria-label={data.detail.imageLabel}>
            <div className={styles.detailSky} />
            <div className={styles.detailGround} />
            <div className={styles.detailPerson} />
          </div>
        </>
      )}
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
