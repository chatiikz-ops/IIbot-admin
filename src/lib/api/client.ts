const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const DEFAULT_TIMEOUT = 15000;

export class ApiError extends Error {
  constructor(message: string, public status: number, public details?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

type QueryValue = string | number | boolean | null | undefined;
type RequestOptions = { query?: Record<string, QueryValue>; body?: unknown; signal?: AbortSignal; timeout?: number };

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(path, API_URL.endsWith("/") ? API_URL : `${API_URL}/`);
  Object.entries(options.query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, String(value));
  });
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeout ?? DEFAULT_TIMEOUT);
  const abort = () => controller.abort();
  options.signal?.addEventListener("abort", abort, { once: true });
  const isForm = options.body instanceof FormData;
  const requestBody: BodyInit | undefined = options.body === undefined
    ? undefined
    : isForm ? options.body as FormData : JSON.stringify(options.body);
  try {
    const response = await fetch(url, {
      method,
      headers: options.body && !isForm ? { "Content-Type": "application/json" } : undefined,
      body: requestBody,
      signal: controller.signal,
      cache: "no-store",
    });
    if (response.status === 204) return undefined as T;
    const text = await response.text();
    let payload: unknown;
    try { payload = text ? JSON.parse(text) : undefined; } catch { payload = text; }
    if (!response.ok) {
      const data = payload as { message?: string | string[] } | undefined;
      const backendMessage = Array.isArray(data?.message) ? data.message.join(". ") : data?.message;
      throw new ApiError(backendMessage || `Ошибка запроса (${response.status})`, response.status, payload);
    }
    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted) throw new ApiError("Запрос отменён или превысил время ожидания", 0, error);
    throw new ApiError("Не удалось подключиться к backend", 0, error);
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", abort);
  }
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, "body">) => request<T>("GET", path, options),
  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "body">) => request<T>("POST", path, { ...options, body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "body">) => request<T>("PATCH", path, { ...options, body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "body">) => request<T>("DELETE", path, options),
};

export function unpackList<T>(payload: unknown): { items: T[]; total: number } {
  if (Array.isArray(payload)) return { items: payload as T[], total: payload.length };
  const value = (payload || {}) as Record<string, unknown>;
  const items = (value.items || value.data || value.results || []) as T[];
  const meta = (value.meta || {}) as Record<string, unknown>;
  return { items: Array.isArray(items) ? items : [], total: Number(value.total ?? meta.total ?? items.length ?? 0) };
}

export { API_URL };
