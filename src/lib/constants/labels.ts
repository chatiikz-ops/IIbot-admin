export const BUSINESS_TYPE_LABELS: Record<string, string> = {
  BEAUTY_SALON: "Салон красоты",
  BARBERSHOP: "Барбершоп",
  COSMETOLOGY: "Косметология",
  CLINIC: "Клиника",
  DENTAL_CLINIC: "Стоматология",
  NAIL_STUDIO: "Ногтевая студия",
  SPA: "SPA / массаж",
  OTHER: "Другое",
  UNKNOWN: "Не определено",
};

export const CRM_PROVIDER_LABELS: Record<string, string> = {
  ZAPIS: "Zapis.kz",
  ALTEGIO: "Altegio",
  YCLIENTS: "YCLIENTS",
  DIKIDI: "DIKIDI",
  EASYWEEK: "EasyWeek",
  BOOKSY: "Booksy",
  FRESHA: "Fresha",
  OTHER: "Другая система",
  UNKNOWN: "Не определена",
};

export const CONTACT_STATUS_LABELS: Record<string, string> = {
  NEW: "Новый",
  IN_PROGRESS: "В работе",
  QUALIFIED: "Заинтересован",
  REJECTED: "Отказ",
  ERROR: "Ошибка",
};

export const CONVERSATION_STATUS_LABELS: Record<string, string> = {
  NEW: "Новый диалог",
  ACTIVE: "Диалог активен",
  WAITING_CLIENT: "Ждём ответа клиента",
  HANDOFF_REQUIRED: "Требуется менеджер",
  QUALIFIED: "Клиент заинтересован",
  REJECTED: "Клиент отказался",
  CLOSED: "Диалог завершён",
};

export const LEAD_STATUS_LABELS: Record<string, string> = {
  NEW: "Новый лид",
  QUALIFIED: "Квалифицирован",
  TRANSFERRED: "Передан менеджеру",
  CLOSED: "Закрыт",
};

export const PROMPT_STRATEGY_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Черновик",
  ACTIVE: "Активна",
  ARCHIVED: "В архиве",
};

export const IMPORT_STATUS_LABELS: Record<string, string> = {
  PREVIEW: "Предварительная проверка",
  READY: "Готов к импорту",
  IMPORTING: "Импортируется",
  COMPLETED: "Завершён",
  FAILED: "Ошибка импорта",
};

export const IMPORT_ROW_STATUS_LABELS: Record<string, string> = {
  VALID: "Корректная строка",
  INVALID: "Ошибка в строке",
  DUPLICATE_IN_FILE: "Дубликат в файле",
  DUPLICATE_IN_DATABASE: "Уже есть в базе",
  IMPORTED: "Импортирована",
};

export const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Черновик", SCHEDULED: "Запланирована", RUNNING: "Работает",
  PAUSED: "На паузе", COMPLETED: "Завершена", CANCELLED: "Отменена",
};

export const CAMPAIGN_TARGET_STATUS_LABELS: Record<string, string> = {
  WAITING: "Ожидает", READY: "Готов", QUEUED: "В очереди", PROCESSING: "Обрабатывается",
  MESSAGE_SENT: "Сообщение отправлено", WAITING_REPLY: "Ждём ответа", REPLIED: "Ответил",
  LEAD: "Лид", HANDOFF: "Передан менеджеру", REJECTED: "Отказ", ERROR: "Ошибка",
  SKIPPED: "Пропущен",
};

export const CAMPAIGN_EVENT_LABELS: Record<string, string> = {
  CREATED: "Кампания создана", CAMPAIGN_CREATED: "Кампания создана",
  STARTED: "Кампания запущена", CAMPAIGN_STARTED: "Кампания запущена",
  PAUSED: "Кампания поставлена на паузу", CAMPAIGN_PAUSED: "Кампания поставлена на паузу",
  RESUMED: "Работа кампании продолжена", CAMPAIGN_RESUMED: "Работа кампании продолжена",
  COMPLETED: "Кампания завершена", CAMPAIGN_COMPLETED: "Кампания завершена",
  CANCELLED: "Кампания отменена", CAMPAIGN_CANCELLED: "Кампания отменена",
  TARGET_STATUS_CHANGED: "Изменён статус контакта кампании",
};

