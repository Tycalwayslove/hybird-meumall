import { AddressListScreen } from "@/features/mine-secondary/components/AddressScreens";

type AddressPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AddressPage({ searchParams }: AddressPageProps) {
  const params = await searchParams;
  const select = normalizeParam(params?.select);
  const state = normalizeParam(params?.state);
  const productId = normalizeParam(params?.productId);
  const quantity = normalizeParam(params?.quantity);
  const skuId = normalizeParam(params?.skuId);

  return (
    <AddressListScreen
      mode={select === "1" ? "select" : "manage"}
      returnParams={{ productId, quantity, skuId }}
      state={state === "empty" ? "empty" : "normal"}
    />
  );
}

function normalizeParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}
