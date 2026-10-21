import { api } from "@/lib/api/client";

/** Saves language, currency or theme to the account via PATCH /me/preferences; does nothing for guests and ignores errors. */
export function savePreference(signedIn: boolean, preference: { locale?: string; currency?: string; theme?: string }) {
  if (!signedIn) return Promise.resolve();
  return api("/me/preferences", { method: "PATCH", body: preference }).catch(() => undefined);
}
