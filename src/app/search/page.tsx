import { SearchScreen } from "@/features/search/components/SearchScreen";
import { searchPageData } from "@/features/search/mock/search-page-data";

export default function SearchPage() {
  return <SearchScreen data={searchPageData} />;
}
