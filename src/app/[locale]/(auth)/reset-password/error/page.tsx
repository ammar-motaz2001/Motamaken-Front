import { getTranslations, setRequestLocale } from "next-intl/server";
import { StatusScreen } from "@/modules/auth";

export async function generateMetadata({ params }: PageProps<"/[locale]/reset-password/error">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Metadata" });
  return { title: t("resetError") };
}

export default async function ResetPasswordErrorPage({ params }: PageProps<"/[locale]/reset-password/error">) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("ResetPassword");

  return (
    <StatusScreen
      type="error"
      title={t("errorTitle")}
      message={t("errorMessage")}
      action={{ label: t("submit"), href: "/forgot-password" }}
    />
  );
}
