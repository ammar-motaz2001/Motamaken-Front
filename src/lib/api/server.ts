import { cookies, headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { getLocale } from "next-intl/server";
import { SESSION_COOKIE } from "@/lib/session";
import { ApiError, toApiError } from "./errors";
import { visitorHeaders } from "./visitor";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

/**
 * When this server reaches the API by an internal address (`http://api:10000`), tells it the public one so the links it
 * builds (signed KYC, dispute and chat files) open in the browser instead of pointing at the container.
 */
const PUBLIC_HOST_HEADERS = ((): Record<string, string> => {
  const internal = process.env.API_URL;
  const pub = process.env.NEXT_PUBLIC_API_URL;
  if (!internal || !pub) return {};
  try {
    const url = new URL(pub);
    if (url.host === new URL(internal).host) return {};
    const https = url.protocol === "https:";
    return { "X-Forwarded-Host": url.hostname, "X-Forwarded-Proto": https ? "https" : "http", "X-Forwarded-Port": url.port || (https ? "443" : "80") };
  } catch {
    return {};
  }
})();

/** Server-side GET to the API with the session token and visitor headers; a revoked token signs the user out, errors throw ApiError. */
export async function apiGet<T>(path: string): Promise<T> {
  if (!API_URL) throw new ApiError(503);

  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      Accept: "application/json",
      "Accept-Language": await getLocale(),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...visitorHeaders(await headers()),
      ...PUBLIC_HOST_HEADERS,
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

/** Like apiGet but returns null on API errors (Next.js redirects and not-found still pass through). */
export async function apiGetOrNull<T>(path: string): Promise<T | null> {
  return apiGet<T>(path).catch((error: unknown) => {
    unstable_rethrow(error);
    return null;
  });
}

/**
 * Public reference data (categories, countries, currencies, site settings) that is the same for every visitor: fetched
 * without the session or visitor headers and kept in the Next.js data cache for a minute, so a page render does not
 * hit the API for it each time. Null on API errors.
 */
export async function apiGetPublic<T>(path: string, revalidate = 60): Promise<T | null> {
  if (!API_URL) return null;
  try {
    const response = await fetch(`${API_URL}${path}`, {
      headers: { Accept: "application/json", "Accept-Language": await getLocale() },
      next: { revalidate },
    });
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}
