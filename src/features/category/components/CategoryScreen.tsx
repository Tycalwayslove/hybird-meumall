"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EmptyState, Skeleton, StandardNavPage, cn } from "@/design-system";
import { createH5Client } from "@/lib/http";

import { createCategoryApi, type CategoryApi } from "../api";
import type { CategoryPageData, CategorySection, PrimaryCategory } from "../types";
import styles from "./CategoryScreen.module.css";

type CategoryScreenProps = {
  api?: Pick<CategoryApi, "getCategoryList">;
  initialData?: CategoryPageData;
};

export function CategoryScreen({ api, initialData }: CategoryScreenProps) {
  const categoryApi = useMemo(() => api ?? createCategoryApi(createH5Client()), [api]);
  const [state, setState] = useState<{
    data?: CategoryPageData;
    status: "loading" | "success" | "empty" | "error";
  }>(() => {
    if (initialData && initialData.primaryCategories.length > 0) {
      return { data: initialData, status: "success" };
    }
    return { status: "loading" };
  });
  const [activeCategoryId, setActiveCategoryId] = useState(initialData?.activeCategoryId ?? "");
  const data = state.data;
  const activeCategoryIndex = useMemo(() => {
    const index = data?.primaryCategories.findIndex((category) => category.id === activeCategoryId) ?? -1;
    return index >= 0 ? index : 0;
  }, [activeCategoryId, data?.primaryCategories]);
  const sections = useMemo(() => data?.categorySectionsByPrimaryId[activeCategoryId] ?? [], [activeCategoryId, data?.categorySectionsByPrimaryId]);

  useEffect(() => {
    if (initialData) {
      return;
    }

    let disposed = false;
    categoryApi.getCategoryList()
      .then((result) => {
        if (disposed) {
          return;
        }
        if (!result.success) {
          setState({ status: "error" });
          return;
        }
        const nextData = result.data.view;
        if (nextData.primaryCategories.length === 0) {
          setState({ data: nextData, status: "empty" });
          return;
        }
        setActiveCategoryId(nextData.activeCategoryId);
        setState({ data: nextData, status: "success" });
      })
      .catch(() => {
        if (!disposed) {
          setState({ status: "error" });
        }
      });

    return () => {
      disposed = true;
    };
  }, [categoryApi, initialData]);

  const content = (() => {
    if (state.status === "loading") {
      return <CategorySkeleton />;
    }
    if (state.status === "empty") {
      return <CategoryEmpty text="暂无分类" />;
    }
    if (state.status === "error") {
      return <CategoryEmpty text="分类加载失败" />;
    }
    if (!data) {
      return <CategorySkeleton />;
    }

    return (
      <>
        <CategorySidebar categories={data.primaryCategories} activeCategoryId={activeCategoryId} onSelectCategory={setActiveCategoryId} />
        <CategoryContent activeCategoryIndex={activeCategoryIndex} sections={sections} />
      </>
    );
  })();

  return (
    <StandardNavPage title="商品分类" backHref="/" className={styles.screen} contentClassName={styles.content}>
      {content}
    </StandardNavPage>
  );
}

function CategorySidebar({
  categories,
  activeCategoryId,
  onSelectCategory
}: {
  categories: PrimaryCategory[];
  activeCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
}) {
  return (
    <nav className={styles.sidebar} aria-label="一级分类">
      {categories.map((category) => {
        const isActive = category.id === activeCategoryId;

        return (
          <button
            aria-current={isActive ? "page" : undefined}
            className={cn(styles.categoryLink, isActive && styles.categoryLinkActive)}
            key={category.id}
            type="button"
            onClick={() => onSelectCategory(category.id)}
          >
            {isActive ? <span aria-hidden="true" className={cn(styles.activeIndicator, "bg-brand-action")} /> : null}
            <span>{category.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function CategoryContent({ activeCategoryIndex, sections }: { activeCategoryIndex: number; sections: CategorySection[] }) {
  return (
    <section key={activeCategoryIndex} className={styles.main} aria-label="分类内容">
      {sections.map((section) => (
        <div className={styles.section} id={section.id} key={section.id}>
          <h2 className={styles.sectionTitle}>{section.title}</h2>
          <div className={styles.leafGrid}>
            {section.items.map((item) => (
              <Link className={styles.leafLink} href={item.href} key={item.id}>
                <span
                  aria-hidden="true"
                  className={cn(styles.leafMedia, "aspect-square")}
                  style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})` } : undefined}
                />
                <span className={styles.leafLabel}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function CategorySkeleton() {
  return (
    <>
      <aside className={styles.sidebar} data-category-skeleton="true" aria-hidden="true">
        {Array.from({ length: 9 }, (_, index) => (
          <Skeleton className={styles.categorySkeletonItem} key={index} />
        ))}
      </aside>
      <section className={styles.main} aria-label="分类内容">
        {Array.from({ length: 2 }, (_, sectionIndex) => (
          <div className={styles.section} key={sectionIndex}>
            <Skeleton className={styles.sectionTitleSkeleton} />
            <div className={styles.leafGrid}>
              {Array.from({ length: 6 }, (_, itemIndex) => (
                <div className={styles.leafSkeleton} key={itemIndex}>
                  <Skeleton className={styles.leafMediaSkeleton} />
                  <Skeleton className={styles.leafLabelSkeleton} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

function CategoryEmpty({ text }: { text: string }) {
  return (
    <div className={styles.emptyWrap}>
      <EmptyState imageSize={138} text={text} textColor="rgb(var(--mm-color-text-placeholder))" textSize={14} />
    </div>
  );
}
