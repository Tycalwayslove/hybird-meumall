import { SearchRankingScreen } from "@/features/search/components/SearchScreen";
import { searchPageData } from "@/features/search/mock/search-page-data";

type SearchRankingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchRankingPage({ searchParams }: SearchRankingPageProps) {
  const params = await searchParams;
  const categoryId = normalizeParam(params?.categoryId);
  const rankType = normalizeRankType(normalizeParam(params?.rankType));

  return <SearchRankingScreen data={{ ...searchPageData, activeRankingTab: "", products: [], rankingNotice: "", rankingTabs: [] }} initialCategoryId={categoryId} initialRankType={rankType} />;
}

function normalizeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function normalizeRankType(value: string): 1 | 2 | undefined {
  return value === "1" || value === "2" ? Number(value) as 1 | 2 : undefined;
}
