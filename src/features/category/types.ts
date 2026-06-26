export type CategoryLeaf = {
  href: string;
  id: string;
  imageUrl?: string;
  label: string;
};

export type CategorySection = {
  id: string;
  title: string;
  items: CategoryLeaf[];
};

export type PrimaryCategory = {
  id: string;
  label: string;
};

export type CategoryPageData = {
  activeCategoryId: string;
  categorySectionsByPrimaryId: Record<string, CategorySection[]>;
  primaryCategories: PrimaryCategory[];
};
