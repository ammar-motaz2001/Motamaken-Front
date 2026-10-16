import { cookies, headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { getLocale } from "next-intl/server";
import { SESSION_COOKIE } from "@/lib/session";
import { ApiError, toApiError } from "./errors";
import { visitorHeaders } from "./visitor";

export const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

export async function apiGet<T>(path: string): Promise<T> {
  if (!API_URL) throw new ApiError(503);

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Accept: "application/json",
      "Accept-Language": await getLocale(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...visitorHeaders(await headers()),
    },
    cache: "no-store",
  }).catch(() => {
    throw new ApiError(503);
  });

  // The token was revoked (password change, "log out other devices") or expired: drop it and sign in again.
  if (response.status === 401 && token) redirect("/api/session/expired");

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw toApiError(response.status, data);
  return data as T;
}

export async function apiGetOrNull<T>(path: string): Promise<T | null> {
  return apiGet<T>(path).catch((error: unknown) => {
    unstable_rethrow(error);
    return null;
  });
}
