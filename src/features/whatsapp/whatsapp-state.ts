import type { WhatsAppQr, WhatsAppStatus } from "./types.ts";

export const WHATSAPP_ACTION_ENDPOINTS = {
  initialize: "/whatsapp/initialize",
  reconnect: "/whatsapp/reconnect",
  destroy: "/whatsapp/destroy",
  logout: "/whatsapp/logout",
} as const;
export type WhatsAppAction = keyof typeof WHATSAPP_ACTION_ENDPOINTS;

export type WhatsAppConnectionView =
  | "disabled" | "idle" | "starting" | "qr" | "authenticating"
  | "connected" | "disconnecting" | "logging-out" | "error" | "unknown";

export function resolveWhatsAppConnectionView(status: WhatsAppStatus): WhatsAppConnectionView {
  switch (status.state) {
    case "DISABLED": return "disabled";
    case "IDLE": return "idle";
    case "STARTING": return "starting";
    case "QR_REQUIRED": return "qr";
    case "AUTHENTICATING": return "authenticating";
    case "CONNECTED": return status.connected ? "connected" : "unknown";
    case "DISCONNECTING": return "disconnecting";
    case "LOGGING_OUT": return "logging-out";
    case "ERROR": return "error";
    default: return "unknown";
  }
}

export function whatsappPollingMs(state: WhatsAppStatus["state"]) {
  return ["STARTING", "QR_REQUIRED", "AUTHENTICATING", "DISCONNECTING", "LOGGING_OUT"].includes(state) ? 1_500 : 12_000;
}

export function shouldRequestQr(status: WhatsAppStatus) {
  return status.state === "QR_REQUIRED" && status.qrAvailable;
}

export function connectionActionsDisabled(status: WhatsAppStatus, busy: string) {
  return Boolean(busy) || status.state === "DISCONNECTING" || status.state === "LOGGING_OUT";
}

export type InFlightSlot<T> = { current: Promise<T> | null };
export function runSingleFlight<T>(slot: InFlightSlot<T>, task: () => Promise<T>) {
  if (slot.current) return slot.current;
  const request = task();
  slot.current = request;
  return request.finally(() => { if (slot.current === request) slot.current = null; });
}

export function belongsToCurrentGeneration(status: WhatsAppStatus, qr: WhatsAppQr) {
  return typeof qr.generation === "number" && qr.generation === status.generation;
}
