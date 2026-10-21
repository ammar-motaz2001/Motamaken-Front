import { api } from "@/lib/api/client";
import type { Profile } from "@/lib/api/types";

/** Saves one profile section with PUT /me/profile, resending the basics the endpoint requires; returns the updated profile. */
export async function saveSection(profile: Profile, section: Record<string, unknown>) {
  const { data } = await api<{ data: Profile }>("/me/profile", {
    method: "PUT",
    body: { type: profile.type, jobTitle: profile.jobTitle, bio: profile.bio, countryId: profile.countryId, cityId: profile.cityId, ...section },
  });
  return data;
}

/** First field error message from an API error, to show above a form. */
export function firstError(fields: Record<string, string>) {
  return Object.values(fields)[0];
}
