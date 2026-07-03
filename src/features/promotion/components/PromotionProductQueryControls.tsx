"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import { cn } from "@/design-system";
import { createCategoryApi } from "@/features/category/api";
import type { CategoryListTreeVO } from "@/features/category/server/category-real-service";
import { localAssetUrl } from "@/lib/assets";
import { createH5Client } from "@/lib/http";

import {
  getNextPromotionProductOrderBy,
  parsePromotionProductOrderBy,
  PROMOTION_PRODUCT_ORDER_FIELDS,
  type PromotionProductQueryValue
} from "../promotion-product-query";
import styles from "./PromotionProductQueryControls.module.css";

type CategoryNode = {
  children: CategoryNode[];
  id: string;
  label: string;
};

type PromotionProductQueryControlsProps = {
  className?: string;
  value: PromotionProductQueryValue;
  onChange: (value: PromotionProductQueryValue) => void;
};

export function PromotionProductQueryControls({ className, onChange, value }: PromotionProductQueryControlsProps) {
  const [keywordInput, setKeywordInput] = useState(value.keyword);
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [categoryStatus, setCategoryStatus] = useState<"idle" | "loading" | "error">("loading");
  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false);
  const selectedCategoryPath = useMemo(() => findCategoryPath(categoryTree, value.categoryId), [categoryTree, value.categoryId]);
  const [pendingCategoryPath, setPendingCategoryPath] = useState<string[]>([]);
  const pendingLevels = useMemo(() => buildCategoryLevels(categoryTree, pendingCategoryPath), [categoryTree, pendingCategoryPath]);
  const sortState = parsePromotionProductOrderBy(value.orderBy);

  useEffect(() => {
    let disposed = false;
    const api = createCategoryApi(createH5Client());

    api.getCategoryList()
      .then((result) => {
        if (disposed) {
          return;
        }
        if (!result.success) {
          setCategoryStatus("error");
          return;
        }
        setCategoryTree(mapCategoryNodes(result.data.modules.categories));
        setCategoryStatus("idle");
      })
      .catch(() => {
        if (!disposed) {
          setCategoryStatus("error");
        }
      });

    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    if (!isCategoryPanelOpen || typeof document === "undefined") {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isCategoryPanelOpen]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onChange({ ...value, keyword: keywordInput.trim() });
  }

  function toggleCategoryPanel() {
    setIsCategoryPanelOpen((current) => {
      const next = !current;
      if (next) {
        setPendingCategoryPath(selectedCategoryPath.map((category) => category.id));
      }
      return next;
    });
  }

  function selectCategory(category: CategoryNode, levelIndex: number) {
    setPendingCategoryPath((current) => [...current.slice(0, levelIndex), category.id]);
  }

  function resetCategory() {
    setPendingCategoryPath([]);
    setIsCategoryPanelOpen(false);
    onChange({ ...value, categoryId: undefined });
  }

  function confirmCategory() {
    setIsCategoryPanelOpen(false);
    onChange({ ...value, categoryId: pendingCategoryPath[pendingCategoryPath.length - 1] });
  }

  function selectSort(field: (typeof PROMOTION_PRODUCT_ORDER_FIELDS)[number]["field"]) {
    setIsCategoryPanelOpen(false);
    onChange({ ...value, orderBy: getNextPromotionProductOrderBy(value.orderBy, field) });
  }

  return (
    <section className={cn(styles.controls, className)}>
      {isCategoryPanelOpen ? <button aria-label="关闭分类筛选" className={styles.categoryOverlay} type="button" onClick={() => setIsCategoryPanelOpen(false)} /> : null}
      <form className={styles.searchBox} role="search" onSubmit={submitSearch}>
        <span aria-hidden="true" className={styles.searchIcon} style={{ backgroundImage: `url(${localAssetUrl("common.icon.search")})` }} />
        <input name="keyword" placeholder="请输入商品名称搜索" type="search" value={keywordInput} onChange={(event) => setKeywordInput(event.target.value)} />
        <button type="submit">搜索</button>
      </form>
      <div className={styles.filterWrap}>
        <nav aria-label="推广商品筛选排序" className={styles.filterScroller}>
          <button
            aria-expanded={isCategoryPanelOpen}
            aria-pressed={isCategoryPanelOpen || Boolean(value.categoryId)}
            className={cn(styles.filterButton, (isCategoryPanelOpen || value.categoryId) && styles.filterButtonActive)}
            type="button"
            onClick={toggleCategoryPanel}
          >
            <span>{selectedCategoryPath.length > 0 ? selectedCategoryPath[selectedCategoryPath.length - 1].label : "商品分类"}</span>
            <span aria-hidden="true" className={cn(styles.caret, isCategoryPanelOpen && styles.caretOpen)} />
          </button>
          {PROMOTION_PRODUCT_ORDER_FIELDS.map((item) => (
            <button
              aria-pressed={sortState.field === item.field}
              className={cn(styles.filterButton, sortState.field === item.field && styles.filterButtonActive)}
              key={item.field}
              type="button"
              onClick={() => selectSort(item.field)}
            >
              <span>{item.label}</span>
              <span aria-hidden="true" className={styles.sortArrows}>
                <span className={cn(styles.sortArrow, sortState.field === item.field && sortState.direction === "asc" && styles.sortArrowActive)}>▲</span>
                <span className={cn(styles.sortArrow, sortState.field === item.field && sortState.direction === "desc" && styles.sortArrowActive)}>▼</span>
              </span>
            </button>
          ))}
        </nav>
        {isCategoryPanelOpen ? (
          <div className={styles.categoryPanel}>
            {categoryStatus === "loading" ? <p className={styles.categoryMessage}>分类加载中...</p> : null}
            {categoryStatus === "error" ? <p className={styles.categoryMessage}>分类加载失败</p> : null}
            {categoryStatus === "idle" && pendingLevels.length === 0 ? <p className={styles.categoryMessage}>暂无分类</p> : null}
            {categoryStatus === "idle" && pendingLevels.length > 0 ? (
              <div className={styles.categoryScroller}>
                {pendingLevels.map((level, levelIndex) => (
                  <div className={styles.categoryLevel} key={levelIndex}>
                    <p className={styles.categoryLevelTitle}>{getCategoryLevelTitle(levelIndex)}</p>
                    {level.map((category) => {
                      const selected = pendingCategoryPath[levelIndex] === category.id;
                      return (
                        <button
                          aria-current={selected ? "true" : undefined}
                          className={cn(styles.categoryOption, selected && styles.categoryOptionActive)}
                          key={category.id}
                          type="button"
                          onClick={() => selectCategory(category, levelIndex)}
                        >
                          <span>{category.label}</span>
                          {category.children.length > 0 ? <span aria-hidden="true" className={styles.categoryOptionArrow}>›</span> : null}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ) : null}
            <div className={styles.categoryActions}>
              <button className={styles.categoryReset} type="button" onClick={resetCategory}>重置</button>
              <button className={styles.categoryConfirm} type="button" onClick={confirmCategory}>确认</button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function mapCategoryNodes(categories: CategoryListTreeVO[] | undefined): CategoryNode[] {
  return (categories ?? [])
    .filter((category) => category.status !== 0 && category.categoryId !== undefined && category.categoryName)
    .sort((left, right) => normalizeSeq(left.seq) - normalizeSeq(right.seq))
    .map((category) => ({
      children: mapCategoryNodes(category.children),
      id: String(category.categoryId),
      label: category.categoryName ?? ""
    }));
}

function buildCategoryLevels(tree: CategoryNode[], path: string[]) {
  if (tree.length === 0) {
    return [];
  }

  const levels: CategoryNode[][] = [tree];
  let currentLevel = tree;
  for (const categoryId of path) {
    const current = currentLevel.find((category) => category.id === categoryId);
    if (!current || current.children.length === 0) {
      break;
    }
    levels.push(current.children);
    currentLevel = current.children;
  }
  return levels;
}

function findCategoryPath(tree: CategoryNode[], categoryId: string | undefined): CategoryNode[] {
  if (!categoryId) {
    return [];
  }
  for (const category of tree) {
    if (category.id === categoryId) {
      return [category];
    }
    const childPath = findCategoryPath(category.children, categoryId);
    if (childPath.length > 0) {
      return [category, ...childPath];
    }
  }
  return [];
}

function getCategoryLevelTitle(levelIndex: number) {
  return levelIndex === 0 ? "一级类目" : levelIndex === 1 ? "二级类目" : "三级类目";
}

function normalizeSeq(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : Number.MAX_SAFE_INTEGER;
}
