import Link from "next/link";

import type { PromotionEntry } from "../types";
import { PromotionIcon } from "./PromotionAssetPlaceholder";

export function PromotionQuickEntryGrid({ entries }: { entries: PromotionEntry[] }) {
  return (
    <section className="grid grid-cols-2 gap-[10px]">
      {entries.map((entry) => (
        <Link key={entry.id} className="flex h-[72px] items-center gap-3 rounded-card bg-fill-white px-[14px]" href={entry.href}>
          <PromotionIcon className="size-12" iconKey={entry.iconKey} />
          <span className="min-w-0">
            <span className="block truncate text-[17px] font-black leading-[18px] text-danger-strong">{entry.title}</span>
            <span className="mt-[6px] block truncate text-[13px] leading-[18px] text-text-quaternary">{entry.subtitle}</span>
          </span>
        </Link>
      ))}
    </section>
  );
}
