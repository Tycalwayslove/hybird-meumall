import type { CategoryPageData, CategorySection } from "./types";

const firstSectionItems = Array.from({ length: 12 }, (_, index) => ({
  id: `level-3-${index + 1}`,
  label: "三级分类"
}));

const secondSectionItems = Array.from({ length: 12 }, (_, index) => ({
  id: `level-3-more-${index + 1}`,
  label: "三级分类"
}));

const sections: CategorySection[] = [
  {
    id: "level-2-featured",
    title: "二级分类",
    items: firstSectionItems
  },
  {
    id: "level-2-more",
    title: "二级分类",
    items: secondSectionItems
  }
];

export const categoryPageData: CategoryPageData = {
  activeCategoryId: "level-1-active",
  primaryCategories: Array.from({ length: 13 }, (_, index) => ({
    id: index === 1 ? "level-1-active" : `level-1-${index + 1}`,
    label: "一级分类"
  })),
  sections
};
