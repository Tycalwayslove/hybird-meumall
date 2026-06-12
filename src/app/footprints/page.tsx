import { ProductCollectionScreen } from "@/features/mine-secondary/components/ProductCollectionScreen";

type FootprintsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function FootprintsPage({ searchParams }: FootprintsPageProps) {
  const params = await searchParams;
  const edit = params?.edit;

  return <ProductCollectionScreen initialEditing={edit === "1"} mode="footprints" />;
}
