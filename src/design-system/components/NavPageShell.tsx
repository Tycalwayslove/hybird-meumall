import type { ReactNode } from "react";

import { cn } from "../utils/cn";
import { AppScreen } from "./AppScreen";
import { TopNavigation, type TopNavigationProps } from "./TopNavigation";

type BaseNavPageProps = {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export type StandardNavPageProps = BaseNavPageProps &
  Pick<TopNavigationProps, "title" | "backHref">;

export type TransparentNavPageProps = BaseNavPageProps &
  Pick<TopNavigationProps, "title" | "backHref" | "foreground">;

export type TransparentActionNavPageProps = Omit<TransparentNavPageProps, "foreground"> &
  Pick<TopNavigationProps, "rightText" | "rightHref" | "rightNode" | "foreground">;

type FixedTransparentNavShellProps = BaseNavPageProps &
  Pick<TopNavigationProps, "title" | "backHref" | "foreground" | "rightText" | "rightHref" | "rightNode">;

function StatusBarSpacer() {
  return <div aria-hidden="true" className="h-[var(--meu-status-bar-height)] shrink-0" />;
}

export function StandardNavPage({ title, backHref, children, className, contentClassName }: StandardNavPageProps) {
  return (
    <AppScreen className={className} contentClassName="flex h-screen min-h-screen flex-col">
      <header className="shrink-0 bg-fill-white">
        <StatusBarSpacer />
        <TopNavigation title={title} backHref={backHref} background="solid" foreground="dark" />
      </header>
      <main className={cn("min-h-0 flex-1 overflow-y-auto", contentClassName)}>{children}</main>
    </AppScreen>
  );
}

export function TransparentNavPage({
  title,
  backHref,
  foreground = "dark",
  children,
  className,
  contentClassName
}: TransparentNavPageProps) {
  return (
    <FixedTransparentNavShell
      title={title}
      backHref={backHref}
      foreground={foreground}
      className={className}
      contentClassName={contentClassName}
    >
      {children}
    </FixedTransparentNavShell>
  );
}

export function TransparentActionNavPage({
  foreground = "light",
  rightText,
  rightHref,
  rightNode,
  ...props
}: TransparentActionNavPageProps) {
  return (
    <FixedTransparentNavShell
      {...props}
      foreground={foreground}
      rightHref={rightHref}
      rightNode={rightNode}
      rightText={rightText}
    />
  );
}

function FixedTransparentNavShell({
  title,
  backHref,
  foreground,
  rightText,
  rightHref,
  rightNode,
  children,
  className,
  contentClassName
}: FixedTransparentNavShellProps) {
  return (
    <AppScreen className={className} contentClassName="relative min-h-screen">
      <header className="fixed left-1/2 top-0 z-40 w-full max-w-[430px] -translate-x-1/2 h-[var(--meu-top-bar-height)]">
        <StatusBarSpacer />
        <TopNavigation
          title={title}
          backHref={backHref}
          background="transparent"
          foreground={foreground}
          rightHref={rightHref}
          rightNode={rightNode}
          rightText={rightText}
        />
      </header>
      <main className={cn("h-screen overflow-y-auto", contentClassName)}>{children}</main>
    </AppScreen>
  );
}
