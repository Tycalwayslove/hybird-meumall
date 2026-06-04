import type { CSSProperties } from "react";

export const defaultNavHeight = 44;

export type NavigationCssVars = CSSProperties & {
  "--meu-status-bar-height": string;
  "--meu-nav-height": string;
  "--meu-top-bar-height": string;
};

export function parseNativeStatusHeight(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const height = typeof value === "number" ? value : Number(value);
  return Number.isFinite(height) && height >= 0 ? height : 0;
}

export function formatStatusBarCssVars(
  statusHeight: string | number | null | undefined,
  navHeight = defaultNavHeight
): NavigationCssVars {
  const safeStatusHeight = parseNativeStatusHeight(statusHeight);
  const safeNavHeight = parseNativeStatusHeight(navHeight);

  return {
    "--meu-status-bar-height": `${safeStatusHeight}px`,
    "--meu-nav-height": `${safeNavHeight}px`,
    "--meu-top-bar-height": "calc(var(--meu-status-bar-height) + var(--meu-nav-height))"
  };
}
