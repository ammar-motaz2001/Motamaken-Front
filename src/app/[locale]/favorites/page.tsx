import { Heart } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProfileCard } from "@/components/cards/ProfileCard";
import { ProjectCard } from "@/components/cards/ProjectCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { Link } from "@/i18n/navigation";
import { apiGetOrNull } from "@/lib/api/server";
import type { ProfileCard as Profile, Project } from "@/lib/api/types";
import { pageParam, toQuery } from "@/lib/params";

type Saved<T> = { data: { type: string; savedAt: string; item: T }[]; meta: { current_page: number; last_page: number; total: number } };

/** Browser title of the favourites screen. */
export async function generateMetadata({ params }: PageProps<"/[locale]/favorites">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Favorites" });
  return { title: t("title") };
}

/** Favourites: saved projects or saved profiles (tabs) from GET /me/favorites, 24 per page. */
export default async function Favorites({ params, searchParams }: PageProps<"/[locale]/favorites">) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("Favorites");
  const query = await searchParams;
  const type = query.type === "profile" ? "profile" : "project";
  const result = await apiGetOrNull<Saved<Project | Profile>>(`/me/favorites${toQuery({ type, perPage: "24", page: pageParam(query) })}`);

  return (
    <div className="page-container flex flex-col gap-6 py-10">
      <PageHeader crumbs={[{ label: t("home"), href: "/" }, { label: t("title") }]} title={t("title")} subtitle={t("subtitle")} />

      <nav className="flex gap-2" aria-label={t("title")}>
        {(["project", "profile"] as const).map((tab) => (
          <Link
            key={tab}
            href={tab === "project" ? "/favorites" : "/favorites?type=profile"}
            aria-current={type === tab ? "page" : undefined}
            className={`rounded-full border px-4 py-1.5 text-sm ${type === tab ? "border-brand bg-brand-soft font-medium text-brand" : "border-border hover:border-brand"}`}
          >
            {t(`tabs.${tab}`)}
          </Link>
        ))}
      </nav>

      {result?.data.length ? (
        <ul className="flex flex-wrap gap-5">
          {result.data.map((row) => (
            <li key={`${row.type}-${row.item.id}`}>
              {type === "project" ? <ProjectCard project={row.item as Project} /> : <ProfileCard profile={row.item as Profile} signedIn />}
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <Heart className="size-10 text-muted" />
          <p className="font-bold">{t(`empty.${type}`)}</p>
          <p className="text-sm text-muted">{t("emptyHint")}</p>
          <Link href={type === "project" ? "/projects" : "/search?type=freelancers"} className="text-sm font-medium text-brand hover:underline">
            {t(`browse.${type}`)}
          </Link>
        </div>
      )}

      {result && <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/favorites" query={{ type: type === "profile" ? "profile" : undefined }} />}
    </div>
  );
}
