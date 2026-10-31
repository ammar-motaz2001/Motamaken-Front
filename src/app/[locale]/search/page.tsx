import { LayoutGrid, List } from "lucide-react";
import { MobileCollapse } from "@/components/ui/MobileCollapse";
import { cookies } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { ProfileCard } from "@/components/cards/ProfileCard";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { sectionTitleClasses } from "@/components/ui/styles";
import { Link } from "@/i18n/navigation";
import { getCategories, getCountries, getCurrencies, getSummary } from "@/lib/api/reference";
import { apiGetOrNull } from "@/lib/api/server";
import type { Paginated, ProfileCard as Profile, Project, SearchAll, SearchType } from "@/lib/api/types";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { CURRENCY_COOKIE, pickDisplayCurrency } from "@/lib/currency";
import { SESSION_COOKIE } from "@/lib/session";
import { pageMetadata } from "@/lib/seo";
import { NoResults, ProfileRow, ProjectRow, SearchFilters } from "@/modules/search";

const TYPES: SearchType[] = ["all", "projects", "influencer_requests", "influencers", "freelancers"];
const FILTERS = ["q", "category", "budgetMin", "budgetMax", "skill", "minRating", "platform", "countryId", "cityId", "sort"] as const;
const GROUPS = [
  { key: "projects", type: "projects" },
  { key: "influencerRequests", type: "influencer_requests" },
  { key: "freelancers", type: "freelancers" },
  { key: "influencers", type: "influencers" },
] as const;

/** Responsive grid that holds the search result cards. */
function Grid({ children }: { children: ReactNode }) {
  return <div className="card-grid grid grid-cols-[repeat(auto-fill,minmax(212px,1fr))] justify-center gap-5 sm:justify-start">{children}</div>;
}

/** Search-engine title and description of the search page. */
export async function generateMetadata({ params }: PageProps<"/[locale]/search">) {
  const { locale } = await params;
  const [t, seo] = await Promise.all([getTranslations({ locale, namespace: "Search" }), getTranslations({ locale, namespace: "Seo" })]);
  return pageMetadata({ title: t("title"), description: seo("search"), path: "/search", locale });
}

/**
 * Search: with type "all" a few results of each kind from GET /search, otherwise one paged, filterable list of
 * projects, requests, freelancers or influencers.
 */
