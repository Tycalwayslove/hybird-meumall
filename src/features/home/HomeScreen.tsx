"use client";

import { useEffect, useState } from "react";
import { fetchActiveHomeConfig } from "./api";
import { HomeExperience } from "./components/HomeExperience";
import { defaultHomeConfig } from "./default-config";
import { HomeSkeleton } from "./HomeSkeleton";
import { getHomePreloadImages } from "./HomeModules";
import { readHomeConfigCache, writeHomeConfigCache } from "./home-cache";
import { homeExperienceData } from "./mock/home-page-data";
import type { HomeConfig, HomeConfigState, HomeEnvironment } from "./types";

const DEFAULT_SKELETON_MIN_MS = 200;

type ResolveHomeConfigStateOptions = {
  environment?: HomeEnvironment;
  fetcher?: typeof fetch;
  now?: number;
  storage?: Storage | null;
  fallbackConfig?: HomeConfig;
};

export async function resolveHomeConfigState({
  environment = "prod",
  fetcher,
  now = Date.now(),
  storage,
  fallbackConfig = defaultHomeConfig
}: ResolveHomeConfigStateOptions = {}): Promise<HomeConfigState> {
  const cached = readHomeConfigCache({ environment, now, storage });

  try {
    const config = await fetchActiveHomeConfig({
      environment,
      fetcher,
      timeoutMs: cached?.entry.config.performance?.requestTimeoutMs ?? fallbackConfig.performance?.requestTimeoutMs
    });

    writeHomeConfigCache({ config, environment, now: Date.now(), storage });

    return {
      config,
      source: "remote"
    };
  } catch {
    if (cached) {
      return {
        config: cached.entry.config,
        source: "cache"
      };
    }

    return {
      config: fallbackConfig,
      source: "default"
    };
  }
}

export function HomeScreen({ environment = "prod", releaseLabel }: { environment?: HomeEnvironment; releaseLabel?: string }) {
  const [state, setState] = useState<HomeConfigState | null>(null);

  useEffect(() => {
    let disposed = false;
    const startedAt = Date.now();

    async function loadHomeConfig() {
      const nextState = await resolveHomeConfigState({ environment });
      const skeletonMinMs = nextState.config.performance?.skeletonMinMs ?? DEFAULT_SKELETON_MIN_MS;
      const elapsed = Date.now() - startedAt;

      if (elapsed < skeletonMinMs) {
        await sleep(skeletonMinMs - elapsed);
      }

      if (!disposed) {
        setState(nextState);
      }
    }

    void loadHomeConfig();

    return () => {
      disposed = true;
    };
  }, [environment]);

  useEffect(() => {
    if (!state) {
      return;
    }

    const links = getHomePreloadImages(state.config.modules, state.config.performance?.preloadImageCount ?? 0).map((href) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = href;
      document.head.appendChild(link);
      return link;
    });

    return () => {
      links.forEach((link) => link.remove());
    };
  }, [state]);

  if (!state) {
    return <HomeSkeleton />;
  }

  return <HomeExperience data={homeExperienceData} releaseLabel={releaseLabel} />;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
