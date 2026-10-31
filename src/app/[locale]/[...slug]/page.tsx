import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { redirect, unstable_rethrow } from "next/navigation";
import { ApiError } from "@/lib/api/errors";
import { apiGet } from "@/lib/api/server";
import type { SitePage } from "@/lib/api/types";
import { describe, pageMetadata } from "@/lib/seo";
import { SitePageView } from "@/modules/pages";

/** Old addresses that now live under another page slug. */
const ALIASES: Record<string, string> = { privacy: "privacy-policy" };

/** Info page for a one-part slug from GET /pages/{slug} (old aliases mapped); null for anything else. */
async function loadPage(slug: string[], locale: string) {
  if (slug.length !== 1 || !/^[a-z0-9-]{1,60}$/.test(slug[0])) return null;
  const result = await apiGet<{ data: SitePage }>(`/pages/${ALIASES[slug[0]] ?? slug[0]}`).catch((error: unknown) => {
    unstable_rethrow(error);
    // A page the admins hid is not shown at all: its address leads to the home page.
    if (error instanceof ApiError && error.code === "page_unpublished") redirect(locale === "en" ? "/" : `/${locale}`);
    return null;
  });
  return result?.data ?? null;
}

/** Title and description of an admin-written info page; unknown addresses get none so they stay out of search results. */
export async function generateMetadata({ params }: PageProps<"/[locale]/[...slug]">) {
  const { locale, slug } = await params;
  const page = await loadPage(slug, locale);
  if (page) {
    return pageMetadata({
      title: page.seo?.title || page.title,
      description: page.seo?.description || describe(page.body),
      path: `/${page.slug}`,
      locale,
      noindex: page.seo?.noindex,
    });
  }
  // Unknown or unpublished addresses are a real 404.
  notFound();
}

/**
 * The footer's information pages (terms, guide, fees...), written by admins and served by the API. Any other address,
 * and a page the admins unpublished, is a 404.
 */
export default async function CatchAllPage({ params }: PageProps<"/[locale]/[...slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const page = await loadPage(slug, locale);

  return page ? <SitePageView page={page} /> : notFound();
}
