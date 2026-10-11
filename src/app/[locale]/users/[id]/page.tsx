import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { cache } from "react";
import { apiGetOrNull } from "@/lib/api/server";
import type { Paginated, PublicProfile, Review } from "@/lib/api/types";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { SESSION_COOKIE } from "@/lib/session";
import { PublicProfileView, type ProfileTab } from "@/modules/profile";

const loadProfile = cache(async (id: string) => {
  if (!/^\d+$/.test(id)) notFound();
  return (await apiGetOrNull<PublicProfile>(`/users/${id}`)) ?? notFound();
});

export async function generateMetadata({ params }: PageProps<"/[locale]/users/[id]">) {
  const data = await loadProfile((await params).id);
  const role = data.profile?.jobTitle ? ` — ${data.profile.jobTitle}` : "";
  return { title: `${data.user.fullName}${role} | Motamakin`, description: data.profile?.bio?.slice(0, 160) };
}

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
