export type WhatsAppState = "CONNECTED" | "QR_REQUIRED" | "INITIALIZING" | "DISCONNECTED" | "ERROR" | string;
export type WhatsAppStatus = {
  enabled: boolean;
  status: WhatsAppState;
  connected: boolean;
  phoneNumber: string | null;
  displayName: string | null;
  lastConnectedAt: string | null;
  lastDisconnectedAt: string | null;
  qrAvailable: boolean;
};
export type WhatsAppQr = { available: boolean; qrDataUrl?: string; createdAt?: string; expiresAt?: string };
export type WhatsAppMessage = Record<string,unknown> & { id:string; direction?:string; phone?:string; phoneNumber?:string; to?:string; from?:string; body?:string; text?:string; message?:string; status?:string; createdAt?:string };
