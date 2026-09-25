import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { AuthCard, AuthShell, parseMethod, SignupVerification } from "@/modules/auth";

export async function generateMetadata({ params }: PageProps<"/[locale]/signup/verify">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Metadata" });
  return { title: t("verify") };
}

export default async function SignupVerifyPage({ params, searchParams }: PageProps<"/[locale]/signup/verify">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Signup");
  const query = await searchParams;
  const method = parseMethod(query.method, "phone");
  const target = typeof query.to === "string" ? query.to : "";
  if (!target) redirect({ href: { pathname: "/signup", query: { method } }, locale });

  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")}>
      <AuthCard>
        <SignupVerification method={method} target={target} />
      </AuthCard>
    </AuthShell>
  );
}
