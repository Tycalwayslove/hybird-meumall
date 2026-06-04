import { Metric, StateView } from "@/design-system";

import type { PromotionMetric } from "../types";

export function PromotionMetricGrid({ metrics }: { metrics: PromotionMetric[] }) {
  if (metrics.length === 0) {
    return <StateView title="暂无推广数据" />;
  }

  return (
    <section className="grid grid-cols-3 overflow-hidden rounded-md bg-fill-white">
      {metrics.map((metric, index) => (
        <Metric
          key={metric.id}
          className={`flex h-20 flex-col items-center justify-center border-b border-r border-line px-2 text-center ${
            (index + 1) % 3 === 0 ? "border-r-0" : ""
          }`}
          label={metric.label}
          value={metric.value}
        />
      ))}
    </section>
  );
}
