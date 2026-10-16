import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSummary } from "@/lib/api/reference";
import { apiGetOrNull } from "@/lib/api/server";
import { SecuritySettings } from "@/modules/settings";
import type { SecurityState } from "@/modules/settings/components/TwoFactorModal";

export async function generateMetadata({ params }: PageProps<"/[locale]/settings/security">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Settings.security" });
  return { title: `${t("title")} | Mutamakin` };
}

export default async function SecuritySettingsPage({ params }: PageProps<"/[locale]/settings/security">) {
  setRequestLocale((await params).locale);
  const [state, summary] = await Promise.all([apiGetOrNull<SecurityState>("/me/security"), getSummary()]);
  return state ? <SecuritySettings initial={state} email={summary?.user.email ?? null} phone={summary?.user.phone ?? null} /> : null;
}
