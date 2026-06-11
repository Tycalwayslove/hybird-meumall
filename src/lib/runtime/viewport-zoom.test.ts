import { describe, expect, test, vi } from "vitest";

import { preventCancelableDefault, shouldPreventTouchZoom, WEBKIT_GESTURE_EVENTS } from "./viewport-zoom";

describe("viewport zoom guard", () => {
  test("tracks the WebKit gesture events that can trigger pinch zoom", () => {
    expect(WEBKIT_GESTURE_EVENTS).toEqual(["gesturestart", "gesturechange", "gestureend"]);
  });

  test("only prevents multi-touch movement", () => {
    expect(shouldPreventTouchZoom({ touches: { length: 1 } as TouchList })).toBe(false);
    expect(shouldPreventTouchZoom({ touches: { length: 2 } as TouchList })).toBe(true);
  });

  test("prevents default only when the event is cancelable", () => {
    const cancelablePreventDefault = vi.fn();
    const lockedPreventDefault = vi.fn();

    preventCancelableDefault({
      cancelable: true,
      preventDefault: cancelablePreventDefault
    });
    preventCancelableDefault({
      cancelable: false,
      preventDefault: lockedPreventDefault
    });

    expect(cancelablePreventDefault).toHaveBeenCalledTimes(1);
    expect(lockedPreventDefault).not.toHaveBeenCalled();
  });
});
