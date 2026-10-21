import { ShieldCheck } from "lucide-react";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { pickParams, toQuery } from "@/lib/params";
import { AdminHeader, AdminSection, BarList, StatCard } from "@/modules/admin";
import { adminGet } from "@/modules/admin/server";

type Stats = {
  days: number;
  conversations: { total: number; direct: number; group: number; active: number };
  messages: { total: number; period: number; byType: Record<string, number>; removed: number };
  files: { count: number; bytes: number; byMime: Record<string, number> };
  series: { date: string; messages: number }[];
  byHour: number[];
  reports: { open: number; total: number };
  topSenders: { id: number; fullName: string; messages: number }[];
};

const RANGES = ["7", "30", "90"] as const;

/** Admin › Messages: chat activity stats (conversations, messages by type, top senders) from GET /admin/messages/stats. */
export default async function AdminMessages({ params, searchParams }: PageProps<"/[locale]/admin/messages">) {
  setRequestLocale((await params).locale);
  const picked = pickParams(await searchParams, ["days"]).days;
  const days = RANGES.includes(picked as (typeof RANGES)[number]) ? picked! : "30";
  const [t, locale, { data }] = await Promise.all([getTranslations("Admin.messages"), getLocale(), adminGet<{ data: Stats }>(`/admin/messages/stats${toQuery({ days })}`)]);
  const number = (value: number) => new Intl.NumberFormat(locale).format(value);
  const size = (bytes: number) => (bytes > 1073741824 ? `${(bytes / 1073741824).toFixed(1)} GB` : `${(bytes / 1048576).toFixed(1)} MB`);
  const peak = Math.max(1, ...data.series.map((d) => d.messages));
  const hourPeak = Math.max(1, ...data.byHour);

  return (
    <>
      <AdminHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <nav className="flex rounded-xl border border-border bg-surface p-1">
            {RANGES.map((range) => (
              <Link
                key={range}
                href={`/admin/messages?days=${range}`}
                aria-current={range === days ? "page" : undefined}
                className={`rounded-lg px-3 py-1 text-sm ${range === days ? "bg-brand text-white" : "text-muted"}`}
              >
                {t("days", { count: Number(range) })}
              </Link>
            ))}
          </nav>
        }
      />
      <p className="flex items-center gap-2 rounded-lg bg-brand/5 px-4 py-3 text-sm text-brand">
        <ShieldCheck className="size-4 shrink-0" aria-hidden /> {t("privacy")}
      </p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label={t("conversations")} value={number(data.conversations.total)} hint={t("split", { direct: data.conversations.direct, group: data.conversations.group })} />
        <StatCard label={t("active")} value={number(data.conversations.active)} tone="brand" />
        <StatCard label={t("messagesPeriod")} value={number(data.messages.period)} hint={t("allTime", { count: number(data.messages.total) })} />
        <StatCard label={t("files")} value={number(data.files.count)} hint={size(data.files.bytes)} />
        <StatCard label={t("reported")} value={number(data.reports.open)} hint={t("reportsTotal", { count: data.reports.total })} tone={data.reports.open ? "danger" : "default"} href="/admin/reports?targetType=message" />
        <StatCard label={t("removed")} value={number(data.messages.removed)} />
      </div>
      <AdminSection title={t("perDay")}>
        <div className="flex h-40 items-end gap-0.5" role="img" aria-label={t("perDay")}>
          {data.series.map((d) => (
            <div key={d.date} title={`${d.date}: ${d.messages}`} className="flex-1 rounded-t bg-brand/70 hover:bg-brand" style={{ height: `${Math.max(2, (d.messages / peak) * 100)}%` }} />
          ))}
        </div>
      </AdminSection>
      <div className="grid gap-5 lg:grid-cols-3">
        <AdminSection title={t("byType")}>
          <BarList format={number} rows={Object.entries(data.messages.byType).map(([type, value]) => ({ label: t(`types.${type}`), value }))} empty={t("none")} />
          <p className="text-xs font-semibold text-muted uppercase">{t("fileKinds")}</p>
          <BarList format={number} rows={Object.entries(data.files.byMime).map(([kind, value]) => ({ label: kind, value, tone: "bg-orange" }))} empty={t("none")} />
        </AdminSection>
        <AdminSection title={t("byHour")}>
          <div className="flex h-32 items-end gap-0.5">
            {data.byHour.map((count, hour) => (
              <div key={hour} title={`${hour}:00 — ${count}`} className="flex-1 rounded-t bg-link/70" style={{ height: `${Math.max(2, (count / hourPeak) * 100)}%` }} />
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-muted" dir="ltr">
            <span>00</span>
            <span>06</span>
            <span>12</span>
            <span>18</span>
            <span>23</span>
          </div>
        </AdminSection>
        <AdminSection title={t("topSenders")}>
          <p className="text-xs text-muted">{t("topSendersHint")}</p>
          <ul className="flex flex-col gap-1.5 text-sm">
            {data.topSenders.map((s) => (
              <li key={s.id} className="flex justify-between gap-2">
                <Link href={`/admin/users/${s.id}`} className="truncate hover:text-brand">
                  {s.fullName}
                </Link>
                <span className="tabular-nums">{number(s.messages)}</span>
              </li>
            ))}
          </ul>
        </AdminSection>
      </div>
    </>
  );
}
