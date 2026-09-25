import { getTranslations, setRequestLocale } from "next-intl/server";
import { safeNextPath } from "@/lib/session";
import { AuthCard, AuthShell, LoginForm, parseMethod } from "@/modules/auth";

export async function generateMetadata({ params }: PageProps<"/[locale]/login">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Metadata" });
  return { title: t("login") };
}

export default async function LoginPage({ params, searchParams }: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Login");
  const query = await searchParams;
  const method = parseMethod(query.method, "email");
  const next = safeNextPath(query.next);

  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")} tabs={{ basePath: "/login", active: method, query: next ? { next } : undefined }}>
      <AuthCard>
        <LoginForm key={method} method={method} next={next} />
      </AuthCard>
    </AuthShell>
  );
}
