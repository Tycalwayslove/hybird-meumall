import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import "@/styles/globals.css";
import { HybridRouteReporter } from "@/lib/navigation";
import { DisableViewportZoom } from "@/lib/runtime/DisableViewportZoom";
import { formatStatusBarCssVars } from "@/lib/runtime/status-bar";
import { appViewport } from "@/lib/runtime/viewport-config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hybrid H5",
  description: "Hybrid App H5 runtime shell"
};

export const viewport = appViewport;

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const statusHeight = cookieStore.get("statusHeight")?.value;
  const releaseVariant = process.env.H5_RELEASE_VARIANT || "blue";
  const releaseLabel =
    process.env.H5_RELEASE_LABEL ||
    process.env.H5_VERSION ||
    "H5 unknown";
  const showVersionBadge = process.env.H5_SHOW_VERSION_BADGE === "true";

  return (
    <html lang="zh-CN">
      <body
        data-release-variant={releaseVariant}
        data-release-label={releaseLabel}
        style={formatStatusBarCssVars(statusHeight) as CSSProperties}
      >
        {children}
        <HybridRouteReporter />
        <DisableViewportZoom />
        {showVersionBadge ? (
          <div className="h5-version-badge" aria-label={`当前 H5 版本：${releaseLabel}`}>
            {releaseLabel}
          </div>
        ) : null}
      </body>
    </html>
  );
}
