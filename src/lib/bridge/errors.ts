import type { BridgeError, BridgeErrorCode } from "./types";

const defaultMessages: Record<BridgeErrorCode, string> = {
  BRIDGE_UNAVAILABLE: "Native Bridge is unavailable.",
  METHOD_NOT_FOUND: "Native Bridge method is not available.",
  TIMEOUT: "Native Bridge call timed out.",
  NATIVE_ERROR: "Native Bridge call failed."
};

export function createBridgeError(
  code: BridgeErrorCode,
  options: {
    message?: string;
    nativeCode?: string;
    recoverable?: boolean;
    details?: Record<string, unknown>;
  } = {}
): BridgeError {
  return {
    code,
    message: options.message ?? defaultMessages[code],
    nativeCode: options.nativeCode,
    recoverable: options.recoverable ?? code !== "NATIVE_ERROR",
    details: options.details
  };
}
