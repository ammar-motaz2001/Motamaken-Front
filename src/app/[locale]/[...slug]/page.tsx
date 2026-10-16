import { getTranslations, setRequestLocale } from "next-intl/server";
import { UnderConstruction } from "@/components/under-construction/UnderConstruction";
import { apiGetOrNull } from "@/lib/api/server";
import type { SitePage } from "@/lib/api/types";
import { SitePageView } from "@/modules/pages";

/** Old addresses that now live under another page slug. */
const ALIASES: Record<string, string> = { privacy: "privacy-policy" };

async function loadPage(slug: string[]) {
  if (slug.length !== 1 || !/^[a-z0-9-]{1,60}$/.test(slug[0])) return null;
  return (await apiGetOrNull<{ data: SitePage }>(`/pages/${ALIASES[slug[0]] ?? slug[0]}`))?.data ?? null;
}

export async function generateMetadata({ params }: PageProps<"/[locale]/[...slug]">) {
  const { locale, slug } = await params;
  const page = await loadPage(slug);
  if (page) return { title: `${page.title} | Mutamakin` };
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return { title: t("underConstruction") };
}

/**
 * The footer's information pages (terms, guide, fees...), written by admins and served by the API. Any other address
 * still shows the "under construction" screen.
 */
export default async function CatchAllPage({ params }: PageProps<"/[locale]/[...slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const page = await loadPage(slug);

  return page ? <SitePageView page={page} /> : <UnderConstruction />;
}
