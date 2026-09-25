import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCard, AuthShell, LoginForm, parseMethod } from "@/modules/auth";

export async function generateMetadata({ params }: PageProps<"/[locale]/login">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Metadata" });
  return { title: t("login") };
}

export default async function LoginPage({ params, searchParams }: PageProps<"/[locale]/login">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Login");
  const method = parseMethod((await searchParams).method, "email");

  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")} tabs={{ basePath: "/login", active: method }}>
      <AuthCard>
        <LoginForm key={method} method={method} />
      </AuthCard>
    </AuthShell>
  );
}
