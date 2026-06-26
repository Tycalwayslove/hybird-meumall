"use client";

import { useEffect } from "react";

import { erudaEntryButtonPlacement, replayDebugConsoleLogs, shouldEnableDebugConsole } from "./debug-console";

let erudaReady = false;

export function DebugConsoleLoader() {
  useEffect(() => {
    if (!shouldEnableDebugConsole(process.env.NEXT_PUBLIC_APP_ENV)) {
      return;
    }

    if (erudaReady) {
      return;
    }

    erudaReady = true;
    import("eruda")
      .then((eruda) => {
        eruda.default.init();
        window.requestAnimationFrame(() => {
          placeErudaEntryButton();
          replayDebugConsoleLogs();
        });
        console.info("[MeuMall][debug-console] eruda enabled", {
          appEnv: process.env.NEXT_PUBLIC_APP_ENV
        });
      })
      .catch((error: unknown) => {
        erudaReady = false;
        console.warn("[MeuMall][debug-console] failed to load eruda", error);
      });
  }, []);

  return null;
}

function placeErudaEntryButton() {
  const entryButton = document.querySelector<HTMLElement>(".eruda-entry-btn");
  if (!entryButton) {
    return;
  }

  const placement = erudaEntryButtonPlacement();
  Object.entries(placement).forEach(([property, value]) => {
    entryButton.style.setProperty(property, value, "important");
  });
}
