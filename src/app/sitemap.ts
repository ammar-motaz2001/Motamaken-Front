import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import type { Category, Paginated, Project, SitePageSummary } from "@/lib/api/types";
import { SITE_URL, localizedPath } from "@/lib/seo";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

// Rebuilt at most once an hour.
export const revalidate = 3600;

/** Reads a public API endpoint for the sitemap, cached for an hour; null when the API is missing or fails. */
async function get<T>(path: string): Promise<T | null> {
  if (!API_URL) return null;
  return fetch(`${API_URL}${path}`, { headers: { Accept: "application/json" }, next: { revalidate } })
    .then((response) => (response.ok ? (response.json() as Promise<T>) : null))
    .catch(() => null);
}

/** One entry per page, listing its English and Arabic addresses. */
function entry(path: string, options: { lastModified?: string | null; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }) {
  return {
    url: `${SITE_URL}${localizedPath(path, routing.defaultLocale)}`,
    lastModified: options.lastModified ? new Date(options.lastModified) : undefined,
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    alternates: { languages: Object.fromEntries(routing.locales.map((locale) => [locale, `${SITE_URL}${localizedPath(path, locale)}`])) },
  };
}

/** Open projects, newest first, a page of 50 at a time (up to 1,000). */
async function openProjects() {
  const projects: Project[] = [];
  for (let page = 1; page <= 20; page++) {
    const result = await get<Paginated<Project>>(`/projects?perPage=50&page=${page}`);
    if (!result) break;
    projects.push(...result.data);
    if (page >= result.meta.last_page) break;
  }
  return projects;
}

/** sitemap.xml: the main sections, every category, the admin-written info pages (GET /pages) and up to 1,000 open projects. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, categories, projects] = await Promise.all([
    get<{ data: SitePageSummary[] }>("/pages"),
    get<{ data: Category[] }>("/categories"),
    openProjects(),
  ]);

  return [
    entry("/", { priority: 1, changeFrequency: "daily" }),
    entry("/projects", { priority: 0.9, changeFrequency: "hourly" }),
    entry("/categories", { priority: 0.8, changeFrequency: "weekly" }),
    entry("/search", { priority: 0.6, changeFrequency: "daily" }),
    entry("/premium", { priority: 0.6, changeFrequency: "monthly" }),
    entry("/gifts", { priority: 0.5, changeFrequency: "weekly" }),
    entry("/contact", { priority: 0.5, changeFrequency: "yearly" }),
    entry("/faq", { priority: 0.6, changeFrequency: "monthly" }),
    entry("/sitemap", { priority: 0.3, changeFrequency: "weekly" }),
    ...(categories?.data ?? []).map((category) => entry(`/categories/${category.slug}`, { priority: 0.7, changeFrequency: "daily" })),
    ...(pages?.data ?? []).map((page) => entry(`/${page.slug}`, { lastModified: page.updatedAt, priority: page.section === "legal" ? 0.3 : 0.5, changeFrequency: "monthly" })),
    ...projects.map((project) => entry(`/projects/${project.id}`, { lastModified: project.createdAt, priority: 0.7, changeFrequency: "daily" })),
  ];
}
