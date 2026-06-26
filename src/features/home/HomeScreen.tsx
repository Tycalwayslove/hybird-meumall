"use client";

import { useEffect, useState } from "react";
import { createH5Client } from "@/lib/http";
import type { HomeApi } from "./home-api";
import { createHomeApi } from "./home-api";
import { HomeExperience } from "./components/HomeExperience";
import { defaultHomeConfig } from "./default-config";
import { HomeSkeleton } from "./HomeSkeleton";
import { getHomePreloadImages } from "./HomeModules";
import { readHomeConfigCache } from "./home-cache";
import { homeExperienceData } from "./mock/home-page-data";
import { createEmptyHomeExperienceData, type HomeExperienceData } from "./home-page-data";
import type { HomeConfig, HomeConfigState, HomeEnvironment } from "./types";

const DEFAULT_SKELETON_MIN_MS = 200;

type ResolveHomeConfigStateOptions = {
  environment?: HomeEnvironment;
  fetcher?: typeof fetch;
  now?: number;
  storage?: Storage | null;
  fallbackConfig?: HomeConfig;
};

type HomeExperienceState = {
  data: HomeExperienceData;
  source: "empty" | "error" | "remote";
};

type ResolveHomeExperienceStateOptions = {
  fallbackData?: HomeExperienceData;
  homeApi?: Pick<HomeApi, "getHome"> & Partial<Pick<HomeApi, "getRecommendProducts">>;
};

export async function resolveHomeConfigState({
  environment = "prod",
  now = Date.now(),
  storage,
  fallbackConfig = defaultHomeConfig
}: ResolveHomeConfigStateOptions = {}): Promise<HomeConfigState> {
  const cached = readHomeConfigCache({ environment, now, storage });

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

export async function resolveHomeExperienceState({
  fallbackData = homeExperienceData,
  homeApi = createHomeApi(createH5Client())
}: ResolveHomeExperienceStateOptions = {}): Promise<HomeExperienceState> {
  const [homeResult, forYouProductsResult] = await Promise.all([
    homeApi.getHome().catch(() => undefined),
    homeApi.getRecommendProducts?.({ current: 1, size: 10 }).catch(() => undefined) ?? Promise.resolve(undefined)
  ]);
  let data = createEmptyHomeExperienceData(fallbackData);
  let source: HomeExperienceState["source"] = homeResult?.success === false || homeResult === undefined ? "error" : "empty";

  if (homeResult?.success) {
    data = homeResult.data.view;
    source = "remote";
  }

  if (forYouProductsResult?.success) {
    data = {
      ...data,
      products: forYouProductsResult.data.view.products
    };
    source = "remote";
  }

  return {
    data,
    source
  };
}

export function HomeScreen({ environment = "prod", releaseLabel }: { environment?: HomeEnvironment; releaseLabel?: string }) {
  const [state, setState] = useState<{ config: HomeConfigState; experience: HomeExperienceState } | null>(null);

  useEffect(() => {
    let disposed = false;
    const startedAt = Date.now();

    async function loadHomeConfig() {
      const [configState, experienceState] = await Promise.all([resolveHomeConfigState({ environment }), resolveHomeExperienceState()]);
      const skeletonMinMs = configState.config.performance?.skeletonMinMs ?? DEFAULT_SKELETON_MIN_MS;
      const elapsed = Date.now() - startedAt;

      if (elapsed < skeletonMinMs) {
        await sleep(skeletonMinMs - elapsed);
      }

      if (!disposed) {
        setState({
          config: configState,
          experience: experienceState
        });
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

    const links = getHomePreloadImages(state.config.config.modules, state.config.config.performance?.preloadImageCount ?? 0).map((href) => {
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

  if (state.experience.source === "error") {
    return <HomeErrorState />;
  }

  return <HomeExperience data={state.experience.data} releaseLabel={releaseLabel} />;
}

function HomeErrorState() {
  return (
    <main className="min-h-screen bg-fill-page px-6 py-24 text-center text-text-primary">
      <p className="text-base font-semibold">首页加载失败</p>
      <p className="mt-2 text-sm text-text-secondary">请稍后重试</p>
    </main>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
