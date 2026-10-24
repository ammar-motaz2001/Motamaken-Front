import { getTranslations, setRequestLocale } from "next-intl/server";
import { safeNextPath } from "@/lib/session";
import { AuthCard, AuthShell, getAuthMethods, LoginForm, parseMethod } from "@/modules/auth";

/** Browser title of the staff sign-in screen; kept out of search engines. */
export async function generateMetadata({ params }: PageProps<"/[locale]/admin-login">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Metadata" });
  return { title: t("adminLogin"), robots: { index: false } };
}

/**
 * Staff sign-in for the admin panel (admin.mutamakin.com lands here): the same sign-in as the site but without a way to
 * create an account, and only staff accounts get through. `?denied=1` comes back from a code step that was not staff.
 */
export default async function AdminLoginPage({ params, searchParams }: PageProps<"/[locale]/admin-login">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Login");
  const query = await searchParams;
  const methods = await getAuthMethods();
  const method = parseMethod(query.method, "email", methods);
  const next = safeNextPath(query.next);

  return (
    <AuthShell
      title={t("adminTitle")}
      subtitle={t("adminSubtitle")}
      tabs={{ basePath: "/admin-login", active: method, methods, query: next ? { next } : undefined }}
    >
      <AuthCard>
        <LoginForm key={method} method={method} next={next ?? "/admin"} staff initialError={query.denied === "1" ? t("notStaff") : undefined} />
      </AuthCard>
    </AuthShell>
  );
}
