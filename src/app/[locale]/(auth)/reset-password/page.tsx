import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { AuthCard, AuthShell, ResetPasswordForm } from "@/modules/auth";

export async function generateMetadata({ params }: PageProps<"/[locale]/reset-password">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Metadata" });
  return { title: t("resetPassword") };
}

export default async function ResetPasswordPage({ params, searchParams }: PageProps<"/[locale]/reset-password">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("ResetPassword");
  const { token } = await searchParams;
  if (typeof token !== "string" || !token) return redirect({ href: "/reset-password/error", locale });

  return (
    <AuthShell title={t("title")}>
      <AuthCard>
        <ResetPasswordForm token={token} />
      </AuthCard>
    </AuthShell>
  );
}
