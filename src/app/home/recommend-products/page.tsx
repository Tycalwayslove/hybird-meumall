import { HomeRecommendProductsScreen } from "@/features/home/components/HomeRecommendProductsScreen";
import { homeExperienceData } from "@/features/home/mock/home-page-data";

export default function HomeRecommendProductsPage() {
  return <HomeRecommendProductsScreen initialProducts={homeExperienceData.products} />;
}
