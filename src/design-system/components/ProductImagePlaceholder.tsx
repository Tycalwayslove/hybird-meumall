import type { ReactNode } from "react";

import { localAssetUrl } from "@/lib/assets";

import { cn } from "../utils/cn";

type ProductImagePlaceholderProps = {
  ariaLabel?: string;
  children?: ReactNode;
  className?: string;
  decorative?: boolean;
  hideDefaultIcon?: boolean;
};

export function ProductImagePlaceholder({
  ariaLabel = "商品图片占位",
  children,
  className,
  decorative = false,
  hideDefaultIcon = false
}: ProductImagePlaceholderProps) {
  return (
    <span
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : ariaLabel}
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-[8px] bg-[#EEF0F5]",
        className
      )}
      data-product-image-placeholder="true"
      role={decorative ? undefined : "img"}
    >
      {hideDefaultIcon ? null : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 block size-[clamp(28px,52%,60px)] -translate-x-1/2 -translate-y-1/2 object-contain"
          data-product-image-placeholder-icon="true"
          src={localAssetUrl("placeholder.productImage", { basePath: process.env.NEXT_PUBLIC_H5_BASE_PATH || process.env.H5_BASE_PATH || "/hybird" })}
        />
      )}
      {children}
    </span>
  );
}
