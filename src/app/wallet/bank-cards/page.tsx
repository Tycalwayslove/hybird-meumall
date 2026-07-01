import { BankCardsScreen } from "@/features/mine-secondary/components/BankCardsScreen";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type WalletBankCardsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function WalletBankCardsPage({ searchParams }: WalletBankCardsPageProps) {
  const params = await searchParams;
  const notice = params?.notice === "add-success" ? "添加成功" : "";

  return <BankCardsScreen initialNotice={notice} />;
}
