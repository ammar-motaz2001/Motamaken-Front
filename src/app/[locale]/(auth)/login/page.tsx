import { getTranslations, setRequestLocale } from "next-intl/server";
import { safeNextPath } from "@/lib/session";
import { AuthCard, AuthShell, getAuthMethods, LoginForm, parseMethod } from "@/modules/auth";

/** Browser title of the sign-in screen. */
export async function generateMetadata({ params }: PageProps<"/[locale]/login">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Metadata" });
  const d = await getTranslations({ locale: (await params).locale, namespace: "Metadata.descriptions" });
  return { title: t("login"), description: d("login") };
}

/** Sign in by email or phone (tabs); a safe `?next=` path is where the user lands afterwards. */
export default async function LoginPage({ params, searchParams }: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Login");
  const query = await searchParams;
  const methods = await getAuthMethods();
  const method = parseMethod(query.method, "email", methods);
  const next = safeNextPath(query.next);

  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")} tabs={{ basePath: "/login", active: method, methods, query: next ? { next } : undefined }}>
      <AuthCard>
        <LoginForm key={method} method={method} next={next} />
      </AuthCard>
    </AuthShell>
  );
}
