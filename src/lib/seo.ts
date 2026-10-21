import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

/** The public address of the website (canonical links, sitemap, social cards). */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://mutamakin.com").replace(/\/$/, "");
export const SITE_NAME = "Mutamakin";

/** `/projects/4` in Arabic is `/ar/projects/4`; English has no prefix. */
export function localizedPath(path: string, locale: string) {
  const clean = path === "/" ? "" : path;
  return locale === routing.defaultLocale ? clean || "/" : `/${locale}${clean}`;
}

/** Canonical link plus the English/Arabic versions of the same page, for search engines. */
function alternatesFor(path: string, locale: string): Metadata["alternates"] {
  return {
    canonical: localizedPath(path, locale),
    languages: {
      ...Object.fromEntries(routing.locales.map((code) => [code, localizedPath(path, code)])),
      "x-default": localizedPath(path, routing.defaultLocale),
    },
  };
}

/** Plain text of a Markdown snippet, cut to a search-result sized description. */
export function describe(text: string | null | undefined, max = 160) {
  const plain = (text ?? "")
    .replace(/[#>*_`|[\]()-]+/g, " ")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > max ? `${plain.slice(0, max - 1).trimEnd()}…` : plain || undefined;
}

type PageMetadataOptions = {
  title: string;
  description?: string;
  path: string;
  locale: string;
  image?: string | null;
  noindex?: boolean;
  type?: "website" | "article" | "profile";
};

/** Everything a public page needs: title, description, canonical + language links and the social card. */
export function pageMetadata({ title, description, path, locale, image, noindex, type = "website" }: PageMetadataOptions): Metadata {
  const images = [{ url: image || "/og.png", width: 1200, height: 630, alt: SITE_NAME }];
  return {
    title,
    description,
    alternates: alternatesFor(path, locale),
    openGraph: {
      type,
      siteName: SITE_NAME,
      title,
      description,
      url: localizedPath(path, locale),
      locale: locale === "ar" ? "ar_SA" : "en_US",
      alternateLocale: locale === "ar" ? ["en_US"] : ["ar_SA"],
      images,
    },
    twitter: { card: "summary_large_image", title, description, images: images.map((item) => item.url) },
    ...(noindex && { robots: { index: false, follow: false } }),
  };
}
