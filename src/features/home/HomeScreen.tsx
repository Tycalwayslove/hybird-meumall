"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ReplicaShell } from "@/components/commerce/ReplicaShell";
import { fetchActiveHomeConfig } from "./api";
import { defaultHomeConfig } from "./default-config";
import { HomeSkeleton } from "./HomeSkeleton";
import { getHomePreloadImages, HomeModules } from "./HomeModules";
import { readHomeConfigCache, writeHomeConfigCache } from "./home-cache";
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

export function HomeScreen({ environment = "prod" }: { environment?: HomeEnvironment }) {
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

  return (
    <ReplicaShell>
      <div className="px-3 pt-3">
        <HomeHeader />
        <HomeModules modules={state.config.modules} />
      </div>
    </ReplicaShell>
  );
}

function HomeHeader() {
  return (
    <header className="flex h-9 items-center gap-2.5">
      <Link href="/" className="flex w-[112px] shrink-0 items-center gap-2 max-[340px]:w-[100px] max-[340px]:gap-1.5">
        <span className="relative inline-flex size-[22px] rounded-[5px] bg-[#75e92e]">
          <span className="absolute left-[5px] top-[4px] h-[14px] w-[3px] rotate-[-28deg] rounded-full bg-white" />
          <span className="absolute left-[11px] top-[3px] h-[16px] w-[3px] rotate-[-28deg] rounded-full bg-white" />
        </span>
        <span className="text-[21px] font-black max-[340px]:text-[18px]">喵呜AI</span>
      </Link>
      <Link
        href="/category"
        className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full border border-[#78de2d] bg-white px-3 text-[14px] text-[#b7b7b7] max-[340px]:px-2 max-[340px]:text-[12px]"
      >
        <span className="relative size-[15px] shrink-0 rounded-full border-2 border-[#111] after:absolute after:-bottom-[3px] after:-right-[3px] after:h-[7px] after:w-0.5 after:rotate-[-45deg] after:rounded-full after:bg-[#111]" />
        <span className="truncate">请输入关键词</span>
      </Link>
      <Link href="/messages" className="relative flex size-[28px] shrink-0 items-center justify-center">
        <span className="h-[18px] w-[17px] rounded-t-full border-2 border-[#111] border-b-0" />
        <span className="absolute bottom-[4px] h-0.5 w-[19px] rounded-full bg-[#111]" />
        <span className="absolute -right-1 -top-0.5 rounded-full bg-[#ff3f62] px-1 text-[9px] font-bold leading-[12px] text-white">22</span>
      </Link>
    </header>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
