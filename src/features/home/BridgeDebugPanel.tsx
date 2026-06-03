"use client";

import { useMemo, useState } from "react";
import { BridgeRPCError, createWindowProtocolBridge, type ProtocolBridge } from "@/lib/bridge/protocol-bridge";

type BridgeLog = {
  id: number;
  label: string;
  status: "success" | "error" | "sent";
  message: string;
};

const maxLogs = 6;

export function BridgeDebugPanel() {
  const bridge = useMemo(() => createWindowProtocolBridge(), []);
  const [logs, setLogs] = useState<BridgeLog[]>([]);

  function pushLog(log: Omit<BridgeLog, "id">) {
    setLogs((current) => [{ ...log, id: Date.now() + Math.random() }, ...current].slice(0, maxLogs));
  }

  async function run(label: string, action: (bridge: ProtocolBridge) => Promise<unknown> | unknown) {
    try {
      const result = await action(bridge);
      pushLog({
        label,
        status: result === undefined ? "sent" : "success",
        message: result === undefined ? "已发送给原生 App" : JSON.stringify(result)
      });
    } catch (error) {
      pushLog({
        label,
        status: "error",
        message: formatBridgeError(error)
      });
    }
  }

  return (
    <section className="mt-3 rounded-[8px] border border-[#d8dee8] bg-white px-3 py-3 shadow-[0_1px_8px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-[14px] font-black text-[#111]">Hybrid Bridge 调试</h2>
          <p className="mt-0.5 text-[11px] font-medium text-[#667085]">点击按钮向原生发送统一信封，原生当前只接收和占位回传。</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${bridge.isAvailable() ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#991b1b]"}`}>
          {bridge.isAvailable() ? "Bridge 可用" : "Web 环境"}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <BridgeButton label="设备信息" onClick={() => run("getDeviceInfo", (nextBridge) => nextBridge.rpc("getDeviceInfo"))} />
        <BridgeButton label="获取 Token" onClick={() => run("getTokens", (nextBridge) => nextBridge.rpc("getTokens"))} />
        <BridgeButton label="回首页" onClick={() => run("navigate home", (nextBridge) => nextBridge.navigate({ route: "home" }))} />
        <BridgeButton label="返回" onClick={() => run("navigate back", (nextBridge) => nextBridge.navigate({ route: "back" }))} />
        <BridgeButton label="商品详情" onClick={() => run("product_detail", (nextBridge) => nextBridge.navigate({ route: "product_detail", params: { id: "p-1001" } }))} />
        <BridgeButton label="打开 WebView" onClick={() => run("webview", (nextBridge) => nextBridge.navigate({ route: "webview", params: { url: "https://hybird.aigcpop.com/h5-v/v1.0.2/promotion" } }))} />
        <BridgeButton label="Token 失效" onClick={() => run("token_expired", (nextBridge) => nextBridge.emit("token_expired", { reason: "debug_button" }))} />
        <BridgeButton label="分享商品" onClick={() => run("share", (nextBridge) => nextBridge.emit("share", { productId: "p-1001" }))} />
        <BridgeButton label="监听登出" onClick={() => run("listen logout", (nextBridge) => {
          const off = nextBridge.on("logout", (payload) => {
            pushLog({
              label: "logout",
              status: "success",
              message: JSON.stringify(payload)
            });
            off();
          });
        })} />
        <BridgeButton label="模拟登出" onClick={() => run("mock logout", (nextBridge) => nextBridge.reply.emit("logout", { reason: "debug_mock" }))} />
      </div>

      <div className="mt-3 min-h-[44px] rounded-[6px] bg-[#f8fafc] px-2 py-2">
        {logs.length === 0 ? (
          <p className="text-[11px] font-medium text-[#94a3b8]">暂无调用记录</p>
        ) : (
          <ul className="space-y-1.5">
            {logs.map((log) => (
              <li key={log.id} className="min-w-0 text-[11px] leading-[15px]">
                <span className={getStatusClassName(log.status)}>{log.status}</span>
                <span className="ml-1 font-bold text-[#111]">{log.label}</span>
                <span className="ml-1 break-all text-[#475467]">{log.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function BridgeButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-9 rounded-[6px] border border-[#d0d5dd] bg-[#f9fafb] px-2 text-[12px] font-bold text-[#111] active:bg-[#eef2f7]"
    >
      {label}
    </button>
  );
}

function formatBridgeError(error: unknown) {
  if (error instanceof BridgeRPCError) {
    return `${error.code}: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "未知错误";
}

function getStatusClassName(status: BridgeLog["status"]) {
  if (status === "success") {
    return "rounded bg-[#dcfce7] px-1 font-bold text-[#166534]";
  }

  if (status === "sent") {
    return "rounded bg-[#e0f2fe] px-1 font-bold text-[#075985]";
  }

  return "rounded bg-[#fee2e2] px-1 font-bold text-[#991b1b]";
}
