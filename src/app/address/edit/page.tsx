import { AddressEditScreen } from "@/features/mine-secondary/components/AddressScreens";

type AddressEditPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AddressEditPage({ searchParams }: AddressEditPageProps) {
  const params = await searchParams;
  const addrId = normalizeParam(params?.addrId);

  return <AddressEditScreen addrId={addrId} mode={addrId ? "edit" : "add"} />;
}

function normalizeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
