import type { WhatsAppConnectionStatus, WhatsAppMessageStatus } from "@/src/lib/constants/backend-enums";

export type WhatsAppState = WhatsAppConnectionStatus;
export type WhatsAppStatus = {
  enabled: boolean;
  status: WhatsAppState;
  connected: boolean;
  phoneNumber: string | null;
  displayName: string | null;
  lastConnectedAt: string | null;
  lastDisconnectedAt: string | null;
  qrAvailable: boolean;
  lastError?: string | null;
  generation?: number;
  lifecycleState?: string;
};
export type WhatsAppQr = {
  available: boolean;
  qrDataUrl?: string;
  createdAt?: string;
  expiresAt?: string;
  generation?: number;
  lifecycleState?: string;
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
