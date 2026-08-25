import type { WhatsAppConnectionStatus, WhatsAppMessageStatus } from "@/src/lib/constants/backend-enums";

export type WhatsAppState = WhatsAppConnectionStatus;
export type WhatsAppStatus = {
  enabled: boolean;
  state: WhatsAppState;
  connected: boolean;
  phoneNumber: string | null;
  displayName: string | null;
  lastConnectedAt: string | null;
  lastDisconnectedAt: string | null;
  qrAvailable: boolean;
  lastError: string | null;
  generation: number;
};
export type WhatsAppQr = {
  available: boolean;
  qrDataUrl?: string;
  createdAt?: string;
  expiresAt?: string;
  generation?: number;
  reason?: string;
};
export type WhatsAppMessage = Record<string, unknown> & {
  id: string;
  direction?: string;
  phone?: string;
  phoneNumber?: string;
  to?: string;
  from?: string;
  body?: string;
  text?: string;
  message?: string;
  status?: WhatsAppMessageStatus;
  createdAt?: string;
};
