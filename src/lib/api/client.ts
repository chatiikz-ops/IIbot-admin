const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
const DEFAULT_TIMEOUT = 15000;
let accessToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;
const authListeners = new Set<() => void>();
export function setAccessToken(token:string|null){accessToken=token;authListeners.forEach(listener=>listener())}
export function getAccessToken(){return accessToken}
export function subscribeAuth(listener:()=>void){authListeners.add(listener);return()=>{authListeners.delete(listener)}}

export class ApiError extends Error {
  constructor(message: string, public status: number, public details?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

type QueryValue = string | number | boolean | null | undefined;
type RequestOptions = { query?: Record<string, QueryValue>; body?: unknown; signal?: AbortSignal; timeout?: number };

async function request<T>(method: string, path: string, options: RequestOptions = {}, retry=true): Promise<T> {
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
      headers: { ...(options.body && !isForm ? { "Content-Type": "application/json" } : {}), ...(accessToken ? { Authorization:`Bearer ${accessToken}` } : {}) },
      body: requestBody,
      signal: controller.signal,
      cache: "no-store",
      credentials: "include",
    });
    if (response.status === 204) return undefined as T;
    const text = await response.text();
    let payload: unknown;
    try { payload = text ? JSON.parse(text) : undefined; } catch { payload = text; }
    if(response.status===401&&retry&&!path.startsWith('/auth/')){if(await refreshAccessToken())return request<T>(method,path,options,false)}
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

export async function refreshAccessToken(){if(refreshPromise)return refreshPromise;refreshPromise=(async()=>{try{const response=await fetch(new URL('/auth/refresh',API_URL.endsWith('/')?API_URL:`${API_URL}/`),{method:'POST',credentials:'include'});if(!response.ok)throw new Error();const data=await response.json() as {accessToken:string};setAccessToken(data.accessToken);return true}catch{setAccessToken(null);return false}finally{refreshPromise=null}})();return refreshPromise}

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
