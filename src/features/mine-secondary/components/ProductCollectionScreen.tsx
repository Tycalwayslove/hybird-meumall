"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { EmptyState, ProductImagePlaceholder, StandardNavPage, cn } from "@/design-system";
import { createH5Client } from "@/lib/http";
import { buildClientHref } from "@/lib/navigation";

import { createCollectionsApi } from "../api";
import type { CollectionProductView } from "../server/collections-real-service";
import styles from "./ProductCollectionScreen.module.css";

type ProductCollectionMode = "favorites" | "footprints";

type ProductCollectionScreenProps = {
  initialEditing?: boolean;
  mode: ProductCollectionMode;
};

const pageCopy: Record<ProductCollectionMode, { title: string; backHref: string }> = {
  favorites: { title: "我的收藏", backHref: "/mine" },
  footprints: { title: "我的足迹", backHref: "/mine" }
};

export function ProductCollectionScreen({ initialEditing = false, mode }: ProductCollectionScreenProps) {
  const [isEditing, setIsEditing] = useState(initialEditing);
  const [products, setProducts] = useState<CollectionProductView[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [toast, setToast] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const api = useMemo(() => createCollectionsApi(createH5Client()), []);
  const copy = pageCopy[mode];
  const selectedCount = selectedIds.length;
  const allSelected = selectedCount === products.length && products.length > 0;

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");
    setIsConfirmingDelete(false);

    try {
      const result =
        mode === "favorites" ? await api.getFavoriteProducts({ current: 1, size: 20 }) : await api.getFootprints({ current: 1, size: 20 });
      if (!result.success) {
        setProducts([]);
        setSelectedIds([]);
        setError(result.message || `${copy.title}加载失败，请稍后重试。`);
        setLoading(false);
        return;
      }
      setProducts(result.data.view.items);
      setSelectedIds([]);
      setLoading(false);
    } catch {
      setProducts([]);
      setSelectedIds([]);
      setError(`${copy.title}加载失败，请稍后重试。`);
      setLoading(false);
    }
  }, [api, copy.title, mode]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const rightNode = useMemo(
    () => (
      <button
        className={styles.editButton}
        disabled={loading}
        type="button"
        onClick={() => {
          setIsEditing((value) => !value);
          setToast(false);
          setNotice("");
          setIsConfirmingDelete(false);
        }}
      >
        {isEditing ? "完成" : "编辑"}
        <span aria-hidden="true" className={styles.editIcon} />
      </button>
    ),
    [isEditing]
  );

  function toggleItem(id: string) {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    setToast(false);
    setNotice("");
    setIsConfirmingDelete(false);
  }

  function toggleAll() {
    setSelectedIds(allSelected ? [] : products.map((item) => item.id));
    setToast(false);
    setNotice("");
    setIsConfirmingDelete(false);
  }

  function requestDelete() {
    setToast(selectedCount === 0);
    setIsConfirmingDelete(selectedCount > 0);
  }

  async function confirmDelete() {
    if (selectedIds.length === 0) {
      setToast(true);
      setIsConfirmingDelete(false);
      return;
    }
    setIsDeleting(true);
    setError("");
    setNotice("");
    const result =
      mode === "favorites"
        ? await deleteFavoriteProducts(products, selectedIds, api.cancelFavoriteProduct)
        : await api.deleteFootprints(selectedIds);

    if (!result.success) {
      setError(result.message || "删除失败，请稍后重试。");
      setIsDeleting(false);
      setIsConfirmingDelete(false);
      return;
    }

    setNotice(mode === "favorites" ? "已取消收藏。" : "已删除足迹。");
    setIsConfirmingDelete(false);
    setIsDeleting(false);
    setIsEditing(false);
    await loadProducts();
  }

  function cancelEdit() {
    setIsEditing(false);
    setSelectedIds([]);
    setToast(false);
    setNotice("");
    setIsConfirmingDelete(false);
  }

  const emptyText = mode === "favorites" ? "暂无收藏商品" : "暂无足迹记录";
  const deletePrompt = mode === "favorites" ? "请选择需要取消收藏的商品" : "请选择需要删除的足迹";

  return (
    <StandardNavPage
      title={copy.title}
      backHref={copy.backHref}
      className={styles.screen}
      contentClassName={cn(styles.content, isEditing ? styles.editingContent : "")}
    >
      {error ? (
        <div className={styles.errorBox}>
          <p>{error}</p>
          <button type="button" onClick={() => void loadProducts()}>
            重新加载
          </button>
        </div>
      ) : null}
      {notice ? <p className={styles.notice}>{notice}</p> : null}
      {loading ? (
        <LoadingCollection />
      ) : products.length ? (
        <div className={styles.list} aria-label={copy.title}>
          {products.map((product) => (
            <CollectionProductCard
              isEditing={isEditing}
              isSelected={selectedIds.includes(product.id)}
              key={product.id}
              onToggle={() => toggleItem(product.id)}
              product={product}
            />
          ))}
        </div>
      ) : error ? null : (
        <EmptyState className={styles.emptyState} imageSize={150} text={emptyText} />
      )}
      {isEditing ? (
        <EditFooter
          allSelected={allSelected}
          onCancel={cancelEdit}
          onDelete={requestDelete}
          onToggleAll={toggleAll}
          selectedCount={selectedCount}
        />
      ) : null}
      {toast ? <div className={styles.toast}>{deletePrompt}</div> : null}
      {isConfirmingDelete ? (
        <DeleteConfirmDialog
          isDeleting={isDeleting}
          mode={mode}
          onCancel={() => setIsConfirmingDelete(false)}
          onConfirm={() => void confirmDelete()}
          selectedCount={selectedCount}
        />
      ) : null}
      <TopRightPortal node={rightNode} />
    </StandardNavPage>
  );
}

