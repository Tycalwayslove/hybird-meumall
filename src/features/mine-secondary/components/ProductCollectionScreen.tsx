"use client";

import { useMemo, useState, type ReactNode } from "react";

import { StandardNavPage, cn } from "@/design-system";

import { collectionProducts, type CollectionProduct } from "../mock/data";
import { ProductThumb } from "./ProductThumb";
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
  const [products, setProducts] = useState(collectionProducts);
  const [selectedIds, setSelectedIds] = useState<string[]>(initialEditing ? collectionProducts.map((item) => item.id) : []);
  const [toast, setToast] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const copy = pageCopy[mode];
  const selectedCount = selectedIds.length;
  const allSelected = selectedCount === products.length && products.length > 0;

  const rightNode = useMemo(
    () => (
      <button
        className={styles.editButton}
        type="button"
        onClick={() => {
          setIsEditing((value) => !value);
          setToast(false);
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
    setIsConfirmingDelete(false);
  }

  function toggleAll() {
    setSelectedIds(allSelected ? [] : products.map((item) => item.id));
    setToast(false);
    setIsConfirmingDelete(false);
  }

  function requestDelete() {
    setToast(selectedCount === 0);
    setIsConfirmingDelete(selectedCount > 0);
  }

  function confirmDelete() {
    setProducts((current) => current.filter((item) => !selectedIds.includes(item.id)));
    setSelectedIds([]);
    setIsConfirmingDelete(false);
  }

  function cancelEdit() {
    setIsEditing(false);
    setSelectedIds([]);
    setToast(false);
    setIsConfirmingDelete(false);
  }

  return (
    <StandardNavPage
      title={copy.title}
      backHref={copy.backHref}
      className={styles.screen}
      contentClassName={cn(styles.content, isEditing ? styles.editingContent : "")}
    >
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
      {isEditing ? (
        <EditFooter
          allSelected={allSelected}
          onCancel={cancelEdit}
          onDelete={requestDelete}
          onToggleAll={toggleAll}
          selectedCount={selectedCount}
        />
      ) : null}
      {toast ? <div className={styles.toast}>请选择需要删除的商品</div> : null}
      {isConfirmingDelete ? (
        <DeleteConfirmDialog onCancel={() => setIsConfirmingDelete(false)} onConfirm={confirmDelete} selectedCount={selectedCount} />
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
  product: CollectionProduct;
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
      <div className={styles.productCard}>
        <ProductThumb />
        <div className={styles.productInfo}>
          <h2>{product.title}</h2>
          <span className={styles.productTag}>{product.tag}</span>
          <div className={styles.productMeta}>
            <p className={styles.price}>
              <span>¥</span>
              {product.price}
            </p>
            {product.originalPrice ? <del>¥{product.originalPrice}</del> : null}
            <span className={styles.sales}>{product.sales}</span>
          </div>
        </div>
      </div>
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
  onCancel,
  onConfirm,
  selectedCount
}: {
  onCancel: () => void;
  onConfirm: () => void;
  selectedCount: number;
}) {
  return (
    <div className={styles.confirmOverlay} role="presentation">
      <section className={styles.confirmDialog} role="dialog" aria-modal="true" aria-labelledby="collection-delete-title">
        <h2 id="collection-delete-title">确认删除</h2>
        <p>确定删除已选的 {selectedCount} 个商品吗？</p>
        <div className={styles.confirmActions}>
          <button className={styles.confirmCancelButton} type="button" onClick={onCancel}>
            取消
          </button>
          <button className={styles.confirmDeleteButton} type="button" onClick={onConfirm}>
            删除
          </button>
        </div>
      </section>
    </div>
  );
}
