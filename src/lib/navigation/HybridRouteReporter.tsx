"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { createHybridNavigator, inferFallbackTab } from "./hybrid-navigation";

export function HybridRouteReporter() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  useEffect(() => {
    const path = search ? `${pathname}?${search}` : pathname;
    createHybridNavigator().reportRouteChanged({
      path,
      canGoBack: typeof window !== "undefined" ? window.history.length > 1 : false,
      fallbackTab: inferFallbackTab(pathname)
    });
  }, [pathname, search]);

  return null;
}
