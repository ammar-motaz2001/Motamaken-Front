import { ArrowUpRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageHero } from "@/components/illustrations/PageHero";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Link } from "@/i18n/navigation";
import { getCategories } from "@/lib/api/reference";
import type { CategoryType } from "@/lib/api/types";

const GROUPS: CategoryType[] = ["project", "influencer"];
const TONES = ["bg-brand/10 text-brand", "bg-orange/10 text-orange", "bg-link/10 text-link", "bg-brand-light/15 text-brand-light"];

export async function generateMetadata({ params }: PageProps<"/[locale]/categories">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Projects.metadata" });
  return { title: t("categories") };
}

export default async function CategoriesPage({ params }: PageProps<"/[locale]/categories">) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("Projects");
  const categories = await getCategories();

  return (
    <div className="page-container flex flex-col gap-8 py-8 lg:py-10">
      <PageHero
        crumbs={[{ label: t("breadcrumb.home"), href: "/" }, { label: t("categoriesPage.title") }]}
        title={t("categoriesPage.title")}
        subtitle={t("categoriesPage.subtitle")}
        illustration="categories"
      />
      {!categories.length && <p className="py-10 text-center text-muted">{t("list.failed")}</p>}
      {GROUPS.map((group) => {
        const items = categories.filter((category) => category.type === group);
        if (!items.length) return null;
        return (
          <section key={group} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold">{t(`categoriesPage.${group}`)}</h2>
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {items.map((category, index) => (
                <li key={category.id}>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="group flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-card"
                  >
                    <span className="flex items-start justify-between">
                      <span className={`flex size-12 items-center justify-center rounded-xl ${TONES[index % TONES.length]}`}>
                        <CategoryIcon icon={category.icon} className="size-6" />
                      </span>
                      <ArrowUpRight className="size-4 text-muted opacity-0 transition-opacity group-hover:opacity-100 rtl:-scale-x-100" aria-hidden />
                    </span>
                    <span className="text-sm font-semibold leading-snug">{category.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
