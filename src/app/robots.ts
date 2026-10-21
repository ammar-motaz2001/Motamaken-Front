import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/** Private areas (accounts, admin, payments) are kept out of search engines; everything public is open. */
const PRIVATE = [
  "/admin", "/settings", "/messages", "/notifications", "/favorites", "/my-projects", "/offers", "/profile", "/teams",
  "/disputes", "/payments", "/projects/new", "/influencers/new", "/r/", "/login", "/signup", "/forgot-password",
  "/reset-password", "/oauth", "/api/",
];

/** robots.txt: lets crawlers in everywhere except the private areas (in both languages) and points them to the sitemap. */
export default function robots(): MetadataRoute.Robots {
  const disallow = PRIVATE.flatMap((path) => [path, `/ar${path}`]);
  return {
    rules: [{ userAgent: "*", allow: "/", disallow }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
