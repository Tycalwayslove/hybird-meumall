import { describe, expect, expectTypeOf, test, vi } from "vitest";
import {
  createFirstScreenPerformanceEvent,
  createNoopTelemetryReporter,
  createTelemetryClient,
  evaluateWhiteScreen
} from "./index";
import type { TelemetryEvent, TelemetryReporter, TrackTelemetryEvent } from "./index";

describe("telemetry", () => {
  test("defines discriminated event types", () => {
    expectTypeOf<TrackTelemetryEvent>().toMatchTypeOf<TelemetryEvent>();

    const event: TelemetryEvent = {
      type: "track",
      name: "button_click",
      timestamp: 1000,
      properties: {
        source: "home"
      }
    };

    expect(event.type).toBe("track");
  });

  test("noop reporter accepts events without sending external requests", async () => {
    const reporter = createNoopTelemetryReporter();

    const result = await reporter.report({
      type: "track",
      name: "noop_event",
      timestamp: 1000
    });

    expect(result).toEqual({ ok: true });
  });

  test("telemetry client enriches context and reports track events", async () => {
    const report = vi.fn(async () => ({ ok: true }) as const);
    const reporter: TelemetryReporter = { name: "memory", report };
    const client = createTelemetryClient({
      context: {
        h5Version: "2026.05.15-001",
        route: "/home",
        platform: "web"
      },
      reporter,
      timestampFactory: () => 1234
    });

    const result = await client.track("cta_click", { placement: "home_banner" });

    expect(result).toEqual({ ok: true });
    expect(report).toHaveBeenCalledWith({
      type: "track",
      name: "cta_click",
      timestamp: 1234,
      context: {
        h5Version: "2026.05.15-001",
        route: "/home",
        platform: "web"
      },
      properties: {
        placement: "home_banner"
      }
    });
  });

  test("normalizes Error objects into error telemetry events", async () => {
    const report = vi.fn(async () => ({ ok: true }) as const);
    const client = createTelemetryClient({
      reporter: { name: "memory", report },
      timestampFactory: () => 5678
    });

    await client.captureError(new Error("render failed"), {
      severity: "error",
      fatal: false
    });

    expect(report).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "error",
        name: "Error",
        timestamp: 5678,
        error: expect.objectContaining({
          message: "render failed",
          name: "Error"
        }),
        severity: "error",
        fatal: false
      })
    );
  });

  test("evaluates white screen samples using blank ratio threshold", () => {
    const result = evaluateWhiteScreen(
      [
        { selector: "body", isBlank: true },
        { selector: "#root", isBlank: true },
        { selector: ".page-title", isBlank: false },
        { selector: ".primary-action", isBlank: true }
      ],
      { threshold: 0.75 }
    );

    expect(result).toEqual({
      isWhiteScreen: true,
      blankRatio: 0.75,
      blankCount: 3,
      sampleSize: 4,
      threshold: 0.75
    });
  });

  test("empty white screen samples are treated as inconclusive", () => {
    const result = evaluateWhiteScreen([], { threshold: 0.75 });

    expect(result).toEqual({
      isWhiteScreen: false,
      blankRatio: 0,
      blankCount: 0,
      sampleSize: 0,
      threshold: 0.75
    });
  });

  test("creates first screen performance events", () => {
    const event = createFirstScreenPerformanceEvent(
      {
        firstContentfulPaintMs: 120,
        largestContentfulPaintMs: 480,
        domContentLoadedMs: 320,
        loadMs: 900
      },
      {
        timestamp: 2000,
        context: {
          route: "/home"
        }
      }
    );

    expect(event).toEqual({
      type: "performance",
      name: "first_screen",
      timestamp: 2000,
      context: {
        route: "/home"
      },
      metrics: {
        firstContentfulPaintMs: 120,
        largestContentfulPaintMs: 480,
        domContentLoadedMs: 320,
        loadMs: 900
      }
    });
  });
});
