import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { apiGet } from "@/lib/api/server";
import { AdminHeader, AdminSection, AdminTable, Cell, StatCard, money, type Overview } from "@/modules/admin";

export default async function AdminOverview({ params }: PageProps<"/[locale]/admin">) {
  setRequestLocale((await params).locale);
  const [t, locale, data] = await Promise.all([getTranslations("Admin.overview"), getLocale(), apiGet<Overview>("/admin/overview")]);
  const peak = Math.max(1, ...data.series.flatMap((day) => [day.users, day.projects]));
  const number = (value: number) => new Intl.NumberFormat(locale).format(value);

  const queues = [
    { key: "pendingWithdrawals", href: "/admin/withdrawals" },
    { key: "pendingKyc", href: "/admin/kyc" },
    { key: "openDisputes", href: "/admin/disputes" },
    { key: "openReports", href: "/admin/reports" },
    { key: "newContactMessages", href: "/admin/contact" },
  ] as const;

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard label={t("users")} value={number(data.users.total)} hint={t("newThisWeek", { count: data.users.newThisWeek })} href="/admin/users" />
        <StatCard label={t("verified")} value={number(data.users.verified)} tone="brand" />
        <StatCard label={t("suspended")} value={number(data.users.suspended)} tone={data.users.suspended ? "danger" : "default"} href="/admin/users?status=suspended" />
        <StatCard
          label={t("projects")}
          value={number(Object.values(data.projects).reduce((sum, count) => sum + count, 0))}
          hint={t("openProjects", { count: data.projects.open ?? 0 })}
          href="/admin/projects"
        />
      </div>

      <AdminSection title={t("queues")}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
          {queues.map((queue) => (
            <StatCard key={queue.key} label={t(`queue.${queue.key}`)} value={number(data.queues[queue.key])} tone={data.queues[queue.key] ? "orange" : "default"} href={queue.href} />
          ))}
        </div>
      </AdminSection>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <AdminSection title={t("activity")}>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-brand" />
              {t("newUsers")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-orange" />
              {t("newProjects")}
            </span>
          </div>
          <div className="flex h-44 items-end gap-1.5" role="img" aria-label={t("activity")}>
            {data.series.map((day) => (
              <div key={day.date} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-1" title={`${day.date}: ${day.users} / ${day.projects}`}>
                <div className="flex h-full items-end justify-center gap-0.5">
                  <span className="w-1/2 max-w-3 rounded-t bg-brand" style={{ height: `${(day.users / peak) * 100}%`, minHeight: day.users ? 4 : 0 }} />
                  <span className="w-1/2 max-w-3 rounded-t bg-orange" style={{ height: `${(day.projects / peak) * 100}%`, minHeight: day.projects ? 4 : 0 }} />
                </div>
                <span className="text-center text-[10px] text-muted">{new Date(day.date).getDate()}</span>
              </div>
            ))}
          </div>
        </AdminSection>

        <AdminSection title={t("projectsByStatus")}>
          <ul className="flex flex-col gap-3">
            {Object.entries(data.projects).map(([status, count]) => {
              const total = Math.max(1, Object.values(data.projects).reduce((sum, value) => sum + value, 0));
              return (
                <li key={status} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm">
                    <span>{t(`status.${status}`)}</span>
                    <span className="font-semibold">{number(count)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                    <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${(count / total) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </AdminSection>
      </div>

      <AdminSection title={t("money")}>
        <AdminTable head={[t("currency"), t("inWallets"), t("inEscrow"), t("revenue"), t("pendingWithdrawals")]} empty={data.money.length ? false : t("noMoney")}>
          {data.money.map((row) => (
            <tr key={row.currency}>
              <Cell className="font-semibold">{row.currency}</Cell>
              <Cell>{money(row.inWallets, row.currency, locale)}</Cell>
              <Cell>{money(row.inEscrow, row.currency, locale)}</Cell>
              <Cell className="text-brand">{money(row.revenue, row.currency, locale)}</Cell>
              <Cell className={row.pendingWithdrawals ? "text-orange" : ""}>{money(row.pendingWithdrawals, row.currency, locale)}</Cell>
            </tr>
          ))}
        </AdminTable>
      </AdminSection>
    </>
  );
}
