import type { ReactNode } from "react";

import { cn } from "../utils/cn";

type ProductImagePlaceholderProps = {
  ariaLabel?: string;
  children?: ReactNode;
  className?: string;
  decorative?: boolean;
};

export function ProductImagePlaceholder({ ariaLabel = "商品图片占位", children, className, decorative = false }: ProductImagePlaceholderProps) {
  return (
    <span
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : ariaLabel}
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-[8px] bg-[#DDE1E8]",
        className
      )}
      data-product-image-placeholder="true"
      role={decorative ? undefined : "img"}
    >
      {children}
    </span>
  );
}
