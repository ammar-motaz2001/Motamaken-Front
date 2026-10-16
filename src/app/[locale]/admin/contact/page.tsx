import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { apiGet } from "@/lib/api/server";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { ActionButton, AdminHeader, AdminSection, StatusTabs, dateTime, type ContactMessage, type List } from "@/modules/admin";

export default async function AdminContact({ params, searchParams }: PageProps<"/[locale]/admin/contact">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const status = pickParams(query, ["status"]).status ?? "new";
  const [t, locale, result] = await Promise.all([
    getTranslations("Admin.contact"),
    getLocale(),
    apiGet<List<ContactMessage>>(`/admin/contact-messages${toQuery({ status, page: pageParam(query) })}`),
  ]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      <AdminSection>
        <StatusTabs pathname="/admin/contact" current={status} tabs={(["new", "handled"] as const).map((value) => ({ value, label: t(`status.${value}`) }))} />
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
                {m.status === "new" && (
                  <ActionButton label={t("handle")} endpoint={`/admin/contact-messages/${m.id}/handle`} tone="brand" fields={[{ name: "note", label: t("note"), type: "textarea", hint: t("noteHint") }]} />
                )}
              </div>
              <p className="text-sm whitespace-pre-line">{m.message}</p>
              {m.status === "handled" && (
                <p className="rounded-md bg-brand/5 px-3 py-2 text-xs text-brand">
                  {t("handledAt", { date: dateTime(m.handledAt, locale) })}
                  {m.adminNote && ` — ${m.adminNote}`}
                </p>
              )}
            </li>
          ))}
        </ul>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/contact" query={{ status }} />
      </AdminSection>
    </>
  );
}
