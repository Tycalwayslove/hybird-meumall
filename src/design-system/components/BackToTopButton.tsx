"use client";

import type { MouseEvent, ReactNode } from "react";

import { cn } from "../utils/cn";

type BackToTopButtonProps = {
  ariaLabel?: string;
  className?: string;
  label?: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
};

export function BackToTopButton({
  ariaLabel = "回到顶部",
  className,
  label = "顶部",
  onClick
}: BackToTopButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }

    const scrollTarget = findScrollableAncestor(event.currentTarget);
    if (scrollTarget) {
      scrollTarget.scrollTo({
        behavior: "smooth",
        top: 0
      });
      return;
    }

    window.scrollTo({
      behavior: "smooth",
      top: 0
    });
  }

  return (
    <button
      aria-label={ariaLabel}
      className={cn(
        "fixed bottom-[calc(env(safe-area-inset-bottom)+72px)] right-[max(12px,env(safe-area-inset-right))] z-[58] inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#dbe5d1] bg-fill-white text-[12px] font-extrabold leading-[14px] text-[#111111] shadow-[0_10px_24px_rgb(15_23_42_/_16%)]",
        className
      )}
      data-back-to-top-button="true"
      type="button"
      onClick={handleClick}
    >
      {label}
    </button>
  );
}

function findScrollableAncestor(element: HTMLElement) {
  let current = element.parentElement;
  while (current) {
    const style = window.getComputedStyle(current);
    if ((style.overflowY === "auto" || style.overflowY === "scroll") && current.scrollHeight > current.clientHeight) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}
