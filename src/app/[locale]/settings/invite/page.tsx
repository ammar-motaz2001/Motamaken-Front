import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSummary } from "@/lib/api/reference";
import { apiGetOrNull } from "@/lib/api/server";
import type { AffiliateSummary } from "@/lib/api/types";
import { InvitePage } from "@/modules/rewards";

/** Browser title of the invite-friends screen. */
export async function generateMetadata({ params }: PageProps<"/[locale]/settings/invite">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Rewards.invite" });
  return { title: `${t("title")} | Mutamakin` };
}

/** Settings › Invite: referral link, referred users and affiliate earnings from GET /me/affiliate and its sub-lists. */
export default async function Invite({ params }: PageProps<"/[locale]/settings/invite">) {
  setRequestLocale((await params).locale);
  const [summary, referrals, earnings, me] = await Promise.all([
    apiGetOrNull<AffiliateSummary>("/me/affiliate"),
    apiGetOrNull<Parameters<typeof InvitePage>[0]["referrals"]>("/me/affiliate/referrals?perPage=20"),
    apiGetOrNull<Parameters<typeof InvitePage>[0]["earnings"]>("/me/affiliate/earnings?perPage=10"),
    getSummary(),
  ]);
  return summary ? <InvitePage summary={summary} referrals={referrals} earnings={earnings} currency={summary.earnings[0]?.currency ?? me?.wallet.currency ?? "USD"} /> : null;
}
