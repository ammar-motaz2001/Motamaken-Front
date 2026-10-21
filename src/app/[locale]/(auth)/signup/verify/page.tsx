import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { AuthCard, AuthShell, getAuthMethods, parseMethod, SignupVerification } from "@/modules/auth";

/** Browser title of the sign-up code screen. */
export async function generateMetadata({ params }: PageProps<"/[locale]/signup/verify">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Metadata" });
  return { title: t("verify") };
}

/** Sign-up step 2: enter the code sent to `?to=`; without a target it goes back to sign up. */
export default async function SignupVerifyPage({ params, searchParams }: PageProps<"/[locale]/signup/verify">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Signup");
  const query = await searchParams;
  const method = parseMethod(query.method, "phone", await getAuthMethods());
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
