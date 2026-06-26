import { SearchScreen } from "@/features/search/components/SearchScreen";
import { searchPageData } from "@/features/search/mock/search-page-data";
import type { SearchFilterState } from "@/features/search/types";

type SearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const q = normalizeParam(params?.q);
  const categoryId = normalizeParam(params?.categoryId);
  const clear = normalizeParam(params?.clear);
  const filter = normalizeParam(params?.filter) as SearchFilterState | undefined;
  const data = {
    ...searchPageData,
    activeRankingTab: "",
    categories: [],
    historyKeywords: [],
    hotKeywords: [],
    products: [],
    rankingNotice: "",
    rankingTabs: [],
    resultProducts: []
  };

  return <SearchScreen categoryId={categoryId} data={data} filter={filter ?? "none"} initialShowClearDialog={clear === "1"} query={q} />;
}

function normalizeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
