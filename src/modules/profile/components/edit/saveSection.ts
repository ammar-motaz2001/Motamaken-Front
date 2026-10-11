import { api } from "@/lib/api/client";
import type { Profile } from "@/lib/api/types";

export async function saveSection(profile: Profile, section: Record<string, unknown>) {
  const { data } = await api<{ data: Profile }>("/me/profile", {
    method: "PUT",
    body: { type: profile.type, jobTitle: profile.jobTitle, bio: profile.bio, countryId: profile.countryId, cityId: profile.cityId, ...section },
  });
  return data;
}

export function firstError(fields: Record<string, string>) {
  return Object.values(fields)[0];
}
