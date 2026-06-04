"use client";

import { useEffect, useState } from "react";
import { createH5Client } from "@/lib/http";
import type { NativeRuntimeContext } from "@/server/runtime/native-context";

type RuntimeState =
  | { status: "loading" }
  | { status: "ready"; context: NativeRuntimeContext }
  | { status: "error"; message: string };

export function NativeRuntimePanel() {
  const [state, setState] = useState<RuntimeState>({ status: "loading" });

  useEffect(() => {
    let disposed = false;
    const client = createH5Client();
    const sourceSearch = typeof window === "undefined" ? "" : window.location.search;
    const path = sourceSearch
      ? `/api/bff/runtime/context?sourceSearch=${encodeURIComponent(sourceSearch)}`
      : "/api/bff/runtime/context";

    async function loadRuntimeContext() {
      try {
        const result = await client.request<NativeRuntimeContext>(path);
        if (disposed) {
          return;
        }

        if (result.success) {
          applyNativeStatusHeight(result.data.statusBar.statusHeight);
          setState({ status: "ready", context: result.data });
        } else {
          setState({ status: "error", message: result.message });
        }
      } catch (error) {
        if (!disposed) {
          setState({ status: "error", message: error instanceof Error ? error.message : "runtime context load failed" });
        }
      }
    }

    void loadRuntimeContext();

    return () => {
      disposed = true;
    };
  }, []);

  return (
    <section className="mt-3 rounded-[8px] border border-[#d8e2c6] bg-[#fbfff4] px-3 py-3 text-[#253317]">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[13px] font-black">原生传参</h2>
        <span className="rounded-full bg-[#ecfccb] px-2 py-0.5 text-[10px] font-bold text-[#4d7c0f]">Cookie / Config</span>
      </div>
      {state.status === "loading" ? <p className="mt-2 text-[11px] font-semibold text-[#6b765d]">读取中</p> : null}
      {state.status === "error" ? <p className="mt-2 break-all text-[11px] font-semibold text-[#b91c1c]">{state.message}</p> : null}
      {state.status === "ready" ? <RuntimeContextView context={state.context} /> : null}
    </section>
  );
}

function RuntimeContextView({ context }: { context: NativeRuntimeContext }) {
  const pageConfigEntries = context.pageConfig ? Object.entries(context.pageConfig) : [];
  const sourceParamEntries = Object.entries(context.sourceParams);

  return (
    <div className="mt-2 space-y-2 text-[11px] font-semibold">
      <div className="grid grid-cols-2 gap-2">
        <RuntimeField label="Python Token" value={context.auth.pythonToken.present ? "已接收" : "未接收"} strong={context.auth.pythonToken.present} />
        <RuntimeField label="Python Token 值" value={context.auth.pythonToken.preview ?? "-"} />
        <RuntimeField label="Mall Token" value={context.auth.mallToken.present ? "已接收" : "未接收"} strong={context.auth.mallToken.present} />
        <RuntimeField label="Mall Token 值" value={context.auth.mallToken.preview ?? "-"} />
        <RuntimeField label="状态栏高度" value={context.statusBar.statusHeight === null ? "-" : `${context.statusBar.statusHeight}px`} />
        <RuntimeField label="环境" value={context.environment.appEnv} />
        <RuntimeField label="H5" value={context.environment.h5Version} />
      </div>

      <RuntimeGroup title="页面配置">
        {pageConfigEntries.length > 0 ? (
          pageConfigEntries.map(([key, value]) => <RuntimeRow key={key} label={key} value={formatRuntimeValue(value)} />)
        ) : (
          <RuntimeEmpty text="未收到 meu_page_config" />
        )}
      </RuntimeGroup>

      <RuntimeGroup title="URL 参数">
        {sourceParamEntries.length > 0 ? (
          sourceParamEntries.map(([key, value]) => <RuntimeRow key={key} label={key} value={value} />)
        ) : (
          <RuntimeEmpty text="无启动参数" />
        )}
      </RuntimeGroup>

      <RuntimeGroup title="Cookie 明细">
        {context.cookies.length > 0 ? (
          context.cookies.map((cookie) => (
            <RuntimeRow key={cookie.name} label={cookie.name} value={cookie.preview ?? "-"} muted={cookie.sensitive} />
          ))
        ) : (
          <RuntimeEmpty text="无 Cookie" />
        )}
      </RuntimeGroup>
    </div>
  );
}

function RuntimeField({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="min-w-0 rounded-[6px] bg-white px-2 py-1.5">
      <div className="text-[10px] text-[#77836b]">{label}</div>
      <div className={`mt-0.5 truncate text-[11px] ${strong ? "text-[#3f6212]" : "text-[#253317]"}`}>{value}</div>
    </div>
  );
}

function RuntimeGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[6px] bg-white px-2 py-2">
      <div className="mb-1 text-[10px] font-black text-[#607050]">{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function RuntimeRow({ label, value, muted = false }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="grid grid-cols-[92px_minmax(0,1fr)] gap-2">
      <span className="truncate text-[#77836b]">{label}</span>
      <span className={`break-all ${muted ? "text-[#7c6f53]" : "text-[#1f2a13]"}`}>{value}</span>
    </div>
  );
}

function RuntimeEmpty({ text }: { text: string }) {
  return <div className="text-[#9aa38f]">{text}</div>;
}

function formatRuntimeValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}

function applyNativeStatusHeight(statusHeight: number | null) {
  if (typeof document === "undefined") {
    return;
  }

  const height = statusHeight ?? 0;
  document.documentElement.style.setProperty("--native-status-height", `${height}px`);
}
