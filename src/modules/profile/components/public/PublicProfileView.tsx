import { Briefcase, GraduationCap, Award } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { Pagination } from "@/components/ui/Pagination";
import { Stars } from "@/components/ui/Stars";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Link } from "@/i18n/navigation";
import type { Paginated, PublicProfile, Review } from "@/lib/api/types";
import { ReportButton } from "@/modules/reports";
import { PortfolioGallery } from "./PortfolioGallery";
import { ProfileSidebar } from "./ProfileSidebar";

export type ProfileTab = "overview" | "portfolio" | "reviews" | "channels" | "projects";

type PublicProfileViewProps = { data: PublicProfile; tab: ProfileTab; reviews: Paginated<Review> | null; signedIn: boolean };

export async function PublicProfileView({ data, tab, reviews, signedIn }: PublicProfileViewProps) {
  const t = await getTranslations("PublicProfile");
  const format = await getFormatter();
  const { profile, stats, user } = data;
  const tabs: ProfileTab[] = [
    "overview",
    ...(profile ? (["portfolio"] as const) : []),
    "reviews",
    ...(profile?.type === "influencer" ? (["channels"] as const) : []),
    ...(data.openProjects.length || !profile ? (["projects"] as const) : []),
  ];
  const active = tabs.includes(tab) ? tab : "overview";
  const month = (value: string) => format.dateTime(new Date(`${value}-01T00:00:00`), { month: "short", year: "numeric" });

  const statTiles = profile
    ? [
        ["completedJobs", stats.completedJobs],
        ["ongoingJobs", stats.ongoingJobs],
        ["reviewsCount", stats.reviewsCount],
        ["rating", stats.rating.toFixed(1)],
      ]
    : [
        ["postedProjects", stats.postedProjects],
        ["completedProjects", stats.completedProjects],
        ["reviewsCount", stats.reviewsCount],
        ["rating", stats.rating.toFixed(1)],
      ];

  return (
    <div className="flex flex-col gap-5">
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <Link href="/" className="hover:text-brand">
          {t("home")}
        </Link>{" "}
        / <span className="font-bold text-foreground">{user.fullName}</span>
      </nav>
      <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <ProfileSidebar data={data} signedIn={signedIn} />

        <div className="flex min-w-0 flex-col gap-5">
          <nav className="grid rounded-lg border border-border bg-surface p-1" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }} aria-label={t("sections")}>
            {tabs.map((name) => (
              <Link
                key={name}
                href={`/users/${user.id}${name === "overview" ? "" : `?tab=${name}`}`}
                aria-current={active === name ? "page" : undefined}
                className={`rounded-md px-2 py-2 text-center text-sm font-medium ${active === name ? "bg-gradient-brand text-white" : "text-muted hover:text-foreground"}`}
              >
                {t(`tabs.${name}`)}
              </Link>
            ))}
          </nav>

          {active === "overview" && (
            <>
              <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
                <h2 className="mb-3 text-base font-bold">{t("statistics")}</h2>
                <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {statTiles.map(([key, value]) => (
                    <div key={key} className="rounded-lg bg-surface-muted p-3 text-center">
                      <dd className="text-xl font-bold text-brand">{value}</dd>
                      <dt className="text-xs text-muted">{t(`stats.${key}`)}</dt>
                    </div>
                  ))}
                </dl>
              </section>

              <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
                <h2 className="mb-2 text-base font-bold">{t("about")}</h2>
                <p className="text-sm leading-relaxed whitespace-pre-line text-muted">{profile?.bio || t("noBio")}</p>
              </section>

              {[
                ["experience", Briefcase, profile?.experiences?.map((item) => [item.title, item.company, `${month(item.from)} – ${item.to ? month(item.to) : t("present")}`, item.description])],
                ["education", GraduationCap, profile?.educations?.map((item) => [item.degree, item.school, `${item.from} – ${item.to ?? t("present")}`, null])],
                ["certificates", Award, profile?.certificates?.map((item) => [item.name, item.issuer, String(item.year), item.url])],
              ]
                .filter(([, , rows]) => (rows as unknown[] | undefined)?.length)
                .map(([key, Icon, rows]) => {
                  const SectionIcon = Icon as typeof Briefcase;
                  return (
                    <section key={key as string} className="rounded-xl border border-border bg-surface p-4 sm:p-5">
                      <h2 className="mb-3 text-base font-bold">{t(key as string)}</h2>
                      <ul className="flex flex-col gap-3">
                        {(rows as (string | null | undefined)[][]).map(([title, subtitle, period, extra], index) => (
                          <li key={index} className="flex gap-3">
                            <SectionIcon className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
                            <div className="text-sm">
                              <p className="font-bold">{title}</p>
                              <p className="text-muted">
                                {subtitle} · {period}
                              </p>
                              {extra &&
                                (key === "certificates" ? (
                                  <a href={extra} target="_blank" rel="noreferrer noopener" className="text-xs text-link hover:underline">
                                    {t("viewCertificate")}
                                  </a>
                                ) : (
                                  <p className="mt-1 text-xs">{extra}</p>
                                ))}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </section>
                  );
                })}

              {data.reviews.length > 0 && (
                <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-base font-bold">{t("latestReviews")}</h2>
                    <Link href={`/users/${user.id}?tab=reviews`} className="text-xs font-bold text-brand hover:underline">
                      {t("seeAll")}
                    </Link>
                  </div>
                  <ReviewList reviews={data.reviews} signedIn={signedIn} canReport={!data.isMe} />
                </section>
              )}
            </>
          )}

          {active === "portfolio" && (
            <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
              <PortfolioGallery items={profile?.portfolio ?? []} signedIn={signedIn} canReport={!data.isMe} />
            </section>
          )}

          {active === "reviews" && (
            <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">{stats.rating.toFixed(1)}</span>
                <span className="flex flex-col">
                  <Stars rating={stats.rating} size={18} label={t("rating", { rating: stats.rating })} />
                  <span className="text-xs text-muted">{t("reviewsCount", { count: stats.reviewsCount })}</span>
                </span>
              </div>
              {reviews?.data.length ? <ReviewList reviews={reviews.data} signedIn={signedIn} canReport={!data.isMe} /> : <p className="py-6 text-center text-sm text-muted">{t("noReviews")}</p>}
              {reviews && <Pagination page={reviews.meta.current_page} lastPage={reviews.meta.last_page} pathname={`/users/${user.id}`} query={{ tab: "reviews" }} />}
            </section>
          )}

          {active === "channels" && (
            <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
              <h2 className="mb-3 text-base font-bold">{t("channels")}</h2>
              {profile?.channels?.length ? (
                <ul className="flex flex-col divide-y divide-border text-sm">
                  {profile.channels.map((channel) => (
                    <li key={`${channel.platform}-${channel.handle}`} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                      <span>
                        <span className="font-bold">{t(`platforms.${channel.platform}`)}</span>{" "}
                        {channel.url ? (
                          <a href={channel.url} target="_blank" rel="noreferrer noopener" className="text-link hover:underline" dir="ltr">
                            @{channel.handle}
                          </a>
                        ) : (
                          <span dir="ltr">@{channel.handle}</span>
                        )}
                      </span>
                      <span className="flex gap-4 text-xs text-muted">
                        <span>{t("followers", { count: format.number(channel.followers, { notation: "compact" }) })}</span>
                        {channel.engagementRate != null && <span>{t("engagement", { rate: channel.engagementRate })}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-center text-sm text-muted">{t("noChannels")}</p>
              )}
            </section>
          )}

          {active === "projects" && (
            <section className="rounded-xl border border-border bg-surface p-4 sm:p-5">
              <h2 className="mb-3 text-base font-bold">{t("openProjects")}</h2>
              {data.openProjects.length ? (
                <div className="flex flex-wrap gap-3">
                  {data.openProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-muted">{t("noProjects")}</p>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

async function ReviewList({ reviews, signedIn, canReport }: { reviews: Review[]; signedIn: boolean; canReport: boolean }) {
  const t = await getTranslations("PublicProfile");
  const format = await getFormatter();

  return (
    <ul className="flex flex-col divide-y divide-border">
      {reviews.map((review) => (
        <li key={review.id} className="flex gap-3 py-3">
          <UserAvatar name={review.reviewer?.fullName ?? "?"} src={review.reviewer?.avatarUrl ?? null} size={40} />
          <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link href={`/users/${review.reviewer?.id}`} className="font-bold hover:text-brand">
                {review.reviewer?.fullName}
              </Link>
              <span className="text-xs text-muted">{format.dateTime(new Date(review.createdAt), { dateStyle: "medium" })}</span>
            </div>
            <Stars rating={review.rating} label={t("rating", { rating: review.rating })} />
            {review.project && (
              <Link href={`/projects/${review.project.id}`} className="text-xs text-brand hover:underline">
                {review.project.title}
              </Link>
            )}
            {review.comment && <p className="whitespace-pre-line">{review.comment}</p>}
            {canReport && <ReportButton targetType="review" targetId={review.id} signedIn={signedIn} className="self-end" />}
          </div>
        </li>
      ))}
    </ul>
  );
}
