export type TelegramStatus = {
  enabled: boolean;
  configured: boolean;
  botReachable: boolean;
  connectedRecipients: number;
  primaryRecipientConnected: boolean;
};

export type TelegramRecipient = Record<string, unknown> & {
  id: string;
  name?: string;
  status?: string;
  enabled?: boolean;
  connected?: boolean;
  username?: string;
  telegramUsername?: string;
  connectedAt?: string;
  updatedAt?: string;
};

export type TelegramSettingsData = Record<string, unknown> & {
  enabled: boolean;
  notifyOnHandoff: boolean;
  notifyOnClientRequestedManager: boolean;
  notifyOnNewLead: boolean;
  notifyOnQualifiedLead: boolean;
  notifyOnAiUncertain: boolean;
  notifyOnAiFailure: boolean;
  notifyOnWhatsAppFailure: boolean;
  notifyOnMediaFailure: boolean;
  notifyOnAutomationFailure: boolean;
  notifyOnSystemError: boolean;
};

export type TelegramNotification = Record<string, unknown> & { id: string; createdAt?: string; type?: string; status?: string; title?: string; message?: string; error?: string };
