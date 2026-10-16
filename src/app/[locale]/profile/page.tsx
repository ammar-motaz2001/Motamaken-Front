import { ExternalLink } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCountries, getSummary } from "@/lib/api/reference";
import { apiGetOrNull } from "@/lib/api/server";
import type { Profile } from "@/lib/api/types";
import { ProfileForm, ProfileSections } from "@/modules/profile";

export async function generateMetadata({ params }: PageProps<"/[locale]/profile">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Profile" });
  return { title: `${t("title")} | Mutamakin` };
}

export default async function ProfilePage({ params }: PageProps<"/[locale]/profile">) {
  setRequestLocale((await params).locale);
  const [profile, countries, summary, t] = await Promise.all([
    apiGetOrNull<{ data: Profile }>("/me/profile"),
    getCountries(),
    getSummary(),
    getTranslations("Profile"),
  ]);

  return (
    <div className="page-container flex flex-col gap-6 py-10">
      <ProfileForm profile={profile?.data ?? null} countries={countries} />
      {profile && summary && (
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-4">
          <Link href={`/users/${summary.user.id}`} className="flex items-center gap-1.5 self-end text-sm font-medium text-brand hover:underline">
            <ExternalLink className="size-4" />
            {t("viewPublic")}
          </Link>
          <ProfileSections initial={profile.data} />
        </div>
      )}
    </div>
  );
}
