"use client";

import { useEffect } from "react";

import { preventCancelableDefault, shouldPreventTouchZoom, WEBKIT_GESTURE_EVENTS } from "./viewport-zoom";

const nonPassiveListener: AddEventListenerOptions = { passive: false };

export function DisableViewportZoom() {
  useEffect(() => {
    const preventGestureZoom = (event: Event) => {
      preventCancelableDefault(event);
    };

    const preventMultiTouchZoom = (event: TouchEvent) => {
      if (shouldPreventTouchZoom(event)) {
        preventCancelableDefault(event);
      }
    };

    WEBKIT_GESTURE_EVENTS.forEach((eventName) => {
      document.addEventListener(eventName, preventGestureZoom, nonPassiveListener);
    });
    document.addEventListener("touchmove", preventMultiTouchZoom, nonPassiveListener);

    return () => {
      WEBKIT_GESTURE_EVENTS.forEach((eventName) => {
        document.removeEventListener(eventName, preventGestureZoom);
      });
      document.removeEventListener("touchmove", preventMultiTouchZoom);
    };
  }, []);

  return null;
}
