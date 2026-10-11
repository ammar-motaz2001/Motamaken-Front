import { ReceiptText } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import type { LedgerEntry, Paginated } from "@/lib/api/types";
import { TypeFilter } from "./TypeFilter";

export async function Transactions({ result, query }: { result: Paginated<LedgerEntry> | null; query: Record<string, string | undefined> }) {
  const t = await getTranslations("Wallet.transactions");
  const format = await getFormatter();
  const rows = result?.data ?? [];

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold">{t("title")}</h2>
        <TypeFilter value={query.type ?? ""} />
      </div>

      {rows.length ? (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-surface-muted text-xs text-muted">
              <tr>
                <th className="px-3 py-2.5 text-start font-medium">{t("date")}</th>
                <th className="px-3 py-2.5 text-start font-medium">{t("description")}</th>
                <th className="px-3 py-2.5 text-end font-medium">{t("amount")}</th>
                <th className="px-3 py-2.5 text-end font-medium">{t("balance")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="px-3 py-2.5 whitespace-nowrap text-muted">{format.dateTime(new Date(row.createdAt), { dateStyle: "medium" })}</td>
                  <td className="px-3 py-2.5">{row.label}</td>
                  <td dir="ltr" className={`px-3 py-2.5 text-end font-bold whitespace-nowrap ${row.amount >= 0 ? "text-brand" : "text-danger"}`}>
                    {row.amount >= 0 ? "+" : "−"}
                    {format.number(Math.abs(row.amount), { style: "currency", currency: row.currency })}
                  </td>
                  <td dir="ltr" className="px-3 py-2.5 text-end whitespace-nowrap">
                    {format.number(row.balanceAfter, { style: "currency", currency: row.currency })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted">
          <ReceiptText className="size-12 text-placeholder" strokeWidth={1.2} aria-hidden />
          <p>{query.type ? t("emptyFiltered") : t("empty")}</p>
        </div>
      )}

      {result && <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/settings/wallet" query={query} />}
    </section>
  );
}
