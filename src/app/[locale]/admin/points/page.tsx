import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { AdminHeader, AdminSearch, AdminSection, AdminTable, BarList, Cell, ExportLink, StatCard, StatusTabs, UserCell, dateTime, type List, type Person, type PointRule } from "@/modules/admin";
import { PointRulesEditor } from "@/modules/admin/components/PointRulesEditor";
import { adminGet } from "@/modules/admin/server";

type Report = {
  days: number;
  outstanding: number;
  byReason: { reason: string; label: string; earned: number; spent: number; count: number }[];
  topUsers: (Person & { points: number })[];
};

type Movement = { id: number; user: Person | null; amount: number; reason: string; label: string; manual: boolean; createdAt: string };

export default async function AdminPoints({ params, searchParams }: PageProps<"/[locale]/admin/points">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const filter = pickParams(query, ["direction", "reason", "userId", "days"]);
  const [t, locale, rules, report, movements] = await Promise.all([
    getTranslations("Admin.points"),
    getLocale(),
    adminGet<{ data: PointRule[] }>("/admin/points/rules"),
    adminGet<{ data: Report }>(`/admin/points/report${toQuery({ days: filter.days })}`),
    adminGet<List<Movement>>(`/admin/points/transactions${toQuery({ direction: filter.direction, reason: filter.reason, userId: filter.userId, page: pageParam(query) })}`),
  ]);
  const number = (value: number) => new Intl.NumberFormat(locale).format(value);
  const r = report.data;

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} actions={<ExportLink dataset="points" query={filter} />} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label={t("outstanding")} value={number(r.outstanding)} hint={t("outstandingHint")} tone="brand" />
        <StatCard label={t("earned", { days: r.days })} value={number(r.byReason.reduce((sum, row) => sum + row.earned, 0))} />
        <StatCard label={t("spent", { days: r.days })} value={number(r.byReason.reduce((sum, row) => sum + row.spent, 0))} tone="orange" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <AdminSection title={t("distribution", { days: r.days })}>
          <BarList format={number} rows={r.byReason.filter((row) => row.earned).map((row) => ({ label: row.label, value: row.earned }))} empty={t("none")} />
          {r.byReason.some((row) => row.spent) && (
            <>
              <p className="text-xs font-semibold text-muted uppercase">{t("spentOn")}</p>
              <BarList format={number} rows={r.byReason.filter((row) => row.spent).map((row) => ({ label: row.label, value: row.spent, tone: "bg-orange" }))} />
            </>
          )}
        </AdminSection>
        <AdminSection title={t("topHolders")}>
          <ul className="flex flex-col gap-2">
            {r.topUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-2">
                <UserCell user={u} />
                <span className="font-semibold tabular-nums">{number(u.points)}</span>
              </li>
            ))}
          </ul>
        </AdminSection>
      </div>

      <AdminSection title={t("rules")}>
        <p className="text-sm text-muted">{t("rulesHint")}</p>
        <PointRulesEditor rules={rules.data} />
      </AdminSection>

      <AdminSection title={t("history")}>
        <StatusTabs
          pathname="/admin/points"
          param="direction"
          current={filter.direction}
          keep={{ reason: filter.reason, userId: filter.userId }}
          tabs={[
            { value: undefined, label: t("all") },
            { value: "earned", label: t("given") },
            { value: "spent", label: t("used") },
          ]}
        />
        <AdminSearch filters={[{ name: "reason", label: t("anyReason"), options: [...rules.data.map((rule) => ({ value: rule.reason, label: rule.label })), { value: "admin_adjustment", label: t("manual") }, { value: "draw_tickets", label: t("drawTickets") }] }]} />
        <AdminTable head={[t("user"), t("points"), t("reason"), t("date")]} empty={movements.data.length ? false : t("none")}>
          {movements.data.map((m) => (
            <tr key={m.id}>
              <Cell>
                <UserCell user={m.user} />
              </Cell>
              <Cell className={`font-semibold tabular-nums ${m.amount < 0 ? "text-danger" : "text-brand"}`}>{m.amount > 0 ? `+${number(m.amount)}` : number(m.amount)}</Cell>
              <Cell className="text-sm">
                {m.label} {m.manual && <StatusPill tone="muted">{t("manual")}</StatusPill>}
              </Cell>
              <Cell className="whitespace-nowrap">{dateTime(m.createdAt, locale)}</Cell>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={movements.meta.current_page} lastPage={movements.meta.last_page} pathname="/admin/points" query={filter} />
      </AdminSection>
    </>
  );
}
