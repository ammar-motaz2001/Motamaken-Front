import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { AuthCard, AuthShell, getAuthMethods, parseMethod, ResetVerification } from "@/modules/auth";

export async function generateMetadata({ params }: PageProps<"/[locale]/forgot-password/verify">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Metadata" });
  return { title: t("verify") };
}

export default async function ForgotPasswordVerifyPage({ params, searchParams }: PageProps<"/[locale]/forgot-password/verify">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ForgotPassword");
  const query = await searchParams;
  const method = parseMethod(query.method, "phone", await getAuthMethods());
  const target = typeof query.to === "string" ? query.to : "";
  if (!target) redirect({ href: { pathname: "/forgot-password", query: { method } }, locale });

  return (
    <AuthShell title={t("verifyTitle")} subtitle={t("verifySubtitle")}>
      <AuthCard>
        <ResetVerification method={method} target={target} />
      </AuthCard>
    </AuthShell>
  );
}
