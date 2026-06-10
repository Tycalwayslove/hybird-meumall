"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { StandardNavPage, cn } from "@/design-system";

import type { CategoryPageData, CategorySection, PrimaryCategory } from "../types";
import styles from "./CategoryScreen.module.css";

type CategoryScreenProps = {
  data: CategoryPageData;
};

export function CategoryScreen({ data }: CategoryScreenProps) {
  const [activeCategoryId, setActiveCategoryId] = useState(data.activeCategoryId);
  const activeCategoryIndex = useMemo(() => {
    const index = data.primaryCategories.findIndex((category) => category.id === activeCategoryId);
    return index >= 0 ? index : 0;
  }, [activeCategoryId, data.primaryCategories]);
  const sections = useMemo(() => buildSectionsForActiveCategory(data.sections, activeCategoryIndex), [activeCategoryIndex, data.sections]);

  return (
    <StandardNavPage title="商品分类" backHref="/" className={styles.screen} contentClassName={styles.content}>
      <CategorySidebar categories={data.primaryCategories} activeCategoryId={activeCategoryId} onSelectCategory={setActiveCategoryId} />
      <CategoryContent activeCategoryIndex={activeCategoryIndex} sections={sections} />
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
              <Link className={styles.leafLink} href={`/category?leaf=${item.id}`} key={item.id}>
                <span aria-hidden="true" className={cn(styles.leafMedia, "aspect-square")} />
                <span className={styles.leafLabel}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function buildSectionsForActiveCategory(sections: CategorySection[], activeCategoryIndex: number) {
  if (activeCategoryIndex <= 1) {
    return sections;
  }

  return sections.map((section, sectionIndex) => ({
    ...section,
    id: `${section.id}-${activeCategoryIndex}`,
    title: sectionIndex === 0 ? `二级分类 ${activeCategoryIndex + 1}` : "二级分类",
    items: section.items.map((item, itemIndex) => ({
      ...item,
      id: `${item.id}-level-${activeCategoryIndex}`,
      label: itemIndex < 3 ? `三级分类 ${activeCategoryIndex + 1}` : item.label
    }))
  }));
}
