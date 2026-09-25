import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCard, AuthShell, parseMethod, SignupForm } from "@/modules/auth";

export async function generateMetadata({ params }: PageProps<"/[locale]/signup">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Metadata" });
  return { title: t("signup") };
}

export default async function SignupPage({ params, searchParams }: PageProps<"/[locale]/signup">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Signup");
  const method = parseMethod((await searchParams).method, "phone");

  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")} tabs={{ basePath: "/signup", active: method }}>
      <AuthCard>
        <SignupForm key={method} method={method} />
      </AuthCard>
    </AuthShell>
  );
}
