import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { pageParam, toQuery } from "@/lib/params";
import { AdminHeader, AdminSection, UserCell, dateTime, type Broadcast, type List } from "@/modules/admin";
import { BroadcastForm } from "@/modules/admin/components/BroadcastForm";
import { adminGet } from "@/modules/admin/server";

/** Admin › Broadcasts: send an announcement to users and see past ones, from GET /admin/broadcasts. */
export default async function AdminBroadcasts({ params, searchParams }: PageProps<"/[locale]/admin/broadcasts">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const [t, locale, result] = await Promise.all([getTranslations("Admin.broadcasts"), getLocale(), adminGet<List<Broadcast>>(`/admin/broadcasts${toQuery({ page: pageParam(query) })}`)]);
  const ar = locale === "ar";

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      <AdminSection title={t("new")}>
        <BroadcastForm />
      </AdminSection>
      <AdminSection title={t("sent")}>
        {result.data.length === 0 && <p className="py-6 text-center text-sm text-muted">{t("empty")}</p>}
        <ul className="flex flex-col gap-3">
          {result.data.map((b) => (
            <li key={b.id} className="flex flex-col gap-1.5 rounded-lg border border-border p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-semibold">{ar ? b.titleAr : b.titleEn}</p>
                <div className="flex flex-wrap gap-1.5">
                  <StatusPill tone="muted">{b.audience === "user" && b.user ? b.user.fullName : t(`audiences.${b.audience}`)}</StatusPill>
                  {b.channels.includes("email") && <StatusPill tone="success">{t("email")}</StatusPill>}
                </div>
              </div>
              <p className="text-sm whitespace-pre-line text-muted">{ar ? b.bodyAr : b.bodyEn}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <UserCell user={b.createdBy} /> · {dateTime(b.createdAt, locale)} · {b.recipients ? t("recipients", { count: b.recipients }) : t("sending")}
              </div>
            </li>
          ))}
        </ul>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/broadcasts" />
      </AdminSection>
    </>
  );
}
