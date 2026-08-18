import type { WhatsAppQr, WhatsAppStatus } from "./types.ts";

export type WhatsAppConnectionView =
  | "connected"
  | "qr"
  | "initializing"
  | "authenticating"
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
  if (status.status === "QR_REQUIRED") return "qr";
  if (status.status === "INITIALIZING") return "initializing";
  if (status.status === "AUTHENTICATING") return "authenticating";
  if (status.status === "AUTH_FAILURE") return "auth-failure";
  if (status.status === "DISABLED") return "disabled";
  if (status.status === "DISCONNECTED") return "disconnected";
  if (status.status === "ERROR") return "error";
  return "unknown";
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
