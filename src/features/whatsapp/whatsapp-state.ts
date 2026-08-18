import type { WhatsAppQr, WhatsAppStatus } from "./types.ts";

export type WhatsAppConnectionView =
  | "connected"
  | "qr"
  | "initializing"
  | "authenticating"
  | "state-warning"
  | "auth-failure"
  | "disabled"
  | "disconnected"
  | "error"
  | "unknown";

export function resolveWhatsAppConnectionView(
  status: WhatsAppStatus,
): WhatsAppConnectionView {
  if (status.qrAvailable) return "qr";
  if (status.status === "CONNECTED" && status.connected === true) return "connected";
  if (status.lifecycleState === "READY") return "state-warning";
  if (status.status === "QR_REQUIRED") return "qr";
  if (status.status === "INITIALIZING") return "initializing";
  if (status.status === "AUTHENTICATING") return "authenticating";
  if (status.status === "AUTH_FAILURE") return "auth-failure";
  if (status.status === "DISABLED") return "disabled";
  if (status.status === "DISCONNECTED") return "disconnected";
  if (status.status === "ERROR") return "error";
  return "unknown";
}

export const WHATSAPP_AUTHENTICATING_WARNING_MS = 30_000;

export function whatsappPollingMs(status: WhatsAppStatus["status"]) {
  if (["INITIALIZING", "QR_REQUIRED", "AUTHENTICATING"].includes(status)) return 2_000;
  if (status === "CONNECTED") return 12_000;
  return 10_000;
}

export function belongsToCurrentGeneration(
  status: WhatsAppStatus,
  qr: WhatsAppQr,
) {
  return (
    qr.generation === undefined ||
    status.generation === undefined ||
    qr.generation === status.generation
  );
}
