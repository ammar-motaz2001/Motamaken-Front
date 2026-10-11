import { ApiError, toApiError } from "./errors";

type Body = Record<string, unknown> | FormData;

export async function api<T>(path: string, options: { method?: string; body?: Body } = {}): Promise<T> {
  const { method = "GET", body } = options;
  const isForm = body instanceof FormData;

  const response = await fetch(`/api/backend${path}`, {
    method,
    headers: {
      Accept: "application/json",
      "Accept-Language": document.documentElement.lang,
      ...(body && !isForm ? { "Content-Type": "application/json" } : {}),
    },
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  }).catch(() => {
    throw new ApiError(503);
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw toApiError(response.status, data);
  return data as T;
}
