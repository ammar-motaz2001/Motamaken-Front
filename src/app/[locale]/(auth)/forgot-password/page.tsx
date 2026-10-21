import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCard, AuthShell, ForgotPasswordForm, getAuthMethods, parseMethod } from "@/modules/auth";

/** Browser title of the forgot-password screen. */
export async function generateMetadata({ params }: PageProps<"/[locale]/forgot-password">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Metadata" });
  return { title: t("forgotPassword") };
}

/** Forgot password: asks for the email or phone to send a reset link or code to. */
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
