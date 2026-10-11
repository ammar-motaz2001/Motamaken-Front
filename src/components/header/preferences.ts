import { api } from "@/lib/api/client";

export function savePreference(signedIn: boolean, preference: { locale?: string; currency?: string; theme?: string }) {
  if (!signedIn) return Promise.resolve();
  return api("/me/preferences", { method: "PATCH", body: preference }).catch(() => undefined);
}
