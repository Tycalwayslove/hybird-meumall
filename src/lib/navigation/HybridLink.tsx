"use client";

import Link from "next/link";
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";

import type { HybridTabKey, NativePageName } from "./hybrid-navigation";
import { buildClientHref, createHybridNavigator } from "./hybrid-navigation";

type HybridLinkStrategy = "push" | "new-webview" | "switch-tab" | "native-page" | "close-webview";

type HybridLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "onClick"> & {
  children: ReactNode;
  href: string;
  nativePage?: NativePageName;
  source?: string;
  strategy?: HybridLinkStrategy;
  tab?: HybridTabKey;
  title?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export function HybridLink({
  children,
  href,
  nativePage,
  onClick,
  source,
  strategy = "push",
  tab,
  title,
  ...props
}: HybridLinkProps) {
  if (strategy === "push") {
    return (
      <Link href={href} onClick={onClick} {...props}>
        {children}
      </Link>
    );
  }

  const clientHref = strategy === "switch-tab" && tab ? buildClientHref(tabRootHref(tab)) : buildClientHref(href);

  return (
    <a
      href={clientHref}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || shouldLetBrowserHandle(event)) {
          return;
        }

        event.preventDefault();
        const navigator = createHybridNavigator();

        if (strategy === "new-webview") {
          navigator.openWebView({ href, source, title });
          return;
        }

        if (strategy === "switch-tab" && tab) {
          navigator.switchTab(tab, { closeCurrentWebView: false });
          return;
        }

        if (strategy === "native-page" && nativePage) {
          navigator.openNativePage(nativePage);
          return;
        }

        if (strategy === "close-webview") {
          navigator.closeWebView({ fallbackHref: href });
        }
      }}
      {...props}
    >
      {children}
    </a>
  );
}

function shouldLetBrowserHandle(event: MouseEvent<HTMLAnchorElement>) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

function tabRootHref(tab: HybridTabKey) {
  if (tab === "promotion") {
    return "/promotion";
  }
  if (tab === "mine") {
    return "/mine";
  }
  return "/";
}
