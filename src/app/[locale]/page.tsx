import { cookies } from "next/headers";
import { redirect } from "@/i18n/navigation";
import { AFTER_LOGIN_PATH, SESSION_COOKIE } from "@/lib/session";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  const signedIn = (await cookies()).has(SESSION_COOKIE);
  redirect({ href: signedIn ? AFTER_LOGIN_PATH : "/signup", locale });
}
