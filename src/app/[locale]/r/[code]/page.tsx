import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { CampaignLanding } from "@/modules/campaigns";

export const metadata = { robots: { index: false, follow: false } };

/**
 * The page a promoter's link opens: it reports the visit and moves on to what the campaign promotes.
 */
export default async function CampaignLink({ params }: PageProps<"/[locale]/r/[code]">) {
  const { locale, code } = await params;
  setRequestLocale(locale);
  if (!/^[A-Za-z0-9]{4,16}$/.test(code)) notFound();

  return <CampaignLanding code={code} />;
}
