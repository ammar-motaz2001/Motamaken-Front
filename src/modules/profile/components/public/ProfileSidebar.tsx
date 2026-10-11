import { BadgeCheck, CircleDashed, Clock, MapPin, Pencil } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { HireButton } from "@/components/cards/HireButton";
import { Stars } from "@/components/ui/Stars";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Link } from "@/i18n/navigation";
import type { PublicProfile } from "@/lib/api/types";
import { ReportButton } from "@/modules/reports";
import { MedalIcon } from "@/modules/rewards";

export async function ProfileSidebar({ data, signedIn }: { data: PublicProfile; signedIn: boolean }) {
  const t = await getTranslations("PublicProfile");
  const format = await getFormatter();
  const { user, profile, stats } = data;
  const location = [profile?.city, profile?.country].filter(Boolean).join(", ");

  return (
    <aside className="flex flex-col gap-4">
      <section className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface p-5 text-center">
        <span className="text-xs font-bold text-muted">{t("personalInfo")}</span>
        <UserAvatar name={user.fullName} src={user.avatarUrl} size={96} online={user.isOnline} />
        <div>
          <h1 className="text-lg font-bold">{user.fullName}</h1>
          {profile && <p className="text-sm text-brand">{profile.jobTitle}</p>}
        </div>
        <span className="flex items-center gap-1.5 text-xs text-muted">
          <Stars rating={stats.rating} label={t("rating", { rating: stats.rating })} />
          {stats.rating.toFixed(1)} ({stats.reviewsCount})
        </span>
        <ul className="flex flex-col gap-1 text-xs text-muted">
          {location && (
            <li className="flex items-center justify-center gap-1">
              <MapPin className="size-3.5" />
              {location}
            </li>
          )}
          <li className="flex items-center justify-center gap-1">
            <Clock className="size-3.5" />
            {user.isOnline
              ? t("online")
              : user.lastSeenAt
                ? t("lastSeen", { date: format.relativeTime(new Date(user.lastSeenAt)) })
                : t("memberSince", { date: format.dateTime(new Date(user.memberSince), { month: "long", year: "numeric" }) })}
          </li>
        </ul>
        {data.isMe ? (
          <Link href="/profile" className="flex w-full items-center justify-center gap-1.5 rounded-md border border-brand py-2 text-sm font-medium text-brand hover:bg-brand-soft">
            <Pencil className="size-4" />
            {t("edit")}
          </Link>
        ) : (
          <div className="flex w-full gap-2">
            <HireButton userId={user.id} signedIn={signedIn} />
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-bold">{t("verifications")}</h2>
        <ul className="flex flex-col gap-1.5 text-sm">
          {(["identity", "email", "phone"] as const).map((key) => (
            <li key={key} className={`flex items-center gap-2 ${user.verified[key] ? "" : "text-muted"}`}>
              {user.verified[key] ? <BadgeCheck className="size-4 text-brand" aria-hidden /> : <CircleDashed className="size-4 text-placeholder" aria-hidden />}
              {t(user.verified[key] ? `verified.${key}` : `notVerified.${key}`)}
            </li>
          ))}
        </ul>
      </section>

      {data.medals.length > 0 && (
        <section className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
          <h2 className="text-sm font-bold">{t("medals")}</h2>
          <ul className="flex flex-wrap gap-2">
            {data.medals.map((medal) => (
              <li key={medal.code} title={medal.name}>
                <MedalIcon code={medal.code} size={36} />
                <span className="sr-only">{medal.name}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {profile?.skills && profile.skills.length > 0 && (
        <section className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
          <h2 className="text-sm font-bold">{t("skills")}</h2>
          <ul className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <li key={skill} className="rounded-full bg-brand-soft px-2.5 py-1 text-xs text-brand-ink">
                {skill}
              </li>
            ))}
          </ul>
        </section>
      )}

      {profile?.languages && profile.languages.length > 0 && (
        <section className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4">
          <h2 className="text-sm font-bold">{t("languages")}</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {profile.languages.map((language) => (
              <li key={language.name} className="flex justify-between gap-2">
                <span>{language.name}</span>
                <span className="text-xs text-muted">{t(`levels.${language.level}`)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!data.isMe && <ReportButton targetType="user" targetId={user.id} signedIn={signedIn} className="self-center" label={t("report")} />}
    </aside>
  );
}
