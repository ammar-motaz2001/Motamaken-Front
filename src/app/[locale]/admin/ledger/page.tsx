import { CheckCircle2, TriangleAlert } from "lucide-react";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { Link } from "@/i18n/navigation";
import { apiGet } from "@/lib/api/server";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { getCurrencies } from "@/lib/api/reference";
import { AdminHeader, AdminSearch, AdminSection, AdminTable, Cell, ExportLink, dateTime, money, type LedgerTransaction, type List, type TrialBalance } from "@/modules/admin";

const TYPES = [
  "deposit", "withdrawal_request", "withdrawal_paid", "withdrawal_rejected", "withdrawal_cancelled", "escrow_fund", "escrow_release", "escrow_refund",
  "dispute_settlement", "appeal_adjustment", "tip", "promotion", "subscription", "campaign_funding", "campaign_earning", "campaign_refund", "draw_prize", "adjustment",
];

const label = (value: string) => value.replaceAll("_", " ");

export default async function AdminLedger({ params, searchParams }: PageProps<"/[locale]/admin/ledger">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const filter = pickParams(query, ["type", "userId", "projectId", "reference", "currency", "from", "to"]);
  const [t, locale, currencies, balance, result] = await Promise.all([
    getTranslations("Admin.ledger"),
    getLocale(),
    getCurrencies(),
    apiGet<{ data: TrialBalance }>("/admin/ledger/trial-balance"),
    apiGet<List<LedgerTransaction>>(`/admin/ledger/transactions${toQuery({ ...filter, page: pageParam(query) })}`),
  ]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      <AdminSection title={t("trialBalance")}>
        <div className="grid gap-4 md:grid-cols-2">
          {balance.data.map((book) => (
            <div key={book.currency} className="rounded-lg border border-border p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-bold">{book.currency}</span>
                {book.balanced ? (
                  <span className="flex items-center gap-1 text-sm text-brand">
                    <CheckCircle2 className="size-4" /> {t("balanced")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-danger">
                    <TriangleAlert className="size-4" /> {t("unbalanced")}
                  </span>
                )}
              </div>
              <dl className="flex flex-col gap-1.5 text-sm">
                {book.accounts.map((account) => (
                  <div key={account.type} className="flex justify-between gap-2">
                    <dt className="text-muted capitalize">
                      {label(account.type)} <span className="text-xs">({account.accounts})</span>
                    </dt>
                    <dd className={account.balance < 0 ? "text-danger" : ""}>{money(account.balance, book.currency, locale)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
        {balance.data.length === 0 && <p className="text-sm text-muted">{t("empty")}</p>}
      </AdminSection>
      <AdminSection title={t("transactions")}>
        <div className="flex flex-wrap items-center gap-3">
          <AdminSearch
            texts={[{ name: "reference", label: t("reference") }, { name: "projectId", label: t("projectId") }]}
            filters={[
              { name: "type", label: t("allTypes"), options: TYPES.map((value) => ({ value, label: label(value) })) },
              { name: "currency", label: t("anyCurrency"), options: currencies.map((c) => ({ value: c.code, label: c.code })) },
            ]}
            dates
          />
          {(filter.userId || filter.projectId) && (
            <Link href="/admin/ledger" className="text-sm text-link hover:underline">
              {filter.userId ? t("clearUser", { id: filter.userId }) : t("clearProject", { id: filter.projectId ?? "" })}
            </Link>
          )}
          <ExportLink dataset="ledger" query={filter} />
        </div>
        <AdminTable head={[t("id"), t("type"), t("entries"), t("date")]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((tx) => (
            <tr key={tx.id}>
              <Cell className="text-muted">#{tx.id}</Cell>
              <Cell>
                <div className="font-medium capitalize">{label(tx.type)}</div>
                {tx.description && <div className="max-w-56 text-xs text-muted">{tx.description}</div>}
                {tx.createdBy && <div className="text-xs text-orange">{t("by", { name: tx.createdBy.fullName })}</div>}
              </Cell>
              <Cell>
                <ul className="flex flex-col gap-0.5 text-xs">
                  {tx.entries.map((entry, index) => (
                    <li key={index} className="flex justify-between gap-4">
                      <span className="capitalize">
                        {label(entry.account.type)}
                        {entry.account.userId && (
                          <Link href={`/admin/users/${entry.account.userId}`} className="ms-1 text-link">
                            #{entry.account.userId}
                          </Link>
                        )}
                      </span>
                      <span className={entry.amount < 0 ? "text-danger" : "text-brand"} dir="ltr">
                        {money(entry.amount, entry.account.currency, locale)}
                      </span>
                    </li>
                  ))}
                </ul>
              </Cell>
              <Cell className="whitespace-nowrap">{dateTime(tx.createdAt, locale)}</Cell>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/ledger" query={filter} />
      </AdminSection>
    </>
  );
}
