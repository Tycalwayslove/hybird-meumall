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
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
