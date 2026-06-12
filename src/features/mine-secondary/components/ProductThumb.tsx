import { ProductImagePlaceholder } from "@/design-system";

import styles from "./ProductThumb.module.css";

export function ProductThumb({ className }: { className?: string }) {
  return <ProductImagePlaceholder className={className ?? styles.thumb} decorative />;
}
