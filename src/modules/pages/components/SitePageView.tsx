import { getFormatter, getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import { Markdown } from "@/components/ui/Markdown";
import { PageHeader } from "@/components/ui/PageHeader";
import type { SitePage } from "@/lib/api/types";

export async function SitePageView({ page, children }: { page: SitePage; children?: ReactNode }) {
  const t = await getTranslations("SitePages");
  const format = await getFormatter();

  return (
    <div className="page-container flex flex-col gap-6 py-10">
      <PageHeader crumbs={[{ label: t("home"), href: "/" }, { label: page.title }]} title={page.title} />
      <article className="max-w-3xl rounded-xl border border-border bg-surface p-5 sm:p-8">
        <Markdown source={page.body} />
        {page.updatedAt && (
          <p className="mt-8 text-xs text-muted">{t("updated", { date: format.dateTime(new Date(page.updatedAt), { dateStyle: "long" }) })}</p>
        )}
      </article>
      {children}
    </div>
  );
}
