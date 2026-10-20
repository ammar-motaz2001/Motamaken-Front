import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { AdminHeader, AdminSearch, AdminSection, AdminTable, Cell, StatCard, StatusTabs, dateTime, type List, type MailSettings } from "@/modules/admin";
import { MailSettingsForm } from "@/modules/admin/components/MailSettingsForm";
import { adminGet, getAdminPermissions } from "@/modules/admin/server";

type MailLogRow = { id: number; to: string; subject: string | null; notification: string | null; status: "sent" | "failed"; error: string | null; createdAt: string };

export default async function AdminMail({ params, searchParams }: PageProps<"/[locale]/admin/mail">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const filter = pickParams(query, ["status", "q"]);
  const can = await getAdminPermissions();
  const [t, locale, logs, settings] = await Promise.all([
    getTranslations("Admin.mail"),
    getLocale(),
    adminGet<List<MailLogRow>>(`/admin/mail/logs${toQuery({ ...filter, page: pageParam(query) })}`),
    can.has("settings") ? adminGet<{ data: MailSettings }>("/admin/mail") : null,
  ]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      {settings && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label={t("sent24")} value={settings.data.last24h.sent} tone="brand" />
            <StatCard label={t("failed24")} value={settings.data.last24h.failed} tone={settings.data.last24h.failed ? "danger" : "default"} href="/admin/mail?status=failed" />
            <StatCard label={t("from")} value={<span className="text-sm break-all">{settings.data.fromAddress ?? "—"}</span>} />
            <StatCard label={t("transport")} value={<span className="text-sm">{settings.data.mailer}</span>} />
          </div>
          <AdminSection title={t("server")}>
            <MailSettingsForm settings={settings.data} />
          </AdminSection>
        </>
      )}
      <AdminSection title={t("log")}>
        <StatusTabs
          pathname="/admin/mail"
          current={filter.status}
          keep={{ q: filter.q }}
          tabs={[
            { value: undefined, label: t("all") },
            { value: "sent", label: t("statuses.sent") },
            { value: "failed", label: t("statuses.failed") },
          ]}
        />
        <AdminSearch placeholder={t("searchAddress")} />
        <AdminTable head={[t("to"), t("subject"), t("state"), t("date")]} empty={logs.data.length ? false : t("empty")}>
          {logs.data.map((row) => (
            <tr key={row.id}>
              <Cell className="text-xs break-all" >
                <span dir="ltr">{row.to}</span>
              </Cell>
              <Cell className="max-w-sm text-sm">
                {row.subject ?? "—"}
                {row.notification && <div className="text-xs text-muted">{row.notification}</div>}
                {row.error && <div className="mt-1 text-xs break-words text-danger">{row.error}</div>}
              </Cell>
              <Cell>
                <StatusPill tone={row.status === "sent" ? "success" : "danger"}>{t(`statuses.${row.status}`)}</StatusPill>
              </Cell>
              <Cell className="whitespace-nowrap">{dateTime(row.createdAt, locale)}</Cell>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={logs.meta.current_page} lastPage={logs.meta.last_page} pathname="/admin/mail" query={filter} />
      </AdminSection>
    </>
  );
}
