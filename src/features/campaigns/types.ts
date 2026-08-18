import type { CampaignTargetStatus } from "@/src/lib/constants/backend-enums";

export type CampaignStatus = "DRAFT" | "SCHEDULED" | "RUNNING" | "PAUSED" | "COMPLETED" | "CANCELLED";
export type CampaignSourceType = "ALL_CONTACTS" | "IMPORT_JOB";

export type CampaignFilters = {
  businessType?: string;
  crmProvider?: string;
  city?: string;
  category?: string;
  strategyCode?: string;
  contactStatus?: string;
  outreachEligible?: boolean;
};

export type CampaignSettings = {
  workingHoursStart: string;
  workingHoursEnd: string;
  dailyMessageLimit: number;
  minDelaySeconds: number;
  maxDelaySeconds: number;
  timezone: string;
};

export type Campaign = Record<string, unknown> & {
  id: string;
  name: string;
  description?: string | null;
  status: CampaignStatus;
  sourceType?: CampaignSourceType;
  importId?: string | null;
  sourceImportJobId?: string | null;
  filters?: CampaignFilters;
  settings?: CampaignSettings;
  totalTargets?: number;
  selectedCount?: number;
  processedTargets?: number;
  repliedTargets?: number;
  leadTargets?: number;
  rejectedTargets?: number;
  handoffTargets?: number;
  processedCount?: number;
  repliedCount?: number;
  leadCount?: number;
  rejectedCount?: number;
  handoffCount?: number;
  errorCount?: number;
  createdAt?: string;
  updatedAt?: string;
  messageSentAt?: string;
  errorMessage?: string | null;
  strategyCode?: string | null;
};

export type CampaignTarget = Record<string, unknown> & {
  id: string;
  status: CampaignTargetStatus;
  contact?: Record<string, unknown>;
  contactId?: string;
  updatedAt?: string;
  strategyCode?: string | null;
  messageSentAt?: string | null;
  errorMessage?: string | null;
};

export type CampaignLog = Record<string, unknown> & {
  id?: string;
  eventType?: string;
  event?: string;
  type?: string;
  message?: string;
  createdAt?: string;
  metadata?: unknown;
};

export type CampaignDraft = {
  name: string;
  description: string;
  sourceType: CampaignSourceType;
  importId: string;
  filters: CampaignFilters;
  settings: CampaignSettings;
};
