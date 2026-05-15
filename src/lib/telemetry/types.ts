export type TelemetryPlatform = "ios" | "android" | "web";

export type TelemetryValue = string | number | boolean | null;

export type TelemetryContext = {
  requestId?: string;
  route?: string;
  h5Version?: string;
  appVersion?: string;
  platform?: TelemetryPlatform;
  channel?: string;
};

export type TelemetryProperties = Record<string, TelemetryValue | TelemetryValue[]>;

export type TelemetryBaseEvent = {
  name: string;
  timestamp: number;
  context?: TelemetryContext;
};

export type TrackTelemetryEvent = TelemetryBaseEvent & {
  type: "track";
  properties?: TelemetryProperties;
};

export type ErrorTelemetryEvent = TelemetryBaseEvent & {
  type: "error";
  error: {
    message: string;
    name?: string;
    stack?: string;
  };
  severity: "info" | "warning" | "error" | "fatal";
  fatal: boolean;
  details?: TelemetryProperties;
};

export type FirstScreenPerformanceMetrics = {
  firstContentfulPaintMs?: number;
  largestContentfulPaintMs?: number;
  domContentLoadedMs?: number;
  loadMs?: number;
};

export type PerformanceTelemetryEvent = TelemetryBaseEvent & {
  type: "performance";
  name: "first_screen" | string;
  metrics: FirstScreenPerformanceMetrics & Record<string, number | undefined>;
};

export type WhiteScreenTelemetryEvent = TelemetryBaseEvent & {
  type: "white_screen";
  name: "white_screen_detected";
  blankRatio: number;
  blankCount: number;
  sampleSize: number;
  threshold: number;
};

export type TelemetryEvent =
  | TrackTelemetryEvent
  | ErrorTelemetryEvent
  | PerformanceTelemetryEvent
  | WhiteScreenTelemetryEvent;

export type TelemetryReportResult =
  | { ok: true }
  | {
      ok: false;
      error: {
        code: "REPORTER_ERROR";
        message: string;
        recoverable: boolean;
      };
    };

export type TelemetryReporter = {
  name: string;
  report(event: TelemetryEvent): TelemetryReportResult | Promise<TelemetryReportResult>;
};

export type TelemetryClientConfig = {
  context?: TelemetryContext;
  reporter?: TelemetryReporter;
  timestampFactory?: () => number;
};

export type CaptureErrorOptions = {
  details?: TelemetryProperties;
  fatal?: boolean;
  severity?: ErrorTelemetryEvent["severity"];
};

export type TelemetryClient = {
  report(event: TelemetryEvent): Promise<TelemetryReportResult>;
  track(name: string, properties?: TelemetryProperties): Promise<TelemetryReportResult>;
  captureError(error: Error | unknown, options?: CaptureErrorOptions): Promise<TelemetryReportResult>;
  recordPerformance(event: PerformanceTelemetryEvent): Promise<TelemetryReportResult>;
  recordWhiteScreen(event: WhiteScreenTelemetryEvent): Promise<TelemetryReportResult>;
};
