import type {
  CaptureErrorOptions,
  ErrorTelemetryEvent,
  TelemetryClient,
  TelemetryClientConfig,
  TelemetryEvent,
  TelemetryProperties,
  TelemetryReportResult,
  TelemetryReporter
} from "./types";

export function createNoopTelemetryReporter(): TelemetryReporter {
  return {
    name: "noop",
    async report(): Promise<TelemetryReportResult> {
      return { ok: true };
    }
  };
}

export function createTelemetryClient(config: TelemetryClientConfig = {}): TelemetryClient {
  const reporter = config.reporter ?? createNoopTelemetryReporter();
  const timestampFactory = config.timestampFactory ?? Date.now;

  async function report(event: TelemetryEvent): Promise<TelemetryReportResult> {
    try {
      return await reporter.report(event);
    } catch (error) {
      return {
        ok: false,
        error: {
          code: "REPORTER_ERROR",
          message: error instanceof Error ? error.message : String(error),
          recoverable: true
        }
      };
    }
  }

  return {
    report,
    track(name: string, properties?: TelemetryProperties) {
      return report({
        type: "track",
        name,
        timestamp: timestampFactory(),
        ...(config.context === undefined ? {} : { context: config.context }),
        ...(properties === undefined ? {} : { properties })
      });
    },
    captureError(error: Error | unknown, options: CaptureErrorOptions = {}) {
      return report({
        type: "error",
        name: error instanceof Error ? error.name : "UnknownError",
        timestamp: timestampFactory(),
        ...(config.context === undefined ? {} : { context: config.context }),
        error: normalizeError(error),
        severity: options.severity ?? "error",
        fatal: options.fatal ?? false,
        ...(options.details === undefined ? {} : { details: options.details })
      });
    },
    recordPerformance(event) {
      return report(enrichEvent(event, config));
    },
    recordWhiteScreen(event) {
      return report(enrichEvent(event, config));
    }
  };
}

function normalizeError(error: Error | unknown): ErrorTelemetryEvent["error"] {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      ...(error.stack === undefined ? {} : { stack: error.stack })
    };
  }

  return {
    message: String(error)
  };
}

function enrichEvent<TEvent extends TelemetryEvent>(event: TEvent, config: TelemetryClientConfig): TEvent {
  if (event.context || !config.context) {
    return event;
  }

  return {
    ...event,
    context: config.context
  };
}