function CollectionProductCard({
  isEditing,
  isSelected,
  onToggle,
  product
}: {
  isEditing: boolean;
  isSelected: boolean;
  onToggle: () => void;
  product: CollectionProductView;
}) {
  return (
    <article className={cn(styles.productRow, isEditing ? styles.productRowEditing : "")}>
      {isEditing ? (
        <button
          aria-label={isSelected ? "取消选择商品" : "选择商品"}
          aria-pressed={isSelected}
          className={cn(styles.selectButton, isSelected ? styles.selected : "")}
          type="button"
          onClick={onToggle}
        />
      ) : null}
      <a
        className={styles.productCard}
        href={buildClientHref(product.detailHref)}
        onClick={(event) => {
          if (isEditing) {
            event.preventDefault();
          }
        }}
      >
        {product.imageUrl ? (
          <ProductImagePlaceholder decorative className={styles.productThumb} hideDefaultIcon>
            <img alt="" className={styles.productThumbImage} src={product.imageUrl} />
          </ProductImagePlaceholder>
        ) : (
          <ProductImagePlaceholder decorative className={styles.productThumb} />
        )}
        <div className={styles.productInfo}>
          <h2>{product.title}</h2>
          {product.tag ? <span className={styles.productTag}>{product.tag}</span> : null}
          {product.groupLabel ? <span className={styles.browseTime}>{product.groupLabel}</span> : null}
          <div className={styles.productMeta}>
            <p className={styles.price}>{product.priceText}</p>
            {product.salesText ? <span className={styles.sales}>{product.salesText}</span> : null}
          </div>
        </div>
      </a>
    </article>
  );
}

function EditFooter({
  allSelected,
  onCancel,
  onDelete,
  onToggleAll,
  selectedCount
}: {
  allSelected: boolean;
  onCancel: () => void;
  onDelete: () => void;
  onToggleAll: () => void;
  selectedCount: number;
}) {
  return (
    <div className={styles.editFooter}>
      <button className={styles.selectAll} type="button" onClick={onToggleAll}>
        <span className={cn(styles.selectButton, allSelected ? styles.selected : "")} aria-hidden="true" />
        全选
      </button>
      <strong aria-label={`已选${selectedCount}条`}>
        已选<span>{selectedCount}</span>条
      </strong>
      <button className={styles.cancelButton} type="button" onClick={onCancel}>
        取消
      </button>
      <button className={styles.deleteButton} type="button" onClick={onDelete}>
        删除
      </button>
    </div>
  );
}

function TopRightPortal({ node }: { node: ReactNode }) {
  return <div className={styles.rightNode}>{node}</div>;
}

function DeleteConfirmDialog({
  isDeleting,
  mode,
  onCancel,
  onConfirm,
  selectedCount
}: {
  isDeleting: boolean;
  mode: ProductCollectionMode;
  onCancel: () => void;
  onConfirm: () => void;
  selectedCount: number;
}) {
  const actionText = mode === "favorites" ? "取消收藏" : "删除";
  return (
    <div className={styles.confirmOverlay} role="presentation">
      <section className={styles.confirmDialog} role="dialog" aria-modal="true" aria-labelledby="collection-delete-title">
        <h2 id="collection-delete-title">确认{actionText}</h2>
        <p>确定{actionText}已选的 {selectedCount} 个商品吗？</p>
        <div className={styles.confirmActions}>
          <button className={styles.confirmCancelButton} disabled={isDeleting} type="button" onClick={onCancel}>
            取消
          </button>
          <button className={styles.confirmDeleteButton} disabled={isDeleting} type="button" onClick={onConfirm}>
            {isDeleting ? "处理中" : actionText}
          </button>
        </div>
      </section>
    </div>
  );
}

function LoadingCollection() {
  return (
    <div className={styles.list} aria-label="商品列表加载中">
      {Array.from({ length: 4 }).map((_, index) => (
        <article className={styles.productRow} key={index}>
          <div className={styles.productCard}>
            <span className={cn(styles.productThumb, styles.loadingBlock)} />
            <div className={styles.productInfo}>
              <span className={cn(styles.loadingLine, styles.loadingLineTitle)} />
              <span className={cn(styles.loadingLine, styles.loadingLineTag)} />
              <span className={cn(styles.loadingLine, styles.loadingLinePrice)} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

async function deleteFavoriteProducts(
  products: CollectionProductView[],
  selectedIds: string[],
  cancelFavoriteProduct: (prodId: string) => ReturnType<ReturnType<typeof createCollectionsApi>["cancelFavoriteProduct"]>
) {
  const selectedProdIds = products.filter((product) => selectedIds.includes(product.id)).map((product) => product.prodId);
  for (const prodId of selectedProdIds) {
    const result = await cancelFavoriteProduct(prodId);
    if (!result.success) {
      return result;
    }
  }
  return {
    data: {
      modules: { raw: null },
      view: { message: "已取消收藏。", ok: true }
    },
    requestId: "local-favorites-delete",
    success: true
  } as const;
}
