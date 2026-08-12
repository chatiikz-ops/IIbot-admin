export type Entity = Record<string, unknown> & { id?: string; createdAt?: string; status?: string };
export type BackendState = "checking" | "online" | "offline";
