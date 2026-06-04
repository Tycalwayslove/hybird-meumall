import Link from "next/link";

import { Section } from "@/design-system";

import type { PromotionEntry } from "../types";
import { PromotionIcon } from "./PromotionAssetPlaceholder";

export function PromotionToolGrid({ tools }: { tools: PromotionEntry[] }) {
  return (
    <Section contentClassName="px-[18px] pb-[18px]" title="推广工具">
      <div className="mt-[18px] grid grid-cols-4 gap-4">
        {tools.map((tool) => (
          <Link key={tool.id} className="flex min-w-0 flex-col items-center gap-1" href={tool.href}>
            <PromotionIcon className="size-[30px] rounded-[10px]" iconKey={tool.iconKey} />
            <span className="whitespace-nowrap text-[12px] font-medium leading-5 text-text-quaternary">{tool.title}</span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
