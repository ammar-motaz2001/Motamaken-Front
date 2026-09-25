import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { safeNextPath } from "@/lib/session";
import { AuthCard, AuthShell, getAuthMethods, LoginVerification, parseMethod } from "@/modules/auth";

export async function generateMetadata({ params }: PageProps<"/[locale]/login/verify">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Metadata" });
  return { title: t("loginVerify") };
}

export default async function LoginVerifyPage({ params, searchParams }: PageProps<"/[locale]/login/verify">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Login");
  const query = await searchParams;
  const method = parseMethod(query.method, "email", await getAuthMethods());
  const target = typeof query.to === "string" ? query.to : "";
  if (!target) redirect({ href: { pathname: "/login", query: { method } }, locale });

  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")}>
      <AuthCard>
        <LoginVerification method={method} target={target} next={safeNextPath(query.next)} />
      </AuthCard>
    </AuthShell>
  );
}
