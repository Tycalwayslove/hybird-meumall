import parse from "html-react-parser";

import { sanitizeProductRichContent } from "../rich-content";
import styles from "./ProductRichContent.module.css";

type ProductRichContentProps = {
  fallback?: string;
  html?: string;
};

export function ProductRichContent({ fallback = "暂无商品详情", html }: ProductRichContentProps) {
  const safeHtml = sanitizeProductRichContent(html);

  if (!safeHtml) {
    return <p className={styles.fallback}>{fallback}</p>;
  }

  return <div className={styles.richContent}>{parse(safeHtml)}</div>;
}
