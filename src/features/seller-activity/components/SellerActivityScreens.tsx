"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { EmptyState, ProductImagePlaceholder, StandardNavPage, cn } from "@/design-system";
import { PromotionProductQueryControls } from "@/features/promotion/components/PromotionProductQueryControls";
import { DEFAULT_PROMOTION_PRODUCT_ORDER_BY, type PromotionProductQueryValue } from "@/features/promotion/promotion-product-query";
import { createH5Client } from "@/lib/http";
import { buildClientHref, HybridLink } from "@/lib/navigation";

import { createSellerActivityApi, type SellerActivityApi } from "../api";
import type {
  SellerActivityPage,
  SellerActivityProduct,
  SellerActivitySku,
  SellerActivityStatus,
  SellerActivitySummary,
  SellerAvailableProduct
} from "../types";
import styles from "./SellerActivityScreens.module.css";

const PAGE_SIZE = 10;

export function SellerActivitiesScreen({ activities }: { activities: SellerActivitySummary[] }) {
  return (
    <StandardNavPage title="营销活动" backHref="/mine" className={styles.screen} contentClassName={styles.content}>
      <main className={styles.section}>
        {activities.length === 0 ? <EmptyState className={styles.emptyState} text="暂无可参加的营销活动" /> : null}
        <div className={styles.activityList}>
          {activities.map((activity) => (
            <HybridLink className={styles.activityCard} href={activity.href} key={activity.id} source="seller-activities" strategy="new-webview" title={activity.title}>
              {activity.imageUrl ? (
                <img alt="" className={styles.activityImage} src={activity.imageUrl} />
              ) : (
                <span className={styles.activityImagePlaceholder}>{activity.title}</span>
              )}
              <div className={styles.activityBody}>
                <div className={styles.activityTitleRow}>
                  <h2>{activity.title}</h2>
                  <span className={styles.activityOrder}>本月订单：{activity.orderCount}单</span>
                </div>
                {activity.description ? <p className={styles.activityDesc}>{activity.description}</p> : null}
                <p className={styles.activityCount}>
                  <strong>{activity.runningProductCount}</strong> 个商品正在参与活动
                </p>
              </div>
            </HybridLink>
          ))}
        </div>
      </main>
    </StandardNavPage>
  );
}

type ProductListState = {
  page: SellerActivityPage;
  products: SellerActivityProduct[];
  status: "idle" | "skeleton" | "loadingMore" | "error";
};

