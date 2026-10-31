import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCurrencies, getSummary } from "@/lib/api/reference";
import { apiGetOrNull } from "@/lib/api/server";
import type { LedgerEntry, Paginated, WalletBalance, Withdrawal } from "@/lib/api/types";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { Transactions, WalletOverview } from "@/modules/wallet";

type Monthly = { currency: string; data: { month: string; income: number; spending: number }[] };

/** Browser title of the wallet screen. */
export async function generateMetadata({ params }: PageProps<"/[locale]/settings/wallet">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Wallet" });
  return { title: t("title") };
}

/** Settings › Wallet: balances, six-month chart, transactions and pending withdrawals from the /wallet endpoints, per currency. */
export default async function WalletPage({ params, searchParams }: PageProps<"/[locale]/settings/wallet">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const picked = pickParams(query, ["currency", "type"]);
  const [summary, currencies] = await Promise.all([getSummary(), getCurrencies()]);
  const currency = picked.currency ?? summary?.wallet.currency ?? "USD";
  const listQuery = { currency, type: picked.type, page: pageParam(query) };

  const [balances, monthly, transactions, withdrawals] = await Promise.all([
    apiGetOrNull<{ data: WalletBalance[] }>("/wallet"),
    apiGetOrNull<Monthly>(`/wallet/stats${toQuery({ currency, months: "6" })}`),
    apiGetOrNull<Paginated<LedgerEntry>>(`/wallet/transactions${toQuery(listQuery)}`),
    apiGetOrNull<Paginated<Withdrawal>>("/wallet/withdrawals?perPage=50"),
  ]);

  return (
    <WalletOverview
      balances={balances?.data ?? []}
      currencies={currencies.map((item) => item.code)}
      currency={currency}
      monthly={monthly?.data ?? []}
      pending={(withdrawals?.data ?? []).filter((item) => item.status === "pending")}
    >
      <Transactions result={transactions} query={{ currency: picked.currency, type: picked.type }} />
    </WalletOverview>
  );
}
