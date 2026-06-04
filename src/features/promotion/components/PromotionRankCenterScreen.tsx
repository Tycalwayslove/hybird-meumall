import Link from "next/link";

import type { RankCenterData, RankCenterCard } from "../types";
import { PromotionEmptyState } from "./PromotionStates";
import { PromotionNav, PromotionShell } from "./PromotionShell";

const cardTone: Record<RankCenterCard["theme"], string> = {
  blue: "linear-gradient(135deg, #E5F2FF 0%, #B9DDFF 100%)",
  gold: "linear-gradient(135deg, #FFF3D4 0%, #FFD48B 100%)",
  pink: "linear-gradient(135deg, #FFEAF2 0%, #FFBAD3 100%)",
  green: "linear-gradient(135deg, #E9FFF4 0%, #B9F1D0 100%)",
  purple: "linear-gradient(135deg, #F1E8FF 0%, #D6BFFF 100%)"
};

export function PromotionRankCenterScreen({ data }: { data: RankCenterData }) {
  return (
    <PromotionShell background="#F7F9FB">
      <PromotionNav title="榜单中心" />
      <div className="space-y-5 px-4 pb-8 pt-3">
        {data.sections.length === 0 ? (
          <PromotionEmptyState title="暂无榜单" description="榜单配置后将在这里展示" />
        ) : (
          data.sections.map((section) => (
            <section key={section.id}>
              <h2 className="mb-3 text-[18px] font-black leading-6 text-[#0F0F0F]">{section.title}</h2>
              <div className="grid grid-cols-2 gap-3">
                {section.items.map((item) => (
                  <Link
                    key={item.id}
                    className="relative h-[104px] overflow-hidden rounded-[12px] p-4 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                    href={item.href}
                    style={{ background: cardTone[item.theme] }}
                  >
                    <span className="absolute -right-5 -top-5 size-20 rounded-full bg-white/30" />
                    <span className="absolute bottom-[-20px] right-2 size-20 rotate-45 rounded-[20px] bg-white/25" />
                    <span className="relative block text-[16px] font-black leading-5 text-[#0F0F0F]">{item.title}</span>
                    <span className="relative mt-2 block text-[12px] leading-5 text-[#575757]">{item.subtitle}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </PromotionShell>
  );
}
