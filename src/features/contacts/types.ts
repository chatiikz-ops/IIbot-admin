export type ContactStatus = "NEW" | "IN_PROGRESS" | "QUALIFIED" | "REJECTED" | "ERROR";

export type Contact = {
  id: string;
  companyName: string;
  phone: string;
  city?: string | null;
  category?: string | null;
  website?: string | null;
  instagram?: string | null;
  twoGisUrl?: string | null;
  bookingUrl?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  status: ContactStatus;
  businessType?: string | null;
  crmProvider?: string | null;
  strategyCode?: string | null;
  outreachEligible?: boolean | null;
  skipReason?: string | null;
  detectedDomains?: string[] | null;
  classifiedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

export type ContactPayload = {
  companyName: string;
  phone: string;
  city?: string;
  category?: string;
  website?: string;
  instagram?: string;
  twoGisUrl?: string;
  bookingUrl?: string;
  email?: string;
  address?: string;
  notes?: string;
};

export const CONTACT_STATUSES: ContactStatus[] = ["NEW", "IN_PROGRESS", "QUALIFIED", "REJECTED", "ERROR"];
const CONTACT_LABELS:Record<string,string>={NEW:"Новый",IN_PROGRESS:"В работе",QUALIFIED:"Квалифицирован",REJECTED:"Исключён",ERROR:"Ошибка",BEAUTY_SALON:"Салон красоты",BARBERSHOP:"Барбершоп",COSMETOLOGY:"Косметология",CLINIC:"Клиника",DENTAL_CLINIC:"Стоматология",NAIL_STUDIO:"Ногтевая студия",SPA:"SPA / массаж",OTHER:"Другое",UNKNOWN:"Не определено",ZAPIS:"Zapis.kz",ALTEGIO:"Altegio",YCLIENTS:"YCLIENTS",DIKIDI:"DIKIDI",EASYWEEK:"EasyWeek",BOOKSY:"Booksy",FRESHA:"Fresha",EXISTING_ZAPIS_CLIENT:"Клиент уже использует Zapis.kz",MISSING_PHONE:"Не указан телефон",MANUALLY_EXCLUDED:"Исключён вручную",SKIP_EXISTING_CLIENT:"Существующий клиент — не обрабатывать",BEAUTY_COMPETITOR:"Салон — работает с другой CRM",BEAUTY_GENERAL:"Салон красоты — стандартная продажа",GENERIC_COMPETITOR:"Работает с другой CRM",GENERIC_GENERAL:"Общая стратегия"};
export function contactLabel(value?:string|null,fallback="Не определено"){return value?CONTACT_LABELS[value]||fallback:fallback}
