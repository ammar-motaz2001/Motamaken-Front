import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { ActionButton, AdminHeader, AdminSearch, AdminSection, ExportLink, StatusTabs, dateTime, type ContactMessage, type List } from "@/modules/admin";
import { adminGet } from "@/modules/admin/server";

const TOPICS = ["general", "account", "payments", "disputes", "technical", "partnership", "other"] as const;

export default async function AdminContact({ params, searchParams }: PageProps<"/[locale]/admin/contact">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const filter = pickParams(query, ["q", "topic"]);
  const tab = pickParams(query, ["tab"]).tab ?? "new";
  const archived = tab === "archived";
  const status = archived ? undefined : tab;
  const [t, locale, result] = await Promise.all([
    getTranslations("Admin.contact"),
    getLocale(),
    adminGet<List<ContactMessage> & { counts: Record<string, number> }>(
      `/admin/contact-messages${toQuery({ ...filter, status, archived: archived ? "1" : undefined, page: pageParam(query) })}`,
    ),
  ]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} actions={<ExportLink dataset="contact" query={{ ...filter, status, archived: archived ? "1" : undefined }} />} />
      <AdminSection>
        <StatusTabs
          pathname="/admin/contact"
          current={tab}
          param="tab"
          keep={{ q: filter.q, topic: filter.topic }}
          tabs={[
            { value: "new", label: t("status.new"), count: result.counts.new },
            { value: "handled", label: t("status.handled"), count: result.counts.handled },
            { value: "archived", label: t("archive"), count: result.counts.archived },
          ]}
        />
        <AdminSearch placeholder={t("search")} filters={[{ name: "topic", label: t("anyTopic"), options: TOPICS.map((value) => ({ value, label: t(`topics.${value}`) })) }]} />
        {result.data.length === 0 && <p className="py-10 text-center text-sm text-muted">{t("empty")}</p>}
        <ul className="flex flex-col gap-3">
          {result.data.map((m) => (
            <li key={m.id} className="flex flex-col gap-2 rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold">{m.subject}</p>
                  <p className="text-xs text-muted">
                    {m.name} ·{" "}
                    <a href={`mailto:${m.email}`} className="text-link hover:underline">
                      {m.email}
                    </a>{" "}
                    · {t(`topics.${m.topic}`)} · {dateTime(m.createdAt, locale)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <ActionButton
                    label={m.reply ? t("replyAgain") : t("reply")}
                    endpoint={`/admin/contact-messages/${m.id}/reply`}
                    tone="brand"
                    description={t("replyHint", { email: m.email })}
                    fields={[{ name: "body", label: t("answer"), type: "textarea", required: true }]}
                  />
                  {m.status === "new" && (
                    <ActionButton label={t("handle")} endpoint={`/admin/contact-messages/${m.id}/handle`} fields={[{ name: "note", label: t("note"), type: "textarea", hint: t("noteHint") }]} />
                  )}
                  <ActionButton label={m.archivedAt ? t("restore") : t("archiveOne")} endpoint={`/admin/contact-messages/${m.id}/archive`} body={{ archived: !m.archivedAt }} />
                </div>
              </div>
              <p className="text-sm whitespace-pre-line">{m.message}</p>
              {m.reply && (
                <div className="rounded-md border-s-4 border-brand bg-brand/5 px-3 py-2 text-sm">
                  <p className="text-xs text-brand">{t("repliedAt", { date: dateTime(m.repliedAt, locale) })}</p>
                  <p className="whitespace-pre-line">{m.reply}</p>
                </div>
              )}
              {m.status === "handled" && (
                <p className="rounded-md bg-surface-muted px-3 py-2 text-xs text-muted">
                  {t("handledAt", { date: dateTime(m.handledAt, locale) })}
                  {m.adminNote && ` — ${m.adminNote}`}
                </p>
              )}
            </li>
          ))}
        </ul>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/contact" query={{ ...filter, tab }} />
      </AdminSection>
    </>
  );
}
