import Link from "next/link";

import { cn } from "../utils/cn";

export type UnderlineTabItem = {
  id: string;
  title: string;
  href: string;
};

export type UnderlineTabsProps = {
  activeId: string;
  ariaLabel?: string;
  className?: string;
  tabs: UnderlineTabItem[];
};

export function UnderlineTabs({ activeId, ariaLabel = "页面切换", className, tabs }: UnderlineTabsProps) {
  return (
    <nav aria-label={ariaLabel} className={cn("mx-auto flex h-7 w-[211px] items-start justify-between", className)} role="tablist">
      {tabs.map((tab) => {
        const active = tab.id === activeId;

        return (
          <Link
            key={tab.id}
            aria-current={active ? "page" : undefined}
            aria-selected={active}
            className={cn(
              "relative inline-flex h-7 items-start justify-center px-1.5 text-center leading-[22px]",
              active ? "text-[16px] font-semibold text-text-primary" : "text-[15px] font-medium text-text-tertiary"
            )}
            href={tab.href}
            role="tab"
          >
            {tab.title}
            {active ? <span aria-hidden="true" className="absolute bottom-0 left-1/2 h-[3px] w-6 -translate-x-1/2 rounded-pill bg-brand-action" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