export const CAMPAIGN_SOURCE_LABELS: Record<string, string> = {
  ALL_CONTACTS: "Все контакты", IMPORT_JOB: "Контакты из конкретного импорта",
};

export const WHATSAPP_STATUS_LABELS: Record<string, string> = {
  DISABLED: "WhatsApp отключён в конфигурации",
  IDLE: "WhatsApp не подключён",
  STARTING: "Запускаем WhatsApp...",
  QR_REQUIRED: "Требуется QR-код",
  AUTHENTICATING: "Завершаем подключение",
  CONNECTED: "Подключено",
  DISCONNECTING: "Отключаем WhatsApp...",
  LOGGING_OUT: "Выходим из WhatsApp...",
  ERROR: "Ошибка подключения",
};

export const WHATSAPP_DIRECTION_LABELS: Record<string, string> = {
  INBOUND: "Входящее", OUTBOUND: "Исходящее",
};

export const WHATSAPP_MESSAGE_STATUS_LABELS: Record<string, string> = {
  PENDING: "Ожидает отправки", OUTCOME_UNKNOWN: "Результат отправки неизвестен", SENT: "Отправлено",
  DELIVERED: "Доставлено", READ: "Прочитано", RECEIVED: "Получено",
  FAILED: "Ошибка отправки",
};

export const STRATEGY_LABELS: Record<string, string> = {
  BEAUTY_COMPETITOR: "Салон красоты — работает с другой CRM",
  BEAUTY_GENERAL: "Салон красоты — CRM не определена",
  BARBERSHOP_COMPETITOR: "Барбершоп — работает с другой CRM",
  BARBERSHOP_GENERAL: "Барбершоп — CRM не определена",
  COSMETOLOGY_COMPETITOR: "Косметология — работает с другой CRM",
  COSMETOLOGY_GENERAL: "Косметология — CRM не определена",
  CLINIC_COMPETITOR: "Клиника — работает с другой CRM",
  CLINIC_GENERAL: "Клиника — CRM не определена",
  DENTAL_COMPETITOR: "Стоматология — работает с другой CRM",
  DENTAL_GENERAL: "Стоматология — CRM не определена",
  NAIL_COMPETITOR: "Ногтевая студия — работает с другой CRM",
  NAIL_GENERAL: "Ногтевая студия — CRM не определена",
  SPA_COMPETITOR: "SPA / массаж — работает с другой CRM",
  SPA_GENERAL: "SPA / массаж — CRM не определена",
  GENERIC_COMPETITOR: "Общая стратегия — работает с другой CRM",
  GENERIC_GENERAL: "Общая стратегия — CRM не определена",
  SKIP_EXISTING_CLIENT: "Не обрабатывать — клиент Zapis.kz",
};

export const SKIP_REASON_LABELS: Record<string, string> = {
  EXISTING_ZAPIS_CLIENT: "Уже является клиентом Zapis.kz",
  MISSING_PHONE: "Не указан номер телефона",
  MANUALLY_EXCLUDED: "Исключён вручную",
};

