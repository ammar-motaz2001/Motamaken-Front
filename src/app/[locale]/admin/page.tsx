import { CircleDollarSign, Coins, FileWarning, FolderKanban, Gavel, HandCoins, Handshake, IdCard, Inbox, LifeBuoy, Medal, Megaphone, Repeat, Scale, UserPlus, Users, WalletCards } from "lucide-react";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { StatusPill } from "@/components/ui/StatusPill";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Link } from "@/i18n/navigation";
import { apiGet } from "@/lib/api/server";
import { pickParams } from "@/lib/params";
import {
  AdminSection,
  AdminTable,
  BarList,
  ExportLink,
  Cell,
  GrowthChart,
  KpiCard,
  RevenueChart,
  Sparkline,
  StatusDonut,
  money,
  percentChange,
  toneFor,
  type Overview,
} from "@/modules/admin";
import { CHART_COLORS } from "@/modules/admin/components/charts/colors";

const RANGES = ["7", "30", "90"] as const;

/** Admin › Overview: totals, queues to work, charts and newest users over a chosen range, from GET /admin/overview. */
export default async function AdminOverview({ params, searchParams }: PageProps<"/[locale]/admin">) {
  setRequestLocale((await params).locale);
  const picked = pickParams(await searchParams, ["days"]).days;
  const days = RANGES.includes(picked as (typeof RANGES)[number]) ? picked! : "30";
  const [t, td, locale, data] = await Promise.all([
    getTranslations("Admin.overview"),
    getTranslations("Admin.dashboard"),
    getLocale(),
    apiGet<Overview>(`/admin/overview?days=${days}`),
  ]);
  const number = (value: number) => new Intl.NumberFormat(locale).format(value);
  const dateTime = (value: string) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
  // "vs previous N days" only when there is a previous number to compare with.
  const vsPrevious = (current: number, previous: number) => (previous ? td("vsPrevious", { days: data.days }) : td("inPeriod", { days: data.days }));

  // Revenue is shown in the currency that earned the most in the period.
  const currencies = Object.entries(data.trends.revenue)
    .sort((a, b) => b[1].current - a[1].current)
    .map(([code]) => code);
  const allCurrencies = [...new Set([...currencies, ...Object.keys(data.trends.deposits), ...data.money.map((row) => row.currency)])];
  const mainCurrency = currencies[0] ?? data.money[0]?.currency ?? "USD";
  const revenue = data.trends.revenue[mainCurrency] ?? { current: 0, previous: 0 };
  const series = (key: "users" | "projects" | "proposals") => data.series.map((row) => row[key]);

  const queues = [
    { key: "pendingWithdrawals", href: "/admin/withdrawals", Icon: WalletCards },
    { key: "pendingKyc", href: "/admin/kyc", Icon: IdCard },
    { key: "openDisputes", href: "/admin/disputes", Icon: Scale },
    { key: "openReports", href: "/admin/reports", Icon: FileWarning },
    { key: "newContactMessages", href: "/admin/contact", Icon: Inbox },
    { key: "pendingAppeals", href: "/admin/appeals", Icon: Gavel },
    { key: "openTickets", href: "/admin/support", Icon: LifeBuoy },
    { key: "pendingDeposits", href: "/admin/deposits?status=pending", Icon: HandCoins },
  ] as const;
  const waiting = queues.reduce((sum, queue) => sum + data.queues[queue.key], 0);

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">{t("title")}</h2>
          <p className="text-sm text-muted">{waiting ? td("waiting", { count: waiting }) : td("allClear")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <ExportLink dataset="overview" query={{ days }} />
        <nav aria-label={td("range")} className="flex rounded-xl border border-border bg-surface p-1">
          {RANGES.map((range) => (
            <Link
              key={range}
              href={range === "30" ? "/admin" : `/admin?days=${range}`}
              aria-current={range === days ? "page" : undefined}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${range === days ? "bg-brand text-white" : "text-muted hover:text-foreground"}`}
            >
              {td(`ranges.${range}`)}
            </Link>
          ))}
        </nav>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label={td("newUsers")}
          value={number(data.trends.users.current)}
          Icon={UserPlus}
          delta={percentChange(data.trends.users.current, data.trends.users.previous)}
          deltaLabel={vsPrevious(data.trends.users.current, data.trends.users.previous)}
          chart={<Sparkline id="users" values={series("users")} color={CHART_COLORS.brand} />}
          href="/admin/users"
        />
        <KpiCard
          label={td("newProjects")}
          value={number(data.trends.projects.current)}
          Icon={FolderKanban}
          tone="orange"
          delta={percentChange(data.trends.projects.current, data.trends.projects.previous)}
          deltaLabel={vsPrevious(data.trends.projects.current, data.trends.projects.previous)}
          chart={<Sparkline id="projects" values={series("projects")} color={CHART_COLORS.orange} />}
          href="/admin/projects"
        />
        <KpiCard
          label={td("newOffers")}
          value={number(data.trends.proposals.current)}
          Icon={Handshake}
          tone="link"
          delta={percentChange(data.trends.proposals.current, data.trends.proposals.previous)}
          deltaLabel={vsPrevious(data.trends.proposals.current, data.trends.proposals.previous)}
          chart={<Sparkline id="offers" values={series("proposals")} color={CHART_COLORS.link} />}
        />
        <KpiCard
          label={td("revenue")}
          value={money(revenue.current, mainCurrency, locale)}
          Icon={CircleDollarSign}
          delta={percentChange(revenue.current, revenue.previous)}
          deltaLabel={vsPrevious(revenue.current, revenue.previous)}
          chart={<Sparkline id="revenue" values={data.series.map((row) => row.revenue[mainCurrency] ?? 0)} color={CHART_COLORS.brandLight} />}
          href="/admin/ledger"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <AdminSection title={td("growth")}>
          <GrowthChart series={data.series} />
        </AdminSection>
        <AdminSection title={t("projectsByStatus")}>
          <StatusDonut projects={data.projects} />
        </AdminSection>
      </div>

      <AdminSection title={td("waitingTitle")}>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {queues.map(({ key, href, Icon }) => {
            const count = data.queues[key];
            return (
              <Link
                key={key}
                href={href}
                className={`group flex items-center gap-3 rounded-xl border p-3 transition-colors ${count ? "border-orange/40 bg-orange/5 hover:bg-orange/10" : "border-border hover:border-brand"}`}
              >
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${count ? "bg-orange text-white" : "bg-surface-muted text-muted"}`}>
                  <Icon className="size-4.5" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className={`text-xl leading-tight font-bold ${count ? "text-orange" : ""}`}>{number(count)}</span>
                  <span className="truncate text-xs text-muted">{t(`queue.${key}`)}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </AdminSection>

      <div className="grid gap-5 lg:grid-cols-3">
        <AdminSection title={td("usersByType")}>
          <BarList
            format={number}
            rows={(["client", "freelancer", "influencer"] as const).map((type, index) => ({
              label: td(`types.${type}`),
              value: data.usersByType[type] ?? 0,
              tone: ["bg-brand", "bg-link", "bg-orange"][index],
            }))}
          />
        </AdminSection>
        <AdminSection title={td("offersByStatus")}>
          <BarList format={number} rows={Object.entries(data.proposals).map(([status, value]) => ({ label: td(`offerStatus.${status}`), value }))} />
        </AdminSection>
        <AdminSection title={td("influencerRequests")}>
          <BarList format={number} rows={Object.entries(data.influencerRequests).map(([status, value]) => ({ label: t(`status.${status}`), value, tone: "bg-orange" }))} />
        </AdminSection>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {(
          [
            { key: "activeSubscriptions", Icon: Repeat, href: "/admin/subscriptions" },
            { key: "activePromotions", Icon: Megaphone, href: "/admin/promotions?state=active" },
            { key: "pointsIssued", Icon: Coins, href: "/admin/points" },
            { key: "pointsSpent", Icon: Coins, href: "/admin/points" },
            { key: "medalsAwarded", Icon: Medal, href: "/admin/medals" },
          ] as const
        ).map(({ key, Icon, href }) => (
          <Link key={key} href={href} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 hover:border-brand">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
              <Icon className="size-4.5" aria-hidden />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-xl leading-tight font-bold">{number(data.engagement[key])}</span>
              <span className="truncate text-xs text-muted">{td(`engagement.${key}`, { days: data.days })}</span>
            </span>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <AdminSection title={td("money")}>
          <RevenueChart series={data.series} currencies={allCurrencies.length ? allCurrencies : [mainCurrency]} />
        </AdminSection>
        <AdminSection title={td("topCategories")}>
          {data.topCategories.length ? (
            <ul className="flex flex-col gap-3.5">
              {data.topCategories.map((category, index) => {
                const max = data.topCategories[0].projects || 1;
                return (
                  <li key={category.id} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-surface-muted text-[11px] font-bold text-muted">{index + 1}</span>
                        <span className="truncate">{category.name}</span>
                      </span>
                      <span className="font-semibold">{number(category.projects)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                      <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${(category.projects / max) * 100}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-8 text-center text-sm text-muted">{td("noProjects")}</p>
          )}
        </AdminSection>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <AdminSection title={td("latestUsers")} actions={<Link href="/admin/users" className="text-sm text-link hover:underline">{td("seeAll")}</Link>}>
          <ul className="flex flex-col divide-y divide-border">
            {data.recent.users.map((user) => (
              <li key={user.id}>
                <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3 py-2.5 hover:text-brand">
                  <UserAvatar name={user.fullName} src={user.avatarUrl} size={36} />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{user.fullName}</span>
                    <span className="text-xs text-muted">{dateTime(user.createdAt)}</span>
                  </span>
                  <StatusPill tone={user.isVerified ? "success" : "muted"}>{td(user.isVerified ? "verified" : "unverified")}</StatusPill>
                </Link>
              </li>
            ))}
          </ul>
        </AdminSection>
        <AdminSection title={td("latestProjects")} actions={<Link href="/admin/projects" className="text-sm text-link hover:underline">{td("seeAll")}</Link>}>
          <ul className="flex flex-col divide-y divide-border">
            {data.recent.projects.map((project) => (
              <li key={project.id}>
                <Link href={`/projects/${project.id}`} className="flex items-center gap-3 py-2.5 hover:text-brand">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-orange/10 text-orange">
                    <FolderKanban className="size-4" aria-hidden />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{project.title}</span>
                    <span className="truncate text-xs text-muted">
                      {project.owner} · {money(project.budget.min, project.budget.currency, locale)}–{money(project.budget.max, project.budget.currency, locale)}
                    </span>
                  </span>
                  <StatusPill tone={toneFor(project.status)}>{t(`status.${project.status}`)}</StatusPill>
                </Link>
              </li>
            ))}
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
        <p className="flex items-center gap-1.5 text-xs text-muted">
          <Users className="size-3.5" aria-hidden />
          {td("usersLine", { total: number(data.users.total), verified: number(data.users.verified), suspended: number(data.users.suspended) })}
        </p>
      </AdminSection>
    </>
  );
}
