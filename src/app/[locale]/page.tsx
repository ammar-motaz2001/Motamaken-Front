import { cookies } from "next/headers";
import { setRequestLocale } from "next-intl/server";
import { getSummary } from "@/lib/api/reference";
import { apiGetOrNull } from "@/lib/api/server";
import type { Home as HomeData } from "@/lib/api/types";
import { SESSION_COOKIE } from "@/lib/session";
import { HomePage } from "@/modules/home";

export default async function Home({ params }: PageProps<"/[locale]">) {
  setRequestLocale((await params).locale);
  const signedIn = (await cookies()).has(SESSION_COOKIE);
  const [home, summary] = await Promise.all([apiGetOrNull<HomeData>("/home"), signedIn ? getSummary() : null]);

  return <HomePage home={home} signedIn={signedIn} user={summary?.user ?? null} currency={summary?.wallet.currency ?? "USD"} />;
}
