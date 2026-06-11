export const WEBKIT_GESTURE_EVENTS = ["gesturestart", "gesturechange", "gestureend"] as const;

export function shouldPreventTouchZoom(event: Pick<TouchEvent, "touches">): boolean {
  return event.touches.length > 1;
}

export function preventCancelableDefault(event: Pick<Event, "cancelable" | "preventDefault">): void {
  if (event.cancelable) {
    event.preventDefault();
  }
}
