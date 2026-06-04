import Link from "next/link";

import { StandardNavPage } from "@/design-system";

import type { RankCenterData } from "../types";
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
                  <Link
                    key={item.id}
                    className="relative h-[104px] overflow-hidden rounded-card p-4"
                    href={item.href}
                    style={{ background: rankCenterCardTone[item.theme] }}
                  >
                    <span className="absolute -right-5 -top-5 size-20 rounded-full bg-fill-white/30" />
                    <span className="absolute bottom-[-20px] right-2 size-20 rotate-45 rounded-[20px] bg-fill-white/25" />
                    <span className="relative block text-[16px] font-black leading-5 text-text-primary">{item.title}</span>
                    <span className="relative mt-2 block text-[12px] leading-5 text-text-quaternary">{item.subtitle}</span>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </StandardNavPage>
  );
}
