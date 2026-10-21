import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthCard, AuthShell, getAuthMethods, parseMethod, SignupForm } from "@/modules/auth";

/** Browser title of the sign-up screen. */
export async function generateMetadata({ params }: PageProps<"/[locale]/signup">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Metadata" });
  return { title: t("signup") };
}

/** Sign up by email or phone (tabs); a valid `?ref=` referral code is passed on to the form. */
export default async function SignupPage({ params, searchParams }: PageProps<"/[locale]/signup">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Signup");
  const methods = await getAuthMethods();
  const query = await searchParams;
  const method = parseMethod(query.method, "phone", methods);
  const ref = typeof query.ref === "string" && /^[A-Za-z0-9]{4,12}$/.test(query.ref) ? query.ref.toUpperCase() : undefined;

  return (
    <AuthShell title={t("title")} subtitle={t("subtitle")} tabs={{ basePath: "/signup", active: method, methods, query: ref ? { ref } : undefined }}>
      <AuthCard>
        <SignupForm key={method} method={method} referralCode={ref} />
      </AuthCard>
    </AuthShell>
  );
}
