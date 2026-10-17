import { ArrowUpRight, FilePlus2, Megaphone } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { illustrationFor } from "@/components/illustrations/Illustration";
import { PageHero } from "@/components/illustrations/PageHero";
import { Markdown } from "@/components/ui/Markdown";
import { Link } from "@/i18n/navigation";
import { apiGetOrNull } from "@/lib/api/server";
import type { SitePage, SitePageSummary } from "@/lib/api/types";

type SitePageViewProps = {
  page: SitePage;
  /** Replaces the page text area (e.g. the contact form). */
  children?: ReactNode;
  /** Replaces the default side column. */
  aside?: ReactNode;
};

/** An info page: a full-width banner with an illustration, the text in a wide column and related pages beside it. */
export async function SitePageView({ page, children, aside }: SitePageViewProps) {
  const t = await getTranslations("SitePages");
  const format = await getFormatter();
  const pages = (await apiGetOrNull<{ data: SitePageSummary[] }>("/pages"))?.data ?? [];
  const related = pages.filter((item) => item.section === page.section && item.slug !== page.slug).slice(0, 6);
  const subtitle = t.has(`hero.${page.slug}`) ? t(`hero.${page.slug}`) : t(`hero.sections.${page.section}`);

  return (
    <div className="page-container flex flex-col gap-8 py-8 lg:py-10">
      <PageHero crumbs={[{ label: t("home"), href: "/" }, { label: page.title }]} title={page.title} subtitle={subtitle} illustration={illustrationFor(page.slug, page.section)} />

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-6">
          {page.body && (
            <article className="rounded-2xl border border-border bg-surface p-6 sm:p-10 [&_h2]:scroll-mt-24">
              <div className="text-[15px] sm:text-base">
                <Markdown source={page.body} />
              </div>
              {page.updatedAt && (
                <p className="mt-10 border-t border-border pt-4 text-xs text-muted">{t("updated", { date: format.dateTime(new Date(page.updatedAt), { dateStyle: "long" }) })}</p>
              )}
            </article>
          )}
          {children}
        </div>

        <aside className="flex flex-col gap-5 lg:sticky lg:top-4">
          {aside}
          {related.length > 0 && (
            <nav aria-label={t("aside.related")} className="rounded-2xl border border-border bg-surface p-5">
              <h2 className="mb-3 text-sm font-bold tracking-wide text-muted uppercase">{t("aside.related")}</h2>
              <ul className="flex flex-col">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link href={`/${item.slug}`} className="group flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 text-sm hover:bg-surface-muted hover:text-brand">
                      {item.title}
                      <ArrowUpRight className="size-4 shrink-0 text-muted transition-transform group-hover:text-brand rtl:-scale-x-100" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
          <div className="flex flex-col gap-3 overflow-hidden rounded-2xl bg-gradient-brand p-6 text-white">
            <h2 className="text-lg font-bold">{t("aside.ctaTitle")}</h2>
            <p className="text-sm text-white/85">{t("aside.ctaText")}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link href="/projects/new" className="inline-flex items-center gap-1.5 rounded-md bg-white px-3.5 py-2 text-sm font-semibold text-brand hover:opacity-90">
                <FilePlus2 className="size-4" aria-hidden />
                {t("aside.postProject")}
              </Link>
              <Link href="/influencers/new" className="inline-flex items-center gap-1.5 rounded-md border border-white/60 px-3.5 py-2 text-sm font-semibold text-white hover:bg-white/10">
                <Megaphone className="size-4" aria-hidden />
                {t("aside.postRequest")}
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
