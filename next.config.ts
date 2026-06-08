import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_H5_BASE_PATH || process.env.H5_BASE_PATH || "";
const assetPrefix = process.env.H5_ASSET_PREFIX || undefined;

const nextConfig: NextConfig = {
  ...(assetPrefix ? { assetPrefix } : {}),
  ...(basePath ? { basePath } : {}),
  output: "standalone"
};

export default nextConfig;
