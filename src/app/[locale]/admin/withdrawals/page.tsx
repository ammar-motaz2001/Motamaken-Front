import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { apiGet } from "@/lib/api/server";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { ActionButton, AdminHeader, AdminSection, AdminTable, Cell, StatusTabs, UserCell, dateTime, money, toneFor, type AdminWithdrawal, type List } from "@/modules/admin";

const STATUSES = ["pending", "paid", "rejected", "cancelled"] as const;

export default async function AdminWithdrawals({ params, searchParams }: PageProps<"/[locale]/admin/withdrawals">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const status = pickParams(query, ["status"]).status ?? "pending";
  const [t, locale, result] = await Promise.all([
    getTranslations("Admin.withdrawals"),
    getLocale(),
    apiGet<List<AdminWithdrawal>>(`/admin/withdrawals${toQuery({ status, page: pageParam(query) })}`),
  ]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      <AdminSection>
        <StatusTabs pathname="/admin/withdrawals" current={status} tabs={STATUSES.map((value) => ({ value, label: t(`status.${value}`) }))} />
        <AdminTable head={[t("user"), t("amount"), t("method"), t("requested"), t("state"), ""]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((w) => (
            <tr key={w.id}>
              <Cell>
                <UserCell user={w.user} />
              </Cell>
              <Cell className="whitespace-nowrap">
                <div className="font-semibold">{money(w.amount, w.currency, locale)}</div>
                <div className="text-xs text-muted">{t("fee", { fee: money(w.fee, w.currency, locale) })}</div>
              </Cell>
              <Cell>
                <div>{t(`methods.${w.method}`)}</div>
                <div className="text-xs text-muted" dir="ltr">{w.destination}</div>
              </Cell>
              <Cell className="whitespace-nowrap">{dateTime(w.createdAt, locale)}</Cell>
              <Cell>
                <StatusPill tone={toneFor(w.status)}>{t(`status.${w.status}`)}</StatusPill>
                {w.payoutReference && <div className="mt-1 text-xs text-muted">{t("reference", { ref: w.payoutReference })}</div>}
                {w.rejectReason && <div className="mt-1 text-xs text-danger">{w.rejectReason}</div>}
              </Cell>
              <Cell>
                {w.status === "pending" && (
                  <div className="flex flex-wrap justify-end gap-1.5">
                    <ActionButton
                      label={t("approve")}
                      endpoint={`/admin/withdrawals/${w.id}/approve`}
                      tone="brand"
                      description={t("approveHint", { amount: money(w.amount, w.currency, locale), name: w.user.fullName })}
                      fields={[{ name: "reference", label: t("payoutReference"), required: true, placeholder: "TRX-…" }]}
                    />
                    <ActionButton
                      label={t("reject")}
                      endpoint={`/admin/withdrawals/${w.id}/reject`}
                      tone="danger"
                      description={t("rejectHint")}
                      fields={[{ name: "reason", label: t("reason"), type: "textarea", required: true }]}
                    />
                  </div>
                )}
              </Cell>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/withdrawals" query={{ status }} />
      </AdminSection>
    </>
  );
}
