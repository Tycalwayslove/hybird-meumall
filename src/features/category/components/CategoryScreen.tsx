import Link from "next/link";

import { StandardNavPage, cn } from "@/design-system";

import type { CategoryPageData, CategorySection, PrimaryCategory } from "../types";
import styles from "./CategoryScreen.module.css";

type CategoryScreenProps = {
  data: CategoryPageData;
};

export function CategoryScreen({ data }: CategoryScreenProps) {
  return (
    <StandardNavPage title="商品分类" backHref="/" className={styles.screen} contentClassName={styles.content}>
      <CategorySidebar categories={data.primaryCategories} activeCategoryId={data.activeCategoryId} />
      <CategoryContent sections={data.sections} />
    </StandardNavPage>
  );
}

function CategorySidebar({
  categories,
  activeCategoryId
}: {
  categories: PrimaryCategory[];
  activeCategoryId: string;
}) {
  return (
    <nav className={styles.sidebar} aria-label="一级分类">
      {categories.map((category) => {
        const isActive = category.id === activeCategoryId;

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={cn(styles.categoryLink, isActive && styles.categoryLinkActive)}
            href={`#${category.id}`}
            key={category.id}
          >
            {isActive ? <span aria-hidden="true" className={cn(styles.activeIndicator, "bg-brand-action")} /> : null}
            <span>{category.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function CategoryContent({ sections }: { sections: CategorySection[] }) {
  return (
    <section className={styles.main} aria-label="分类内容">
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
