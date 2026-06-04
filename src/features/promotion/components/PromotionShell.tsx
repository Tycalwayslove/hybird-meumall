import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { AppScreen, cn } from "@/design-system";

type PromotionShellProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function PromotionShell({ children, className, style }: PromotionShellProps) {
  return <AppScreen className={className} style={style}>{children}</AppScreen>;
}

type PromotionNavProps = {
  title: string;
  trailing?: ReactNode;
  light?: boolean;
};

export function PromotionNav({ title, trailing, light = false }: PromotionNavProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-[calc(env(safe-area-inset-top)+44px)] items-end justify-center px-4 pb-[9px]",
        light ? "text-text-inverse" : "text-text-primary"
      )}
    >
      <Link
        aria-label="返回推广首页"
        className="absolute bottom-[13px] left-4 size-4 rotate-45 border-b-2 border-l-2"
        href="/promotion"
      />
      <h1 className="text-[18px] font-semibold leading-[26px]">{title}</h1>
      {trailing ? <div className="absolute bottom-[11px] right-4">{trailing}</div> : null}
    </header>
  );
}
