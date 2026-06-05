export type CategoryLeaf = {
  id: string;
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
  primaryCategories: PrimaryCategory[];
  sections: CategorySection[];
};
