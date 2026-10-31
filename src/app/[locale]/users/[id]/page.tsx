import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { cache } from "react";
import { apiGetOrNull } from "@/lib/api/server";
import type { Paginated, PublicProfile, Review } from "@/lib/api/types";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { SESSION_COOKIE } from "@/lib/session";
import { describe, pageMetadata } from "@/lib/seo";
import { PublicProfileView, type ProfileTab } from "@/modules/profile";

const loadProfile = cache(async (id: string) => {
  if (!/^\d+$/.test(id)) notFound();
  return (await apiGetOrNull<PublicProfile>(`/users/${id}`)) ?? notFound();
});

/** Search-engine title, description and photo of a public profile; accounts without a profile are not indexed. */
export async function generateMetadata({ params }: PageProps<"/[locale]/users/[id]">) {
  const { locale, id } = await params;
  const data = await loadProfile(id);
  const role = data.profile?.jobTitle ? ` — ${data.profile.jobTitle}` : "";
  return pageMetadata({
    title: `${data.user.fullName}${role}`,
    description: describe(data.profile?.bio) ?? describe(`${data.user.fullName}${role}`),
    path: `/users/${data.user.id}`,
    locale,
    image: data.user.avatarUrl,
    type: "profile",
    // An account without a profile has nothing worth listing in search results.
    noindex: !data.profile,
  });
}

/** Public profile from GET /users/{id}, in tabs; the reviews tab also loads GET /users/{id}/reviews. */
export default async function UserProfilePage({ params, searchParams }: PageProps<"/[locale]/users/[id]">) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const query = await searchParams;
  const tab = (pickParams(query, ["tab"]).tab ?? "overview") as ProfileTab;
  const [data, signedIn] = await Promise.all([loadProfile(id), cookies().then((store) => store.has(SESSION_COOKIE))]);
  const reviews = tab === "reviews" ? await apiGetOrNull<Paginated<Review>>(`/users/${id}/reviews${toQuery({ page: pageParam(query) })}`) : null;

  return (
    <div className="page-container py-10">
      <PublicProfileView data={data} tab={tab} reviews={reviews} signedIn={signedIn} />
    </div>
  );
}
