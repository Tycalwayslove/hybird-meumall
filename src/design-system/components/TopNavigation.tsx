"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { createHybridNavigator } from "@/lib/navigation";

import { cn } from "../utils/cn";

type NavigationBackground = "solid" | "transparent";
type NavigationForeground = "dark" | "light";

export type TopNavigationProps = {
  title?: string;
  backHref?: string;
  backLabel?: string;
  background?: NavigationBackground;
  foreground?: NavigationForeground;
  rightText?: string;
  rightHref?: string;
  rightNode?: ReactNode;
  showBack?: boolean;
  className?: string;
  onBack?: () => void;
};

const backgroundClass: Record<NavigationBackground, string> = {
  solid: "bg-fill-white",
  transparent: "bg-transparent"
};

const foregroundClass: Record<NavigationForeground, string> = {
  dark: "text-text-primary",
  light: "text-text-inverse"
};

const sideSlotClass = "flex w-24 shrink-0 items-center";
const rightSlotClass = "flex max-w-[96px] truncate text-[14px] font-normal leading-5";

export function TopNavigation({
  title,
  backHref,
  backLabel = "返回",
  background = "solid",
  foreground = "dark",
  rightText,
  rightHref,
  rightNode,
  showBack = true,
  className,
  onBack
}: TopNavigationProps) {
  return (
    <div
      className={cn(
        "flex h-[var(--meu-nav-height)] items-center px-4",
        backgroundClass[background],
        foregroundClass[foreground],
        className
      )}
    >
      <div className={cn(sideSlotClass, "justify-start")}>
        {showBack ? <NavigationBackButton backHref={backHref} backLabel={backLabel} onBack={onBack} /> : null}
      </div>
      <div className="min-w-0 flex-1">
        {title ? <h1 className="min-w-0 truncate text-center text-[18px] font-semibold leading-[26px]">{title}</h1> : null}
      </div>
      <div className={cn(sideSlotClass, "justify-end")}>
        {rightNode !== null && rightNode !== undefined ? (
          <div className={rightSlotClass}>{rightNode}</div>
        ) : (
          <NavigationRightText rightHref={rightHref} rightText={rightText} />
        )}
      </div>
    </div>
  );
}

function NavigationBackButton({ backHref, backLabel, onBack }: { backHref?: string; backLabel: string; onBack?: () => void }) {
  const className = "flex size-11 items-center justify-center";
  const icon = <span aria-hidden="true" className="size-4 rotate-45 border-b-2 border-l-2 border-current" />;

  if (onBack) {
    return (
      <button aria-label={backLabel} className={className} type="button" onClick={onBack}>
        {icon}
      </button>
    );
  }

  if (backHref) {
    return (
      <button
        aria-label={backLabel}
        className={className}
        type="button"
        onClick={() => {
          createHybridNavigator().back({ fallbackHref: backHref });
        }}
      >
        {icon}
      </button>
    );
  }

  return null;
}

function NavigationRightText({ rightHref, rightText }: { rightHref?: string; rightText?: string }) {
  if (!rightText) {
    return null;
  }

  if (rightHref) {
    return (
      <Link className={rightSlotClass} href={rightHref}>
        {rightText}
      </Link>
    );
  }

  return <span className={rightSlotClass}>{rightText}</span>;
}
