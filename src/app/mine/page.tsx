import { MineScreen } from "@/features/mine/components/MineScreen";
import { minePageData } from "@/features/mine/mock/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function MinePage() {
  return <MineScreen data={minePageData} />;
}
