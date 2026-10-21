import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { ActionButton, AdminHeader, AdminSearch, AdminSection, AdminTable, Cell, StatusTabs, UserCell, dateTime, type BlacklistRow, type List } from "@/modules/admin";
import { adminGet } from "@/modules/admin/server";

const TYPES = ["email", "phone", "domain", "ip", "keyword"] as const;

/** Admin › Blacklist: blocked emails, phones, domains, IPs and keywords with add/remove, from GET /admin/blacklist. */
export default async function AdminBlacklist({ params, searchParams }: PageProps<"/[locale]/admin/blacklist">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const filter = pickParams(query, ["type", "q", "expired"]);
  const [t, locale, result] = await Promise.all([
    getTranslations("Admin.blacklist"),
    getLocale(),
    adminGet<List<BlacklistRow> & { counts: Record<string, number> }>(`/admin/blacklist${toQuery({ ...filter, page: pageParam(query) })}`),
  ]);

  return (
    <>
      <AdminHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <ActionButton
            label={t("add")}
            tone="danger"
            size="md"
            endpoint="/admin/blacklist"
            description={t("addHint")}
            fields={[
              { name: "type", label: t("type"), type: "select", required: true, defaultValue: "email", options: TYPES.map((value) => ({ value, label: t(`types.${value}`) })) },
              { name: "value", label: t("value"), required: true, hint: t("valueHint") },
              { name: "reason", label: t("reason"), type: "textarea", required: true },
              { name: "expiresAt", label: t("expiresAt"), type: "text", placeholder: "2026-12-31", hint: t("expiresHint") },
            ]}
          />
        }
      />
      <AdminSection>
        <StatusTabs
          pathname="/admin/blacklist"
          param="type"
          current={filter.type}
          keep={{ q: filter.q, expired: filter.expired }}
          tabs={[{ value: undefined, label: t("all") }, ...TYPES.map((value) => ({ value, label: t(`types.${value}`), count: result.counts[value] ?? 0 }))]}
        />
        <AdminSearch placeholder={t("search")} filters={[{ name: "expired", label: t("inForce"), options: [{ value: "1", label: t("withExpired") }] }]} />
        <AdminTable head={[t("value"), t("type"), t("reason"), t("addedBy"), t("ends"), ""]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((row) => (
            <tr key={row.id} className={row.expired ? "opacity-50" : ""}>
              <Cell className="font-mono text-sm break-all">
                <span dir="ltr">{row.value}</span>
              </Cell>
              <Cell>
                <StatusPill tone="muted">{t(`types.${row.type}`)}</StatusPill>
              </Cell>
              <Cell className="max-w-xs text-sm">{row.reason}</Cell>
              <Cell>
                <UserCell user={row.createdBy} />
                <div className="text-xs text-muted">{dateTime(row.createdAt, locale)}</div>
              </Cell>
              <Cell className="text-xs whitespace-nowrap">{row.expiresAt ? dateTime(row.expiresAt, locale) : t("never")}</Cell>
              <Cell>
                <div className="flex flex-wrap justify-end gap-1.5">
                  <ActionButton
                    label={t("edit")}
                    method="PATCH"
                    endpoint={`/admin/blacklist/${row.id}`}
                    fields={[
                      { name: "reason", label: t("reason"), type: "textarea", required: true, defaultValue: row.reason },
                      { name: "expiresAt", label: t("expiresAt"), defaultValue: row.expiresAt?.slice(0, 10) ?? "", hint: t("expiresHint") },
                    ]}
                  />
                  <ActionButton label={t("remove")} tone="danger" method="DELETE" endpoint={`/admin/blacklist/${row.id}`} confirm={t("confirmRemove", { value: row.value })} />
                </div>
              </Cell>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/blacklist" query={filter} />
      </AdminSection>
    </>
  );
}
