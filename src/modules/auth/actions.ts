"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { SESSION_COOKIE } from "@/lib/session";

const MAX_AGE = 60 * 60 * 24 * 7;

/** Server action: stores the API token in an http-only session cookie and refreshes every page's data. */
export async function createSession(token: string) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
  revalidatePath("/", "layout");
}

/** Server action: logs the token out at POST /auth/logout (best effort) and removes the session cookie. */
export async function deleteSession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (token && apiUrl) {
    await fetch(`${apiUrl}/auth/logout`, {
      method: "POST",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    }).catch(() => undefined);
  }

  store.delete(SESSION_COOKIE);
  revalidatePath("/", "layout");
}
