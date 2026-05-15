export {
  createNoopTelemetryReporter,
  createTelemetryClient
} from "./reporter";
export {
  evaluateWhiteScreen,
  type WhiteScreenEvaluation,
  type WhiteScreenOptions,
  type WhiteScreenSample
} from "./white-screen";
export {
  createFirstScreenPerformanceEvent,
  type FirstScreenPerformanceEventOptions
} from "./performance";
export type {
  CaptureErrorOptions,
  ErrorTelemetryEvent,
  FirstScreenPerformanceMetrics,
  PerformanceTelemetryEvent,
  TelemetryBaseEvent,
  TelemetryClient,
  TelemetryClientConfig,
  TelemetryContext,
  TelemetryEvent,
  TelemetryPlatform,
  TelemetryProperties,
  TelemetryReporter,
  TelemetryReportResult,
  TelemetryValue,
  TrackTelemetryEvent,
  WhiteScreenTelemetryEvent
} from "./types";

export const telemetryRuntimeBoundary = {
  name: "Telemetry",
  status: "noop reporter and local event boundary"
} as const;
