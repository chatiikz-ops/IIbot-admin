export const AUTOMATION_SETTING_FIELDS = [
  "enabled", "autoReplyEnabled", "campaignSendingEnabled",
  "maxAutoRepliesPerConversation", "responseDelayMinSeconds",
  "responseDelayMaxSeconds", "workingHoursEnabled", "workingHoursStart",
  "workingHoursEnd", "timezone",
] as const;

export type AutomationSettingsPatch = {
  enabled: boolean; autoReplyEnabled: boolean; campaignSendingEnabled: boolean;
  maxAutoRepliesPerConversation: number; responseDelayMinSeconds: number;
  responseDelayMaxSeconds: number; workingHoursEnabled: boolean;
  workingHoursStart: string; workingHoursEnd: string; timezone: string;
};

export type AutomationSettings = AutomationSettingsPatch & {
  id: string; singletonKey: string; createdAt: string; updatedAt: string;
};

export function automationSettingsPatch(settings: AutomationSettingsPatch): AutomationSettingsPatch {
  return Object.fromEntries(AUTOMATION_SETTING_FIELDS.map((field) => [field, settings[field]])) as AutomationSettingsPatch;
}
