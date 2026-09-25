import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCard, AuthShell, ForgotPasswordForm, getAuthMethods, parseMethod } from "@/modules/auth";

export async function generateMetadata({ params }: PageProps<"/[locale]/forgot-password">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Metadata" });
  return { title: t("forgotPassword") };
}

export default async function ForgotPasswordPage({ params, searchParams }: PageProps<"/[locale]/forgot-password">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ForgotPassword");
  const method = parseMethod((await searchParams).method, "email", await getAuthMethods());

  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")}>
      <AuthCard>
        <ForgotPasswordForm key={method} method={method} />
      </AuthCard>
    </AuthShell>
  );
}
