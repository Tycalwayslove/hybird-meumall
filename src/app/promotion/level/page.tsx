import { redirect } from "next/navigation";

export default function PromotionLevelLegacyPage() {
  redirect("/promotion/benefits?level=v3");
}
