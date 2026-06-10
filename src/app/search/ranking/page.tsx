import { SearchRankingScreen } from "@/features/search/components/SearchScreen";
import { searchPageData } from "@/features/search/mock/search-page-data";

export default function SearchRankingPage() {
  return <SearchRankingScreen data={searchPageData} />;
}
