import Link from "next/link";

import { StandardNavPage } from "@/design-system";

import type { RankCenterCard, RankCenterData } from "../types";
import { rankCenterCardTone } from "../theme/promotion-page-theme";
import { PromotionEmptyState } from "./PromotionStates";

export function PromotionRankCenterScreen({ data }: { data: RankCenterData }) {
  return (
    <StandardNavPage backHref="/promotion" title="榜单中心">
      <div className="space-y-5 px-4 pb-8 pt-3">
        {data.sections.length === 0 ? (
          <PromotionEmptyState title="暂无榜单" description="榜单配置后将在这里展示" />
        ) : (
          data.sections.map((section) => (
            <section key={section.id}>
              <h2 className="mb-3 text-[18px] font-black leading-6 text-text-primary">{section.title}</h2>
              <div className="grid grid-cols-2 gap-3">
                {section.items.map((item) => (
                  <RankCenterItem key={item.id} item={item} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </StandardNavPage>
  );
}

function RankCenterItem({ item }: { item: RankCenterCard }) {
  const content = (
    <>
      <span className="absolute -right-5 -top-5 size-20 rounded-full bg-fill-white/30" />
      <span className="absolute bottom-[-20px] right-2 size-20 rotate-45 rounded-[20px] bg-fill-white/25" />
      <span className="relative block text-[16px] font-black leading-5 text-text-primary">{item.title}</span>
      <span className="relative mt-2 block text-[12px] leading-5 text-text-quaternary">{item.subtitle}</span>
    </>
  );
  const className = item.disabled
    ? "relative h-[104px] overflow-hidden rounded-card p-4 opacity-45 grayscale"
    : "relative h-[104px] overflow-hidden rounded-card p-4 transition-transform active:scale-[0.98]";
  const style = { background: item.disabled ? "linear-gradient(135deg, #F2F4F7 0%, #E6E8EC 100%)" : rankCenterCardTone[item.theme] };

  if (item.disabled) {
    return (
      <div aria-disabled="true" className={className} role="link" style={style}>
        {content}
      </div>
    );
  }

  return (
    <Link className={className} href={item.href} style={style}>
      {content}
    </Link>
  );
}
