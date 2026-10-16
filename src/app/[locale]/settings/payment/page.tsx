import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCurrencies, getSummary } from "@/lib/api/reference";
import { apiGetOrNull } from "@/lib/api/server";
import type { PaymentMethod } from "@/lib/api/types";
import { PaymentSettings } from "@/modules/settings";

export async function generateMetadata({ params }: PageProps<"/[locale]/settings/payment">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Settings.payment" });
  return { title: `${t("title")} | Mutamakin` };
}

export default async function PaymentSettingsPage({ params }: PageProps<"/[locale]/settings/payment">) {
  setRequestLocale((await params).locale);
  const [methods, currencies, summary] = await Promise.all([
    apiGetOrNull<{ data: PaymentMethod[] }>("/me/payment-methods"),
    getCurrencies(),
    getSummary(),
  ]);

  return <PaymentSettings methods={methods?.data ?? []} currencies={currencies} currency={summary?.user.currency ?? "USD"} />;
}
