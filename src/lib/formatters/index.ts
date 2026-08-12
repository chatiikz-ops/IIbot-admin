export const safe = (value: unknown) => value === null || value === undefined || value === "" ? "—" : String(value);
export const shortId = (value: unknown) => typeof value === "string" ? `${value.slice(0, 8)}…` : "—";
export const dateTime = (value: unknown) => {
  if (!value) return "—";
  const date = new Date(String(value));
  return Number.isNaN(date.valueOf()) ? "—" : new Intl.DateTimeFormat("ru-KZ", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Almaty" }).format(date);
};
export const phone = (value: unknown) => safe(value);