export default async function SearchPage({ params, searchParams }: PageProps<"/[locale]/search">) {
  setRequestLocale((await params).locale);
  const tc = await getTranslations("Common");
  const t = await getTranslations("Search");
  const th = await getTranslations("Header.searchTypes");
  const signedIn = (await cookies()).has(SESSION_COOKIE);
  const query = await searchParams;
  const picked = pickParams(query, ["type", "view", "advanced", ...FILTERS]);
  const type = TYPES.includes(picked.type as SearchType) ? (picked.type as SearchType) : "all";
  const view = picked.view === "list" ? "list" : "grid";
  // A plain search is just words (and the header's place); the other filters only exist in advanced search.
  const advanced = picked.advanced === "1";
  const allowed: readonly string[] = advanced ? FILTERS : ["q", "countryId", "cityId"];
  const filters = Object.fromEntries(FILTERS.filter((key) => allowed.includes(key)).map((key) => [key, picked[key]]).filter(([, value]) => value)) as Record<string, string>;
  const mode = advanced ? "1" : undefined;
  const isProjects = type === "projects" || type === "influencer_requests";
  // A minimum above the maximum is the visitor's mistake: say so instead of searching.
  const reversed = Boolean(filters.budgetMin && filters.budgetMax && Number(filters.budgetMin) > Number(filters.budgetMax));

  // Budget filters are typed in the visitor's display currency; the API compares every project in dollars.
  const currency =
    filters.budgetMin || filters.budgetMax
      ? pickDisplayCurrency(await getCurrencies(), (await cookies()).get(CURRENCY_COOKIE)?.value, (await getSummary())?.user.currency)
      : undefined;
  const [categories, countries, grouped, paged] = await Promise.all([
    getCategories(),
    getCountries(),
    type === "all" ? apiGetOrNull<SearchAll>(`/search${toQuery({ q: filters.q, countryId: filters.countryId, cityId: filters.cityId })}`) : null,
    type === "all" || reversed ? null : apiGetOrNull<Paginated<Project | Profile>>(`/search${toQuery({ ...filters, currency, type, page: pageParam(query), perPage: "20" })}`),
  ]);
  const failed = !reversed && (type === "all" ? !grouped : !paged);
  const empty = grouped ? GROUPS.every((group) => !grouped[group.key].length) : paged?.data.length === 0;
  const viewHref = (next: string) => `/search${toQuery({ ...filters, type, view: next === "list" ? "list" : undefined, advanced: mode })}`;

  return (
    <div className="page-container flex flex-col gap-5 py-10">
      <PageHeader crumbs={[{ label: t("home"), href: "/" }, { label: t("title") }]} title={filters.q ? t("resultsFor", { q: filters.q }) : t("title")} />

      <div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label={t("searchBy")} className="glass flex flex-col gap-1 rounded-xl border border-border p-2.5 lg:sticky lg:top-4">
          <p className="px-2.5 pt-1 pb-2 text-sm font-bold">{t("searchBy")}</p>
          {TYPES.map((item) => (
            <Link
              key={item}
              href={`/search${toQuery({ q: filters.q, type: item === "all" ? undefined : item, advanced: item === "all" ? undefined : mode })}`}
              aria-current={item === type ? "page" : undefined}
              className={`rounded-md px-2.5 py-2 text-sm ${item === type ? "bg-orange/10 font-medium text-orange" : "hover:bg-surface-muted"}`}
            >
              {th(item)}
            </Link>
          ))}
        </nav>

        <div className="flex min-w-0 flex-col gap-5">
          <MobileCollapse label={tc("filter")}>
          <SearchFilters key={`${type}-${advanced}-${JSON.stringify(filters)}`} type={type} values={filters} categories={categories} countries={countries} view={view} advanced={advanced} />
        </MobileCollapse>

          <section className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 sm:p-5">
            {paged && (
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold">{t("count", { count: paged.meta.total })}</h2>
                <div className="flex gap-1.5" role="group" aria-label={t("view")}>
                  {(
                    [
                      ["list", List],
                      ["grid", LayoutGrid],
                    ] as const
                  ).map(([name, Icon]) => (
                    <Link
                      key={name}
                      href={viewHref(name)}
                      aria-label={t(`views.${name}`)}
                      aria-current={view === name ? "true" : undefined}
                      className={`flex size-9 items-center justify-center rounded-md ${view === name ? "bg-gradient-orange text-white" : "bg-surface-muted text-muted"}`}
                    >
                      <Icon className="size-4" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {reversed && <p className="rounded-lg bg-danger-soft p-4 text-center text-sm text-danger">{t("budgetReversed")}</p>}
            {failed && <p className="py-10 text-center text-muted">{t("failed")}</p>}
            {!failed && empty && <NoResults />}

            {grouped &&
              GROUPS.filter((group) => grouped[group.key].length).map((group) => (
                <div key={group.key} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <h2 className={sectionTitleClasses}>{th(group.type)}</h2>
                    <Link href={`/search${toQuery({ q: filters.q, type: group.type })}`} className="text-sm text-link">
                      {t("seeAll")}
                    </Link>
                  </div>
                  <Grid>
                    {group.key === "projects" || group.key === "influencerRequests"
                      ? grouped[group.key].map((project) => <ProjectCard key={project.id} project={project} />)
                      : grouped[group.key].map((profile) => <ProfileCard key={profile.id} profile={profile} signedIn={signedIn} />)}
                  </Grid>
                </div>
              ))}

            {paged && paged.data.length > 0 && (
              <>
                {view === "list" ? (
                  <ul>
                    {isProjects
                      ? (paged.data as Project[]).map((project) => <ProjectRow key={project.id} project={project} />)
                      : (paged.data as Profile[]).map((profile) => <ProfileRow key={profile.id} profile={profile} />)}
                  </ul>
                ) : (
                  <Grid>
                    {isProjects
                      ? (paged.data as Project[]).map((project) => <ProjectCard key={project.id} project={project} />)
                      : (paged.data as Profile[]).map((profile) => <ProfileCard key={profile.id} profile={profile} signedIn={signedIn} />)}
                  </Grid>
                )}
                <Pagination page={paged.meta.current_page} lastPage={paged.meta.last_page} pathname="/search" query={{ ...filters, type, view: view === "list" ? "list" : undefined, advanced: mode }} />
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