export const FIELD_LABELS: Record<string, string> = {
  companyName: "Компания", phone: "Телефон", city: "Город", category: "Категория",
  businessType: "Тип бизнеса", crmProvider: "CRM", strategyCode: "Стратегия",
  outreachEligible: "Обработка", skipReason: "Причина исключения", status: "Статус",
  classifiedAt: "Классифицирован", createdAt: "Создан", updatedAt: "Изменён",
  processed: "Обработано", zapisClientsSkipped: "Клиенты Zapis.kz исключены",
  competitorUsers: "Используют другую CRM", unknownCrm: "CRM не определена",
  businessTypes: "Типы бизнеса", strategies: "Стратегии", summary: "Итоги",
  total: "Всего", valid: "Корректные", invalid: "С ошибками",
  duplicateInFile: "Дубликаты в файле", duplicateInDatabase: "Уже есть в базе",
  imported: "Импортировано", errors: "Ошибки", normalizedData: "Подготовленные данные",
  website: "Сайт", instagram: "Instagram", twoGisUrl: "2GIS", bookingUrl: "Ссылка записи",
  email: "Email", address: "Адрес", notes: "Заметки", ignore: "Не импортировать",
  detectedColumns: "Найденные колонки", mapping: "Сопоставление", unmappedColumns: "Не сопоставлены",
  ambiguousColumns: "Требуют уточнения", previewRows: "Предварительный просмотр", fileName: "Файл",
};

export type EntityLabelContext = "contact" | "conversation" | "lead" | "strategy" | "import" | "campaign" | "campaignTarget" | "generic";

export function enumLabel(value: unknown, context: EntityLabelContext = "generic"): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Да" : "Нет";
  const key = String(value);
  const statusLabels = context === "contact" ? CONTACT_STATUS_LABELS
    : context === "conversation" ? CONVERSATION_STATUS_LABELS
    : context === "lead" ? LEAD_STATUS_LABELS
    : context === "strategy" ? PROMPT_STRATEGY_STATUS_LABELS
    : context === "import" ? IMPORT_STATUS_LABELS
    : context === "campaign" ? CAMPAIGN_STATUS_LABELS
    : context === "campaignTarget" ? CAMPAIGN_TARGET_STATUS_LABELS : {};
  return statusLabels[key]
    || BUSINESS_TYPE_LABELS[key]
    || CRM_PROVIDER_LABELS[key]
    || STRATEGY_LABELS[key]
    || SKIP_REASON_LABELS[key]
    || IMPORT_STATUS_LABELS[key]
    || IMPORT_ROW_STATUS_LABELS[key]
    || CAMPAIGN_STATUS_LABELS[key]
    || CAMPAIGN_TARGET_STATUS_LABELS[key]
    || CAMPAIGN_EVENT_LABELS[key]
    || CAMPAIGN_SOURCE_LABELS[key]
    || WHATSAPP_STATUS_LABELS[key]
    || WHATSAPP_DIRECTION_LABELS[key]
    || WHATSAPP_MESSAGE_STATUS_LABELS[key]
    || humanizeUnknown(key);
}

export function fieldValueLabel(field: string, value: unknown, context: EntityLabelContext = "generic"): string {
  if (field === "businessType") return lookup(BUSINESS_TYPE_LABELS, value);
  if (field === "crmProvider") return lookup(CRM_PROVIDER_LABELS, value);
  if (field === "strategyCode") return lookup(STRATEGY_LABELS, value);
  if (field === "skipReason") return lookup(SKIP_REASON_LABELS, value);
  if (field === "outreachEligible") return value === true ? "Да" : value === false ? "Нет" : "—";
  if (field === "status") return enumLabel(value, context);
  return enumLabel(value, context);
}

export function fieldLabel(field: string, context: EntityLabelContext = "generic"): string {
  if (FIELD_LABELS[field]) return FIELD_LABELS[field];
  const translatedEnum = enumLabel(field, context);
  if (translatedEnum !== field) return translatedEnum;
  const text = field.replace(/([a-z])([A-Z])/g, "$1 $2").replaceAll("_", " ").toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function lookup(labels: Record<string, string>, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  const key = String(value);
  return labels[key] || humanizeUnknown(key);
}

function humanizeUnknown(value: string): string {
  if (!/^[A-Z][A-Z0-9_]*$/.test(value)) return value;
  return `Неизвестное значение (${value})`;
}