export function SellerActivityProductsScreen({
  activityId,
  activityTitle,
  initialPage,
  initialProducts,
  sellerActivityApi
}: {
  activityId: string;
  activityTitle?: string;
  initialPage: SellerActivityPage;
  initialProducts: SellerActivityProduct[];
  sellerActivityApi?: Pick<SellerActivityApi, "batchStatus" | "getActivityProducts">;
}) {
  const defaultApi = useMemo(() => createSellerActivityApi(createH5Client()), []);
  const api = sellerActivityApi ?? defaultApi;
  const [status, setStatus] = useState<SellerActivityStatus>(1);
  const [listState, setListState] = useState<ProductListState>({ page: initialPage, products: initialProducts, status: "idle" });
  const [editing, setEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const requestSeq = useRef(0);
  const listStateRef = useRef(listState);

  useEffect(() => {
    listStateRef.current = listState;
  }, [listState]);

  const reloadProducts = useCallback(
    async (nextStatus: SellerActivityStatus, options: { append?: boolean } = {}) => {
      const seq = requestSeq.current + 1;
      requestSeq.current = seq;
      setListState((current) => ({
        ...current,
        status: options.append ? "loadingMore" : "skeleton"
      }));

      try {
        const result = await api.getActivityProducts(activityId, {
          current: options.append ? listStateRef.current.page.current + 1 : 1,
          size: PAGE_SIZE,
          status: nextStatus
        });
        if (requestSeq.current !== seq) {
          return;
        }
        if (!result.success) {
          setListState((current) => ({ ...current, status: "error" }));
          return;
        }
        setListState((current) => ({
          page: result.data.page,
          products: options.append ? [...current.products, ...result.data.view.products] : result.data.view.products,
          status: "idle"
        }));
      } catch {
        if (requestSeq.current === seq) {
          setListState((current) => ({ ...current, status: "error" }));
        }
      }
    },
    [activityId, api]
  );

  function switchStatus(nextStatus: SellerActivityStatus) {
    if (nextStatus === status) {
      return;
    }
    setStatus(nextStatus);
    setEditing(false);
    setSelectedIds(new Set());
    void reloadProducts(nextStatus);
  }

  async function applyBatch(nextStatus: -1 | 0 | 1) {
    if (selectedIds.size === 0) {
      showToast("请先选择商品");
      return;
    }
    const result = await api.batchStatus({
      ids: Array.from(selectedIds).map(Number),
      status: nextStatus
    });
    if (!result.success) {
      showToast(result.message || "操作失败");
      return;
    }
    setConfirmDelete(false);
    setEditing(false);
    setSelectedIds(new Set());
    showToast(result.data.view.message);
    void reloadProducts(status);
  }

  function toggleSelected(id?: string) {
    if (!id) {
      showToast("该商品缺少活动配置 ID，无法批量操作");
      return;
    }
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAll() {
    const selectableIds = listState.products.map((product) => product.id).filter((id): id is string => Boolean(id));
    setSelectedIds((current) => current.size === selectableIds.length ? new Set() : new Set(selectableIds));
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  const batchActionLabel = status === 1 ? "暂停" : "开始";
  const batchActionStatus = status === 1 ? 0 : 1;
  const allSelected = listState.products.length > 0 && listState.products.every((product) => product.id && selectedIds.has(product.id));
  const title = activityTitle?.trim() || "活动配置";
  const canBatchEdit = listState.status !== "skeleton" && listState.products.length > 0;
  const batchEditButton = (
    <button className={styles.textButton} type="button" onClick={() => {
      setEditing((value) => !value);
      setSelectedIds(new Set());
    }}>
      {editing ? "完成" : "批量编辑"}
    </button>
  );

  return (
    <StandardNavPage
      title={title}
      backHref="/seller/activities"
      rightNode={canBatchEdit ? batchEditButton : null}
      className={styles.screen}
      contentClassName={styles.content}
    >
      {toast ? <div className={styles.toast}>{toast}</div> : null}
      <div className={styles.tabs}>
        <button className={cn(styles.tabButton, status === 1 && styles.tabActive)} type="button" onClick={() => switchStatus(1)}>进行中</button>
        <button className={cn(styles.tabButton, status === 0 && styles.tabActive)} type="button" onClick={() => switchStatus(0)}>已暂停</button>
      </div>
      <main className={styles.productList}>
        {listState.status === "skeleton" ? <SellerProductSkeleton /> : null}
        {listState.status !== "skeleton" && listState.products.length === 0 ? (
          <EmptyState className={styles.emptyState} text="暂无商品，快去新增活动商品吧~" />
        ) : null}
        {listState.status !== "skeleton" ? listState.products.map((product) => (
          <SellerActivityProductRow
            editing={editing}
            key={`${product.prodId}-${product.id ?? "new"}`}
            product={product}
            selected={product.id ? selectedIds.has(product.id) : false}
            onToggleSelected={() => toggleSelected(product.id)}
          />
        )) : null}
        {listState.status === "error" ? <EmptyState text="活动商品加载失败" /> : null}
        {listState.page.hasMore && listState.status !== "skeleton" ? (
          <button className={styles.loadMore} disabled={listState.status === "loadingMore"} type="button" onClick={() => reloadProducts(status, { append: true })}>
            {listState.status === "loadingMore" ? "加载中..." : "加载更多"}
          </button>
        ) : null}
      </main>
      {editing && canBatchEdit ? (
        <div className={styles.batchBar}>
          <div className={styles.batchLeft}>
            <button className={cn(styles.checkButton, allSelected && styles.checkButtonActive)} type="button" onClick={toggleAll}>{allSelected ? "✓" : ""}</button>
            <span>全选</span>
            <span>已选{selectedIds.size}条</span>
          </div>
          <div className={styles.batchActions}>
            <button className={styles.secondaryButton} type="button" onClick={() => setEditing(false)}>取消</button>
            <button className={styles.orangeButton} type="button" onClick={() => applyBatch(batchActionStatus)}>{batchActionLabel}</button>
            <button className={styles.dangerButton} type="button" onClick={() => setConfirmDelete(true)}>删除</button>
          </div>
        </div>
      ) : (
        <a className={styles.bottomAdd} href={buildClientHref(`/seller/activities/${activityId}/products`)}>新增活动商品</a>
      )}
      {confirmDelete ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <h2>确认删除该活动商品?</h2>
            <div className={styles.modalActions}>
              <button type="button" onClick={() => setConfirmDelete(false)}>取消</button>
              <button type="button" onClick={() => applyBatch(-1)}>确认</button>
            </div>
          </div>
        </div>
      ) : null}
    </StandardNavPage>
  );
}

function SellerActivityProductRow({
  editing,
  onToggleSelected,
  product,
  selected
}: {
  editing: boolean;
  onToggleSelected: () => void;
  product: SellerActivityProduct;
  selected: boolean;
}) {
  const card = (
    <div className={styles.productCard}>
      <SellerActivityProductCard product={product} />
    </div>
  );
  return (
    <div className={cn(styles.productRow, editing && styles.productRowEditing)}>
      {editing ? <button className={cn(styles.checkButton, selected && styles.checkButtonActive)} type="button" onClick={onToggleSelected}>{selected ? "✓" : ""}</button> : null}
      {editing ? card : <a href={buildClientHref(`/seller/activities/${product.activityId}/products/${product.prodId}`)} className={styles.productCard}><SellerActivityProductCard product={product} /></a>}
    </div>
  );
}

function SellerActivityProductCard({ product }: { product: SellerActivityProduct }) {
  return (
    <>
      {product.imageUrl ? (
        <img alt="" className={styles.productImageReal} src={product.imageUrl} />
      ) : (
        <ProductImagePlaceholder className={styles.productImage} />
      )}
      <div className={styles.cardInfo}>
        <h2 className={styles.cardTitle}>{product.title}</h2>
        <div className={styles.tagLine}>
          <span className={styles.tag}>推荐</span>
          {product.brief ? <span className={styles.brief}>{product.brief}</span> : null}
        </div>
        <p className={styles.metaText}>销量 {product.soldNum}+</p>
        <div className={styles.priceLine}>
          <span>活动价</span>
          <strong className={styles.price}>¥{formatAmount(product.price)}</strong>
          {product.originalPrice > 0 ? <span className={styles.originalPrice}>¥{formatAmount(product.originalPrice)}</span> : null}
        </div>
        {product.commissionText ? <p className={styles.commission}>{product.commissionText}</p> : null}
        {product.activityStartTime || product.activityEndTime ? (
          <p className={styles.metaText}>{product.activityStartTime ?? ""} - {product.activityEndTime ?? ""}</p>
        ) : null}
      </div>
    </>
  );
}

function SellerProductSkeleton() {
  return (
    <>
      <div className={styles.skeletonCard} />
      <div className={styles.skeletonCard} />
      <div className={styles.skeletonCard} />
    </>
  );
}

type AvailableState = {
  page: SellerActivityPage;
  products: SellerAvailableProduct[];
  status: "idle" | "skeleton" | "loadingMore" | "error";
};

export function SellerActivityProductSelectScreen({
  activityId,
  initialPage,
  initialProducts,
  sellerActivityApi
}: {
  activityId: string;
  initialPage: SellerActivityPage;
  initialProducts: SellerAvailableProduct[];
  sellerActivityApi?: Pick<SellerActivityApi, "getAvailableProducts">;
}) {
  const defaultApi = useMemo(() => createSellerActivityApi(createH5Client()), []);
  const api = sellerActivityApi ?? defaultApi;
  const [queryValue, setQueryValue] = useState<PromotionProductQueryValue>({
    keyword: "",
    orderBy: DEFAULT_PROMOTION_PRODUCT_ORDER_BY
  });
  const [state, setState] = useState<AvailableState>({ page: initialPage, products: initialProducts, status: "idle" });
  const stateRef = useRef(state);
  const didMountRef = useRef(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const loadProducts = useCallback(
    async (options: { append?: boolean; queryValue?: PromotionProductQueryValue } = {}) => {
      const activeQuery = options.queryValue ?? queryValue;
      setState((current) => ({ ...current, status: options.append ? "loadingMore" : "skeleton" }));
      try {
        const result = await api.getAvailableProducts(activityId, {
          categoryId: activeQuery.categoryId,
          current: options.append ? stateRef.current.page.current + 1 : 1,
          keyword: activeQuery.keyword || undefined,
          orderBy: activeQuery.orderBy,
          size: PAGE_SIZE
        });
        if (!result.success) {
          setState((current) => ({ ...current, status: "error" }));
          return;
        }
        setState((current) => ({
          page: result.data.page,
          products: options.append ? [...current.products, ...result.data.view.products] : result.data.view.products,
          status: "idle"
        }));
      } catch {
        setState((current) => ({ ...current, status: "error" }));
      }
    },
    [activityId, api, queryValue]
  );

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    void loadProducts({ queryValue });
  }, [loadProducts, queryValue]);

  const hasProducts = state.products.length > 0;
  const isSkeleton = state.status === "skeleton";
  const isInitialError = state.status === "error" && !hasProducts;
  const isEmpty = !isSkeleton && !isInitialError && !hasProducts;
  const showLoadMore = !isSkeleton && hasProducts && state.page.hasMore;
  const showNoMore = !isSkeleton && hasProducts && !state.page.hasMore && state.status !== "error";
  const loadMoreText = state.status === "loadingMore" ? "加载中..." : state.status === "error" ? "加载失败，点击重试" : "加载更多";

  return (
    <StandardNavPage title="选择商品" backHref={`/seller/activities/${activityId}`} className={styles.screen} contentClassName={styles.content}>
      <PromotionProductQueryControls className={styles.queryControls} value={queryValue} onChange={setQueryValue} />
      <main className={styles.productList}>
        {isSkeleton ? <SellerProductSkeleton /> : null}
        {isEmpty ? <EmptyState className={styles.emptyState} text="暂无可选商品" /> : null}
        {isInitialError ? (
          <div className={styles.stateBlock}>
            <EmptyState className={styles.emptyState} text="可选商品加载失败" />
            <button className={styles.loadMore} type="button" onClick={() => loadProducts()}>
              重新加载
            </button>
          </div>
        ) : null}
        {!isSkeleton ? state.products.map((product) => <AvailableProductCard activityId={activityId} key={product.prodId} product={product} />) : null}
        {showLoadMore ? (
          <button className={styles.loadMore} disabled={state.status === "loadingMore"} type="button" onClick={() => loadProducts({ append: true })}>
            {loadMoreText}
          </button>
        ) : null}
        {showNoMore ? <p className={styles.loadMoreDone}>没有更多了</p> : null}
      </main>
    </StandardNavPage>
  );
}

function AvailableProductCard({ activityId, product }: { activityId: string; product: SellerAvailableProduct }) {
  const query = new URLSearchParams({
    commission: String(product.commissionAmount),
    price: String(product.price),
    title: product.title
  });
  if (product.imageUrl) {
    query.set("image", product.imageUrl);
  }
  return (
    <article className={cn(styles.productCard, styles.availableProductCard)}>
      {product.imageUrl ? <img alt="" className={styles.productImageReal} src={product.imageUrl} /> : <ProductImagePlaceholder className={styles.productImage} />}
      <div className={styles.cardInfo}>
        <h2 className={styles.cardTitle}>{product.title}</h2>
        <p className={styles.metaText}>销量 {product.soldNum}+</p>
        <div className={styles.priceLine}>
          <strong className={styles.price}>¥{formatAmount(product.price)}</strong>
          {product.originalPrice > 0 ? <span className={styles.originalPrice}>¥{formatAmount(product.originalPrice)}</span> : null}
        </div>
        <p className={styles.commission}>
          <span>佣金:</span>
          <strong>¥{formatAmount(product.commissionAmount)}</strong>
        </p>
        <a className={styles.selectButton} href={buildClientHref(`/seller/activities/${activityId}/products/${product.prodId}?${query.toString()}`)}>选择商品</a>
      </div>
    </article>
  );
}

export function SellerActivityProductFormScreen({
  activityId,
  fallbackProduct,
  initialProduct,
  prodId,
  sellerActivityApi
}: {
  activityId: string;
  fallbackProduct?: Partial<SellerActivityProduct>;
  initialProduct: SellerActivityProduct | null;
  prodId: string;
  sellerActivityApi?: Pick<SellerActivityApi, "saveActivity">;
}) {
  const defaultApi = useMemo(() => createSellerActivityApi(createH5Client()), []);
  const api = sellerActivityApi ?? defaultApi;
  const product = initialProduct ?? createFallbackProduct(activityId, prodId, fallbackProduct);
  const [limitNum, setLimitNum] = useState(product.limitNum || 1);
  const [startTime, setStartTime] = useState(toDateTimeLocal(product.activityStartTime));
  const [endTime, setEndTime] = useState(toDateTimeLocal(product.activityEndTime));
  const [skuPrices, setSkuPrices] = useState<Record<string, string>>(() =>
    createFormSkus(product).reduce<Record<string, string>>((acc, sku) => {
      acc[sku.skuId] = sku.activityPrice === undefined ? "" : String(sku.activityPrice);
      return acc;
    }, {})
  );
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const skus = createFormSkus(product);

  async function submit() {
    const skuList = skus.map((sku) => ({
      activityPrice: Number(skuPrices[sku.skuId]),
      skuId: Number(sku.skuId)
    }));
    if (skuList.some((sku) => !Number.isFinite(sku.activityPrice) || sku.activityPrice <= 0)) {
      showToast("请填写 SKU 活动价");
      return;
    }
    setSaving(true);
    const result = await api.saveActivity({
      ...(product.id ? { id: Number(product.id) } : {}),
      activityEndTime: fromDateTimeLocal(endTime),
      activityId: Number(activityId),
      activityStartTime: fromDateTimeLocal(startTime),
      limitNum,
      prodId: Number(prodId),
      skuList
    });
    setSaving(false);
    if (!result.success) {
      showToast(result.message || "保存失败");
      return;
    }
    showToast(result.data.view.message || "修改成功");
    window.setTimeout(() => {
      window.location.href = buildClientHref(`/seller/activities/${activityId}`);
    }, 650);
  }

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  return (
    <StandardNavPage title="商品设置" backHref={`/seller/activities/${activityId}`} className={styles.screen} contentClassName={styles.content}>
      {toast ? <div className={styles.toast}>{toast}</div> : null}
      <main className={styles.formContent}>
        <section className={styles.formProductCard}>
          {product.imageUrl ? <img alt="" className={styles.formImageReal} src={product.imageUrl} /> : <ProductImagePlaceholder className={styles.formImage} />}
          <div className={styles.formProductInfo}>
            <h2>{product.title}</h2>
            <p className={styles.commission}>{product.commissionText ?? ""}</p>
            <div className={styles.formPriceRow}>
              <p>
                <span>用户价</span>
                <strong>¥{formatAmount(product.price)}</strong>
                {product.originalPrice > 0 ? <span className={styles.originalPrice}>¥{formatAmount(product.originalPrice)}</span> : null}
              </p>
              <span>销量: {product.soldNum}+</span>
            </div>
          </div>
        </section>
        <p className={styles.formTip}>
          <span aria-hidden="true" className={styles.formTipIcon}>!</span>
          <span>根据您设置的折扣价格，商品佣金会相应降低</span>
        </p>
        <section className={styles.settingGroup}>
          <div className={styles.settingRow}>
            <label>活动时间</label>
            <div className={styles.dateRangeControls}>
              <input aria-label="开始时间" type="datetime-local" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
              <span aria-hidden="true">-</span>
              <input aria-label="结束时间" type="datetime-local" value={endTime} onChange={(event) => setEndTime(event.target.value)} />
            </div>
          </div>
          <div className={styles.settingRow}>
            <label>每人限购</label>
            <div className={styles.stepper}>
              <button type="button" onClick={() => setLimitNum((value) => Math.max(1, value - 1))}>-</button>
              <strong>{limitNum}</strong>
              <button type="button" onClick={() => setLimitNum((value) => value + 1)}>+</button>
            </div>
          </div>
        </section>
        <section className={styles.skuSection}>
          {skus.map((sku, index) => (
            <div className={styles.skuSettingBlock} key={sku.skuId}>
              <p className={styles.skuTitle}>规格{index + 1}：{sku.skuName}</p>
              <div className={styles.settingGroup}>
                <div className={styles.settingRow}>
                  <label htmlFor={`sku-${sku.skuId}`}>秒杀价格</label>
                  <div className={styles.amountInput}>
                    <input
                      id={`sku-${sku.skuId}`}
                      inputMode="decimal"
                      placeholder="请输入金额"
                      value={skuPrices[sku.skuId] ?? ""}
                      onChange={(event) => setSkuPrices((current) => ({ ...current, [sku.skuId]: event.target.value }))}
                    />
                    <span>元</span>
                  </div>
                </div>
                <div className={styles.settingRow}>
                  <label>商品佣金</label>
                  <span className={styles.settingValue}>{sku.commission === undefined ? "--" : `${formatAmount(sku.commission)}元/件`}</span>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
      <div className={styles.formBottomBar}>
        <a className={styles.secondaryButton} href={buildClientHref(`/seller/activities/${activityId}`)}>取消</a>
        <button className={styles.primaryButton} disabled={saving} type="button" onClick={submit}>{saving ? "保存中..." : "确认修改"}</button>
      </div>
    </StandardNavPage>
  );
}

function createFallbackProduct(activityId: string, prodId: string, fallbackProduct?: Partial<SellerActivityProduct>): SellerActivityProduct {
  const commission = fallbackProduct?.commissionText;
  return {
    activityId,
    imageUrl: fallbackProduct?.imageUrl,
    limitNum: 1,
    originalPrice: fallbackProduct?.originalPrice ?? 0,
    price: fallbackProduct?.price ?? 0,
    prodId,
    skuList: [{ skuId: prodId, skuName: "默认规格" }],
    soldNum: fallbackProduct?.soldNum ?? 0,
    title: fallbackProduct?.title ?? `商品 ${prodId}`,
    ...(commission ? { commissionText: commission } : {})
  };
}

function createFormSkus(product: SellerActivityProduct): SellerActivitySku[] {
  return product.skuList.length > 0 ? product.skuList : [{ skuId: product.prodId, skuName: "默认规格" }];
}

function toDateTimeLocal(value?: string) {
  if (!value) {
    return "";
  }
  return value.replace(" ", "T").slice(0, 16);
}

function fromDateTimeLocal(value: string) {
  return value ? `${value.replace("T", " ")}:00` : undefined;
}

function formatAmount(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
