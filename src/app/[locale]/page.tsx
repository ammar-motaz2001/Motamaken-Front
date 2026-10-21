import { cookies } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSummary } from "@/lib/api/reference";
import { apiGetOrNull } from "@/lib/api/server";
import type { Home as HomeData } from "@/lib/api/types";
import { SESSION_COOKIE } from "@/lib/session";
import { pageMetadata } from "@/lib/seo";
import { HomePage } from "@/modules/home";

/** Search-engine title and description of the home page. */
export async function generateMetadata({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Seo" });
  return pageMetadata({ title: t("homeTitle"), description: t("home"), path: "/", locale });
}

/** Home page, fed by GET /home; signed-in visitors also get their account summary for the greeting and currency. */
export default async function Home({ params }: PageProps<"/[locale]">) {
  setRequestLocale((await params).locale);
  const signedIn = (await cookies()).has(SESSION_COOKIE);
  const [home, summary] = await Promise.all([apiGetOrNull<HomeData>("/home"), signedIn ? getSummary() : null]);

  return <HomePage home={home} signedIn={signedIn} user={summary?.user ?? null} currency={summary?.wallet.currency ?? "USD"} />;
}
