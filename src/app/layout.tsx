import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hybrid H5",
  description: "Hybrid App H5 runtime shell"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const releaseVariant = process.env.H5_RELEASE_VARIANT || "blue";
  const releaseLabel =
    process.env.H5_RELEASE_LABEL ||
    process.env.H5_VERSION ||
    "H5 unknown";

  return (
    <html lang="zh-CN">
      <body data-release-variant={releaseVariant} data-release-label={releaseLabel}>
        {children}
        <div className="h5-version-badge" aria-label={`当前 H5 版本：${releaseLabel}`}>
          {releaseLabel}
        </div>
      </body>
    </html>
  );
}
