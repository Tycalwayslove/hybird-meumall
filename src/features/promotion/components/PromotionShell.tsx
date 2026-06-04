import Link from "next/link";
import type { ReactNode } from "react";

type PromotionShellProps = {
  children: ReactNode;
  background?: string;
  className?: string;
};

export function PromotionShell({ children, background = "#F7F9FB", className = "" }: PromotionShellProps) {
  return (
    <main className={`min-h-screen text-[#0F0F0F] ${className}`} style={{ background }}>
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden">{children}</div>
    </main>
  );
}

type PromotionNavProps = {
  title: string;
  trailing?: ReactNode;
  light?: boolean;
};

export function PromotionNav({ title, trailing, light = false }: PromotionNavProps) {
  return (
    <header
      className={`sticky top-0 z-30 flex h-[calc(env(safe-area-inset-top)+44px)] items-end justify-center px-4 pb-[9px] ${
        light ? "text-white" : "text-[#0F0F0F]"
      }`}
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
