export type ImportMapping = Record<string, string>;

export const IMPORT_FIELDS = [
  ["", "Не использовать"], ["companyName", "Компания"], ["phone", "Телефон"], ["whatsapp", "WhatsApp"],
  ["city", "Город"], ["category", "Категория"], ["website", "Сайт"],
  ["instagram", "Instagram"], ["twoGisUrl", "2GIS"], ["bookingUrl", "Ссылка записи"],
  ["email", "Email"], ["address", "Адрес"], ["notes", "Заметки"],
] as const;

export function missingRequiredMapping(mapping: ImportMapping) {
  const values = Object.values(mapping);
  return {
    companyName: !values.includes("companyName"),
    phone: !values.includes("phone") && !values.includes("whatsapp"),
  };
}

export function canConfirmMapping(mapping: ImportMapping) {
  const missing = missingRequiredMapping(mapping);
  return !missing.companyName && !missing.phone;
}

export function importCampaignHref(importId: string) {
  return `/campaigns?importId=${encodeURIComponent(importId)}`;
}

export function summaryNumber(value: Record<string, unknown> | null, ...keys: string[]) {
  const summary = (value?.summary || {}) as Record<string, unknown>;
  for (const key of keys) {
    const candidate = summary[key] ?? value?.[key];
    if (typeof candidate === "number") return candidate;
  }
  return 0;
}
