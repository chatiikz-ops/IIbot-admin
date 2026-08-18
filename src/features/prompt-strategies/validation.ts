import type { PromptDraft } from "./types.ts";

export type PromptDraftErrors = Partial<Record<"requiredText" | "qualificationQuestions" | "sellingPoints" | "forbiddenActions" | "maxAssistantMessages", string>>;
const REQUIRED_TEXT_FIELDS = ["systemInstruction", "objective", "firstMessage", "communicationRules", "handoffRules", "stopRules", "closingRules"] as const;

export function cleanPromptList(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

export function validatePromptDraft(draft: PromptDraft): PromptDraftErrors {
  const errors: PromptDraftErrors = {};
  if (REQUIRED_TEXT_FIELDS.some((field) => !draft[field].trim())) errors.requiredText = "Заполните все обязательные текстовые поля стратегии.";
  if (!cleanPromptList(draft.qualificationQuestions).length) errors.qualificationQuestions = "Добавьте хотя бы один вопрос для квалификации клиента.";
  if (!cleanPromptList(draft.sellingPoints).length) errors.sellingPoints = "Добавьте хотя бы один аргумент Zapis.kz.";
  if (!cleanPromptList(draft.forbiddenActions).length) errors.forbiddenActions = "Добавьте хотя бы одно запрещённое действие.";
  if (!Number.isInteger(draft.maxAssistantMessages) || draft.maxAssistantMessages < 1 || draft.maxAssistantMessages > 10) errors.maxAssistantMessages = "Количество сообщений AI должно быть целым числом от 1 до 10.";
  return errors;
}
