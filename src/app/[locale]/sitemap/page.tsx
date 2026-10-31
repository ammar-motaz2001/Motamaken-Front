import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Link } from "@/i18n/navigation";
import { getCategories } from "@/lib/api/reference";
import { apiGetOrNull } from "@/lib/api/server";
import { pageMetadata } from "@/lib/seo";
import type { SitePageSummary } from "@/lib/api/types";

/** Search-engine title and description of the human sitemap page. */
export async function generateMetadata({ params }: PageProps<"/[locale]/sitemap">) {
  const { locale } = await params;
  const [t, seo] = await Promise.all([getTranslations({ locale, namespace: "SitePages.sitemap" }), getTranslations({ locale, namespace: "Seo" })]);
  return pageMetadata({ title: t("title"), description: seo("sitemap"), path: "/sitemap", locale });
}

/**
 * Every main section of the site, the categories and the information pages, all from the API.
 */
export default async function Sitemap({ params }: PageProps<"/[locale]/sitemap">) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("SitePages.sitemap");
  const [pages, categories] = await Promise.all([apiGetOrNull<{ data: SitePageSummary[] }>("/pages"), getCategories()]);

  const groups: { title: string; links: { href: string; label: string }[] }[] = [
    {
      title: t("main"),
      links: [
        { href: "/", label: t("links.home") },
        { href: "/projects", label: t("links.projects") },
        { href: "/search", label: t("links.search") },
        { href: "/categories", label: t("links.categories") },
        { href: "/projects/new", label: t("links.postProject") },
        { href: "/influencers/new", label: t("links.postRequest") },
        { href: "/premium", label: t("links.premium") },
        { href: "/gifts", label: t("links.gifts") },
        { href: "/settings/promoter", label: t("links.promote") },
      ],
    },
    { title: t("categories"), links: categories.map((category) => ({ href: `/categories/${category.slug}`, label: category.name })) },
    ...(["about", "help", "legal"] as const).map((section) => ({
      title: t(`sections.${section}`),
      links: (pages?.data ?? []).filter((page) => page.section === section).map((page) => ({ href: `/${page.slug}`, label: page.title })),
    })),
  ].filter((group) => group.links.length);

  return (
    <div className="page-container flex flex-col gap-6 py-10">
      <PageHeader crumbs={[{ label: t("home"), href: "/" }, { label: t("title") }]} title={t("title")} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <section key={group.title} className="rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-3 font-bold text-brand">{group.title}</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-brand">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
