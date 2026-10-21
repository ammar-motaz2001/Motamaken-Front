import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSummary } from "@/lib/api/reference";
import { apiGetOrNull } from "@/lib/api/server";
import type { KycStatus, KycSubmission, PaymentMethod } from "@/lib/api/types";
import { VerificationPage } from "@/modules/verification";

/** Browser title of the verification screen. */
export async function generateMetadata({ params }: PageProps<"/[locale]/settings/verification">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Verification" });
  return { title: `${t("title")} | Mutamakin` };
}

/** Settings › Verification: identity (KYC) status from GET /me/kyc, and whether a payment method is on file. */
export default async function Verification({ params }: PageProps<"/[locale]/settings/verification">) {
  setRequestLocale((await params).locale);
  const [summary, kyc, methods] = await Promise.all([
    getSummary(),
    apiGetOrNull<{ status: KycStatus; submission: { data?: KycSubmission } & Partial<KycSubmission> | null }>("/me/kyc"),
    apiGetOrNull<{ data: PaymentMethod[] }>("/me/payment-methods"),
  ]);
  if (!summary) return null;
  const submission = kyc?.submission ? ((kyc.submission.data ?? kyc.submission) as KycSubmission) : null;

  return <VerificationPage user={summary.user} kyc={{ status: kyc?.status ?? "none", submission }} hasPaymentMethod={Boolean(methods?.data.length)} />;
}
