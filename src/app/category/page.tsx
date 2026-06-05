import { categoryPageData } from "@/features/category/category-data";
import { CategoryScreen } from "@/features/category/components/CategoryScreen";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function CategoryPage() {
  return <CategoryScreen data={categoryPageData} />;
}
