import type { FirstScreenPerformanceMetrics, PerformanceTelemetryEvent, TelemetryContext } from "./types";

export type FirstScreenPerformanceEventOptions = {
  context?: TelemetryContext;
  timestamp?: number;
};

export function createFirstScreenPerformanceEvent(
  metrics: FirstScreenPerformanceMetrics,
  options: FirstScreenPerformanceEventOptions = {}
): PerformanceTelemetryEvent {
  return {
    type: "performance",
    name: "first_screen",
    timestamp: options.timestamp ?? Date.now(),
    ...(options.context === undefined ? {} : { context: options.context }),
    metrics
  };
}
