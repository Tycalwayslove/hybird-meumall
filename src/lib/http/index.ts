export type { ClientPlatform, ClientRequestContext } from "./client-context";
export { buildClientContextHeaders, readClientRequestContextFromHeaders } from "./client-context";
export { buildH5ApiPath, createH5Client } from "./h5-client";
export type { H5BffResult, H5ClientConfig, H5RequestOptions } from "./h5-client";
export {
  clearRequestDiagnostics,
  createDiagnosticSnapshot,
  createPageSessionId,
  getBrowserClientContext,
  getBrowserPageSessionId,
  getRecentRequestRecords,
  recordRequestDiagnostic
} from "./request-diagnostics";
export type { DiagnosticSnapshot, RequestDiagnosticRecord, RequestDiagnosticStatus } from "./request-diagnostics";
