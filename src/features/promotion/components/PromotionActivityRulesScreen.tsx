import parse from "html-react-parser";

import { StandardNavPage } from "@/design-system";

import type { PromotionActivityDetailData } from "../types";
import styles from "./PromotionActivityRulesScreen.module.css";

export function PromotionActivityRulesScreen({ data }: { data: PromotionActivityDetailData }) {
  const safeHtml = data.ruleContentHtml?.trim();

  return (
    <StandardNavPage
      backHref={`/promotion/activities/${data.id}`}
      className="bg-fill-white"
      contentClassName={styles.content}
      title="活动规则"
    >
      {safeHtml ? <div className={styles.richText}>{parse(safeHtml)}</div> : <p className={styles.fallback}>暂无活动规则</p>}
    </StandardNavPage>
  );
}
