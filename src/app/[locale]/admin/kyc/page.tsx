import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import { apiGet } from "@/lib/api/server";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { AdminHeader, AdminSection, AdminTable, Cell, StatusTabs, dateTime, toneFor, type KycSubmission, type List } from "@/modules/admin";

const STATUSES = ["pending", "needs_update", "approved", "rejected"] as const;

export default async function AdminKyc({ params, searchParams }: PageProps<"/[locale]/admin/kyc">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const status = pickParams(query, ["status"]).status ?? "pending";
  const [t, locale, result] = await Promise.all([
    getTranslations("Admin.kyc"),
    getLocale(),
    apiGet<List<KycSubmission>>(`/admin/kyc${toQuery({ status, page: pageParam(query) })}`),
  ]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      <AdminSection>
        <StatusTabs pathname="/admin/kyc" current={status} tabs={STATUSES.map((value) => ({ value, label: t(`status.${value}`) }))} />
        <AdminTable head={[t("name"), t("document"), t("submitted"), t("state"), ""]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((k) => (
            <tr key={k.id}>
              <Cell className="font-medium">{k.fullName}</Cell>
              <Cell>
                <div>{t(`documents.${k.documentType}`)}</div>
                <div className="text-xs text-muted" dir="ltr">{k.documentNumber}</div>
              </Cell>
              <Cell className="whitespace-nowrap">{dateTime(k.submittedAt, locale)}</Cell>
              <Cell>
                <StatusPill tone={toneFor(k.status)}>{t(`status.${k.status}`)}</StatusPill>
              </Cell>
              <Cell className="text-end">
                <Link href={`/admin/kyc/${k.id}`} className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-semibold hover:border-brand">
                  {t("review")}
                </Link>
              </Cell>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/kyc" query={{ status }} />
      </AdminSection>
    </>
  );
}
