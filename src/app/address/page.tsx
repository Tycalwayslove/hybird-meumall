import { AddressListScreen } from "@/features/mine-secondary/components/AddressScreens";
import { parseAddressFlowContext } from "@/features/mine-secondary/address-flow";

type AddressPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AddressPage({ searchParams }: AddressPageProps) {
  const params = await searchParams;
  const state = normalizeParam(params?.state);
  const flowContext = parseAddressFlowContext(params ?? {});

  return (
    <AddressListScreen
      flowContext={flowContext}
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
