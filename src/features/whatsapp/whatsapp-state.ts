import type { WhatsAppQr, WhatsAppStatus } from "./types.ts";

export type WhatsAppConnectionView =
  | "connected"
  | "qr"
  | "initializing"
  | "auth-failure"
  | "disconnected"
  | "error"
  | "none";

export function resolveWhatsAppConnectionView(
  status: WhatsAppStatus,
): WhatsAppConnectionView {
  if (status.status === "CONNECTED" && status.connected === true) return "connected";
  if (status.qrAvailable) return "qr";
  if (status.status === "INITIALIZING") return "initializing";
  if (status.status === "AUTH_FAILURE") return "auth-failure";
  if (status.status === "DISCONNECTED") return "disconnected";
  if (status.status === "ERROR") return "error";
  return "none";
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
