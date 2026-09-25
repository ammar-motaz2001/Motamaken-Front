import { getTranslations, setRequestLocale } from "next-intl/server";
import { StatusScreen } from "@/modules/auth";

export async function generateMetadata({ params }: PageProps<"/[locale]/reset-password/success">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Metadata" });
  return { title: t("resetSuccess") };
}

export default async function ResetPasswordSuccessPage({ params }: PageProps<"/[locale]/reset-password/success">) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("ResetPassword");
  const ta = await getTranslations("Auth");

  return (
    <StatusScreen
      type="success"
      title={t("successTitle")}
      message={t("successMessage")}
      action={{ label: ta("goToLogin"), href: "/login" }}
    />
  );
}
