import { Clock, MapPin, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Stars } from "@/components/ui/Stars";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Link } from "@/i18n/navigation";
import type { ProfileCard, Project } from "@/lib/api/types";
import { formatAmount, timeAgo } from "@/lib/format";
import { buttonClasses } from "@/components/ui/Button";

/** List-view row of a project: title, budget, category, location and date. */
export function ProjectRow({ project }: { project: Project }) {
  const t = useTranslations("Search.rows");
  const locale = useLocale();
  const { min, max, currency } = project.budget;
  const location = [project.city, project.country].filter(Boolean).join(", ");

  return (
    <li className="flex flex-col gap-2 border-b border-border py-4 last:border-0 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1.5">
        <Link href={`/projects/${project.id}`} className="font-bold hover:text-brand">
          {project.title} <span className="text-xs font-normal text-brand">· {project.category.name}</span>
        </Link>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <li className="flex items-center gap-1">
            <User className="size-3.5" />
            <Link href={`/users/${project.owner.id}`} className="hover:text-brand">
              {project.owner.fullName}
            </Link>
          </li>
          <li className="flex items-center gap-1" suppressHydrationWarning>
            <Clock className="size-3.5" />
            {timeAgo(project.createdAt, locale)}
          </li>
          {location && (
            <li className="flex items-center gap-1">
              <MapPin className="size-3.5" />
              {location}
            </li>
          )}
          {project.proposalsCount != null && <li>{t("offers", { count: project.proposalsCount })}</li>}
        </ul>
        <p className="line-clamp-2 text-sm">{project.excerpt}</p>
      </div>
      <div className="flex shrink-0 flex-row items-center gap-3 sm:flex-col sm:items-end">
        <span className="rounded-lg border border-brand-ink bg-brand-soft px-3 py-1 text-xs font-medium text-brand-ink">
          {t("budget", { min: formatAmount(min, currency, locale), max: formatAmount(max, currency, locale) })}
        </span>
        <Link href={`/projects/${project.id}`} className={buttonClasses({ size: "xs" })}>
          {t("addOffer")}
        </Link>
      </div>
    </li>
  );
}

/** List-view row of a freelancer or influencer: photo, name, role, rating and location. */
export function ProfileRow({ profile }: { profile: ProfileCard }) {
  const t = useTranslations("Search.rows");
  const location = [profile.city, profile.country].filter(Boolean).join(", ");

  return (
    <li className="flex items-center gap-3 border-b border-border py-3 last:border-0">
      <UserAvatar name={profile.fullName} src={profile.avatarUrl} size={52} />
      <div className="min-w-0 flex-1">
        <Link href={`/users/${profile.userId}`} className="font-bold hover:text-brand">
          {profile.fullName}
        </Link>
        <p className="truncate text-sm text-brand">{profile.jobTitle}</p>
        <p className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <Stars rating={profile.rating} size={12} label={t("rating", { rating: profile.rating })} />
          {profile.rating.toFixed(1)} ({profile.reviewsCount}){location && ` · ${location}`}
        </p>
      </div>
      <Link href={`/users/${profile.userId}`} className="shrink-0 rounded-md border border-brand px-4 py-1.5 text-xs font-medium text-brand hover:bg-brand-soft">
        {t("viewProfile")}
      </Link>
    </li>
  );
}
