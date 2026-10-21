import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { StatusPill } from "@/components/ui/StatusPill";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Link } from "@/i18n/navigation";
import { getCurrencies } from "@/lib/api/reference";
import { pickParams } from "@/lib/params";
import {
  ActionButton,
  AdminHeader,
  AdminSection,
  AdminTable,
  Cell,
  GrantMedal,
  InfoGrid,
  StatCard,
  StatusTabs,
  UserCell,
  dateTime,
  money,
  toneFor,
  type AdminMedal,
  type AdminUserDetail,
  type UserActivity,
  type WalletBalance,
} from "@/modules/admin";
import { adminGet, getAdminPermissions } from "@/modules/admin/server";

const TABS = ["projects", "proposals", "reviews", "points", "kyc", "sessions", "reports", "notes", "log"] as const;

/** Admin › User: account, wallet, activity, notes and medals with ban/adjust actions, from GET /admin/users/{id}; sections follow the role. */
export default async function AdminUserPage({ params, searchParams }: PageProps<"/[locale]/admin/users/[id]">) {
  const { locale: routeLocale, id } = await params;
  setRequestLocale(routeLocale);
  if (!/^\d+$/.test(id)) notFound();
  const tab = (pickParams(await searchParams, ["tab"]).tab ?? "projects") as (typeof TABS)[number];
  const can = await getAdminPermissions();
  const [t, tp, locale, currencies, result, { data: activity }, medals] = await Promise.all([
    getTranslations("Admin.users"),
    getTranslations("Admin.proposals"),
    getLocale(),
    getCurrencies(),
    adminGet<{ data: AdminUserDetail; wallet: WalletBalance[] }>(`/admin/users/${id}`),
    adminGet<{ data: UserActivity }>(`/admin/users/${id}/activity`),
    can.has("rewards") ? adminGet<{ data: AdminMedal[] }>("/admin/medals") : null,
  ]);
  const user = result.data;
  const stats = user.stats;
  const ar = locale === "ar";
  const when = (value: string | null) => dateTime(value, locale);

  return (
    <>
      <AdminHeader
        title={user.fullName}
        subtitle={`@${user.username} · #${user.id}`}
        actions={
          <>
            <Link href={`/users/${user.id}`} className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-semibold hover:border-brand">
              {t("publicProfile")}
            </Link>
            {can.has("users.wallet") && (
              <ActionButton
                label={t("adjust")}
                endpoint={`/admin/users/${user.id}/adjust`}
                tone="orange"
                description={t("adjustHint")}
                fields={[
                  { name: "amount", label: t("amount"), type: "number", step: "0.01", required: true, hint: t("amountHint") },
                  { name: "currency", label: t("currency"), type: "select", required: true, defaultValue: "USD", options: currencies.map((c) => ({ value: c.code, label: c.code })) },
                  { name: "reason", label: t("reason"), type: "textarea", required: true },
                ]}
              />
            )}
            {can.has("rewards") && (
              <>
                <ActionButton
                  label={t("points")}
                  endpoint={`/admin/users/${user.id}/points`}
                  description={t("pointsHint")}
                  fields={[
                    { name: "amount", label: t("pointsAmount"), type: "number", required: true, hint: t("amountHint") },
                    { name: "note", label: t("reason"), type: "text", required: true },
                  ]}
                />
                {medals && <GrantMedal userId={user.id} medals={medals.data.filter((m) => m.isActive).map((m) => ({ id: m.id, name: ar ? m.nameAr : m.nameEn }))} />}
              </>
            )}
            {can.has("users.manage") && user.profile && (
              <ActionButton
                label={user.profile.isFeatured ? t("unfeature") : t("feature")}
                endpoint={`/admin/profiles/${user.profile.id}/feature`}
                body={user.profile.isFeatured ? { days: 0 } : undefined}
                fields={user.profile.isFeatured ? undefined : [{ name: "days", label: t("days"), type: "number", required: true, defaultValue: "7" }]}
              />
            )}
            {can.has("users.manage") && !user.isAdmin && (
              <>
                <ActionButton label={t("signOutEverywhere")} endpoint={`/admin/users/${user.id}/sessions/revoke`} confirm={t("confirmSignOut")} />
                {user.suspendedAt ? (
                  <ActionButton label={t("unsuspend")} endpoint={`/admin/users/${user.id}/unsuspend`} tone="brand" confirm={t("confirmUnsuspend")} />
                ) : (
                  <>
                    <ActionButton
                      label={t("suspend")}
                      endpoint={`/admin/users/${user.id}/suspend`}
                      tone="danger"
                      description={t("suspendHint")}
                      fields={[
                        { name: "reason", label: t("reason"), type: "textarea", required: true },
                        { name: "days", label: t("suspendDays"), type: "number", hint: t("suspendDaysHint") },
                      ]}
                    />
                    <ActionButton
                      label={t("ban")}
                      endpoint={`/admin/users/${user.id}/ban`}
                      tone="danger"
                      description={t("banHint")}
                      fields={[
                        { name: "reason", label: t("reason"), type: "textarea", required: true },
                        { name: "blacklist", label: t("banBlacklist"), type: "checkbox", defaultValue: "1" },
                      ]}
                    />
                  </>
                )}
              </>
            )}
          </>
        }
      />

      <AdminSection>
        <div className="flex flex-wrap items-start gap-4">
          <UserAvatar name={user.fullName} src={user.avatarUrl} size={64} />
          <div className="min-w-0 flex-1">
            <InfoGrid
              items={[
                { label: t("email"), value: <span className="break-all">{user.email ?? "—"}</span> },
                { label: t("phone"), value: <span dir="ltr">{user.phone ?? "—"}</span> },
                { label: t("type"), value: user.accountType ? t(`types.${user.accountType}`) : "—" },
                { label: t("identity"), value: <StatusPill tone={toneFor(user.kycStatus)}>{t(`kyc.${user.kycStatus}`)}</StatusPill> },
                { label: t("twoFactor"), value: user.twoFactor ? t("twoFactorOn", { method: user.twoFactorMethod ?? "" }) : t("twoFactorOff") },
                { label: t("points"), value: user.points },
                { label: t("joined"), value: when(user.createdAt) },
                { label: t("lastSeen"), value: when(user.lastSeenAt) },
                { label: t("registrationIp"), value: <span dir="ltr">{user.registrationIp ?? "—"}</span> },
                { label: t("verifiedEmail"), value: when(user.emailVerifiedAt) },
                { label: t("verifiedPhone"), value: when(user.phoneVerifiedAt) },
                {
                  label: t("referredBy"),
                  value: user.referredBy ? (
                    <Link href={`/admin/users/${user.referredBy.id}`} className="text-link hover:underline">
                      {user.referredBy.fullName}
                    </Link>
                  ) : (
                    "—"
                  ),
                },
              ]}
            />
          </div>
        </div>
        {user.suspendedAt && (
          <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
            {user.suspendedUntil ? t("suspendedUntil", { date: when(user.suspendedUntil) }) : t("suspendedSince", { date: when(user.suspendedAt) })} — {user.suspensionReason}
          </p>
        )}
        {user.profile && (
          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <p className="flex flex-wrap items-center gap-2 font-semibold">
              {user.profile.jobTitle ?? "—"} {user.profile.isFeatured && <StatusPill tone="warning">{t("featured")}</StatusPill>}
            </p>
            {user.profile.bio && <p className="text-sm whitespace-pre-line text-muted">{user.profile.bio}</p>}
            {user.profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {user.profile.skills.map((skill) => (
                  <span key={skill} className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs">
                    {skill}
                  </span>
                ))}
              </div>
            )}
            {user.profile.channels.length > 0 && (
              <ul className="flex flex-wrap gap-3 text-xs">
                {user.profile.channels.map((channel, index) => (
                  <li key={index}>
                    <span className="font-semibold">{channel.platform}</span>{" "}
                    {channel.url ? (
                      <a href={channel.url} target="_blank" rel="noreferrer noopener" className="text-link hover:underline">
                        @{channel.handle}
                      </a>
                    ) : (
                      `@${channel.handle}`
                    )}
                    {channel.followers ? ` · ${new Intl.NumberFormat(locale).format(channel.followers)}` : ""}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </AdminSection>

      {stats && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label={t("projects")} value={stats.projects} href={`/admin/projects?userId=${user.id}`} />
          <StatCard label={t("offers")} value={stats.offers} hint={t("acceptedHint", { count: stats.acceptedOffers })} href={`/admin/proposals?userId=${user.id}`} />
          <StatCard label={t("rating")} value={stats.rating ? `${stats.rating} ★` : "—"} hint={t("reviewsHint", { count: stats.reviewsReceived })} tone="orange" />
          <StatCard label={t("openDisputes")} value={stats.openDisputes} tone={stats.openDisputes ? "orange" : "default"} />
          <StatCard label={t("reportsAgainst")} value={stats.reportsAgainst} tone={stats.reportsAgainst ? "danger" : "default"} />
          <StatCard label={t("referrals")} value={stats.referrals} />
          <StatCard label={t("sessions")} value={activity.sessions.length} />
          <StatCard label={t("medals")} value={activity.medals.length} />
        </div>
      )}

      <AdminSection title={t("wallet")}>
        <AdminTable head={[t("currency"), t("available"), t("inEscrow"), t("incoming"), t("pendingWithdrawals")]} empty={result.wallet.length ? false : t("noWallet")}>
          {result.wallet.map((row) => (
            <tr key={row.currency}>
              <Cell className="font-semibold">{row.currency}</Cell>
              <Cell className="text-brand">{money(row.available, row.currency, locale)}</Cell>
              <Cell>{money(row.inEscrow, row.currency, locale)}</Cell>
              <Cell>{money(row.incoming, row.currency, locale)}</Cell>
              <Cell>{money(row.pendingWithdrawals, row.currency, locale)}</Cell>
            </tr>
          ))}
        </AdminTable>
        <div className="flex flex-wrap gap-4 text-sm">
          <Link href={`/admin/ledger?userId=${user.id}`} className="text-link hover:underline">
            {t("ledger")}
          </Link>
          <Link href={`/admin/deposits?userId=${user.id}`} className="text-link hover:underline">
            {t("depositsLink")}
          </Link>
          <Link href={`/admin/support?userId=${user.id}`} className="text-link hover:underline">
            {t("ticketsLink")}
          </Link>
        </div>
      </AdminSection>

      <AdminSection>
        <StatusTabs param="tab" pathname={`/admin/users/${user.id}`} current={tab} tabs={TABS.map((value) => ({ value, label: t(`tabs.${value}`) }))} />

        {tab === "projects" && (
          <AdminTable head={[t("project"), t("status"), t("budget"), t("offers"), t("date")]} empty={activity.projects.length ? false : t("none")}>
            {activity.projects.map((p) => (
              <tr key={p.id}>
                <Cell>
                  <Link href={`/admin/projects/${p.id}`} className="font-medium hover:text-brand">
                    {p.title}
                  </Link>{" "}
                  {p.hidden && <StatusPill tone="danger">{t("hidden")}</StatusPill>}
                </Cell>
                <Cell>
                  <StatusPill tone={toneFor(p.status)}>{p.status.replaceAll("_", " ")}</StatusPill>
                </Cell>
                <Cell className="whitespace-nowrap">
                  {money(p.budgetMin, p.currency, locale)} – {money(p.budgetMax, p.currency, locale)}
                </Cell>
                <Cell>{p.proposals}</Cell>
                <Cell className="whitespace-nowrap">{when(p.createdAt)}</Cell>
              </tr>
            ))}
          </AdminTable>
        )}

        {tab === "proposals" && (
          <AdminTable head={[t("project"), t("status"), t("amount"), t("delivery"), t("date")]} empty={activity.proposals.length ? false : t("none")}>
            {activity.proposals.map((p) => (
              <tr key={p.id}>
                <Cell>
                  <Link href={`/admin/projects/${p.projectId}`} className="font-medium hover:text-brand">
                    {p.project ?? `#${p.projectId}`}
                  </Link>
                </Cell>
                <Cell>
                  <StatusPill tone={toneFor(p.status)}>{tp(`statuses.${p.status}`)}</StatusPill>
                </Cell>
                <Cell>{money(p.amount, p.currency, locale)}</Cell>
                <Cell>{t("deliveryDays", { days: p.deliveryDays })}</Cell>
                <Cell className="whitespace-nowrap">{when(p.createdAt)}</Cell>
              </tr>
            ))}
          </AdminTable>
        )}

        {tab === "reviews" && (
          <div className="grid gap-5 lg:grid-cols-2">
            {(["reviewsReceived", "reviewsGiven"] as const).map((key) => (
              <div key={key} className="flex flex-col gap-2">
                <p className="font-semibold">{t(key)}</p>
                {activity[key].length ? (
                  <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
                    {activity[key].map((r) => (
                      <li key={r.id} className="flex flex-col gap-1 p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-orange">{"★".repeat(r.rating)}</span>
                          {r.hidden && <StatusPill tone="danger">{t("hidden")}</StatusPill>}
                        </div>
                        {r.comment && <p className="text-muted">{r.comment}</p>}
                        <span className="text-xs text-muted">
                          {r.user?.fullName} · {when(r.createdAt)}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted">{t("none")}</p>
                )}
              </div>
            ))}
            <Link href={`/admin/reviews?userId=${user.id}`} className="text-sm text-link hover:underline">
              {t("manageReviews")}
            </Link>
          </div>
        )}

        {tab === "points" && (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <AdminTable head={[t("points"), t("reason"), t("date")]} empty={activity.points.length ? false : t("none")}>
              {activity.points.map((p) => (
                <tr key={p.id}>
                  <Cell className={p.amount < 0 ? "text-danger" : "text-brand"}>{p.amount > 0 ? `+${p.amount}` : p.amount}</Cell>
                  <Cell className="text-xs">
                    {p.reason === "admin_adjustment" ? String(p.meta?.note ?? "") : p.reason.replaceAll("_", " ")} {p.manual && <StatusPill tone="muted">{t("manual")}</StatusPill>}
                  </Cell>
                  <Cell className="whitespace-nowrap">{when(p.createdAt)}</Cell>
                </tr>
              ))}
            </AdminTable>
            <div className="flex flex-col gap-2">
              <p className="font-semibold">{t("medals")}</p>
              {activity.medals.length ? (
                <ul className="flex flex-col gap-2">
                  {activity.medals.map((m) => {
                    const medalId = medals?.data.find((x) => x.code === m.code)?.id;
                    return (
                      <li key={m.code} className="flex items-center justify-between gap-2 rounded-lg border border-border p-2.5 text-sm">
                        <span>
                          {m.name ?? m.code}
                          {m.manual && <span className="block text-xs text-muted">{m.reason}</span>}
                        </span>
                        <span className="flex items-center gap-2 text-xs text-muted">
                          {when(m.awardedAt)}
                          {can.has("rewards") && medalId && (
                            <ActionButton label={t("revoke")} tone="danger" method="DELETE" endpoint={`/admin/medals/${medalId}/holders/${user.id}`} confirm={t("confirmRevoke")} />
                          )}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted">{t("none")}</p>
              )}
            </div>
          </div>
        )}

        {tab === "kyc" && (
          <AdminTable head={[t("status"), t("note"), t("by"), t("date")]} empty={activity.kyc.length ? false : t("none")}>
            {activity.kyc.map((e) => (
              <tr key={e.id}>
                <Cell>
                  <Link href={`/admin/kyc/${e.submissionId}`}>
                    <StatusPill tone={toneFor(e.status === "submitted" ? "pending" : e.status)}>{t(`kycEvents.${e.status}`)}</StatusPill>
                  </Link>
                </Cell>
                <Cell className="text-sm">{e.note ?? "—"}</Cell>
                <Cell>{e.actor?.fullName ?? "—"}</Cell>
                <Cell className="whitespace-nowrap">{when(e.createdAt)}</Cell>
              </tr>
            ))}
          </AdminTable>
        )}

        {tab === "sessions" && (
          <AdminTable head={[t("device"), t("ip"), t("lastUsed"), t("since")]} empty={activity.sessions.length ? false : t("none")}>
            {activity.sessions.map((s) => (
              <tr key={s.id}>
                <Cell className="max-w-sm truncate text-xs">{s.userAgent ?? "—"}</Cell>
                <Cell>
                  <span dir="ltr">{s.ip ?? "—"}</span>
                </Cell>
                <Cell className="whitespace-nowrap">{when(s.lastUsedAt)}</Cell>
                <Cell className="whitespace-nowrap">{when(s.createdAt)}</Cell>
              </tr>
            ))}
          </AdminTable>
        )}

        {tab === "reports" && (
          <AdminTable head={[t("reason"), t("reporter"), t("status"), t("date")]} empty={activity.reports.length ? false : t("none")}>
            {activity.reports.map((r) => (
              <tr key={r.id}>
                <Cell>
                  <span className="font-medium">{r.reason}</span>
                  {r.details && <p className="text-xs text-muted">{r.details}</p>}
                </Cell>
                <Cell>
                  <UserCell user={r.reporter} />
                </Cell>
                <Cell>
                  <StatusPill tone={toneFor(r.status)}>{r.status}</StatusPill>
                </Cell>
                <Cell className="whitespace-nowrap">{when(r.createdAt)}</Cell>
              </tr>
            ))}
          </AdminTable>
        )}

        {tab === "notes" && (
          <div className="flex flex-col gap-3">
            {can.has("users.manage") && (
              <div className="flex justify-end">
                <ActionButton label={t("addNote")} tone="brand" endpoint={`/admin/users/${user.id}/notes`} description={t("noteHint")} fields={[{ name: "body", label: t("note"), type: "textarea", required: true }]} />
              </div>
            )}
            {activity.notes.length ? (
              <ul className="flex flex-col gap-2">
                {activity.notes.map((n) => (
                  <li key={n.id} className="rounded-lg border border-border bg-orange/5 p-3">
                    <p className="text-sm whitespace-pre-line">{n.body}</p>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted">
                      <span>
                        {n.author?.fullName} · {when(n.createdAt)}
                      </span>
                      {can.has("users.manage") && <ActionButton label={t("delete")} tone="danger" method="DELETE" endpoint={`/admin/users/${user.id}/notes/${n.id}`} confirm={t("confirmDeleteNote")} />}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">{t("noNotes")}</p>
            )}
          </div>
        )}

        {tab === "log" && (
          <AdminTable head={[t("action"), t("by"), t("details"), t("date")]} empty={activity.adminLog.length ? false : t("none")}>
            {activity.adminLog.map((l) => (
              <tr key={l.id}>
                <Cell className="font-mono text-xs">{l.action}</Cell>
                <Cell>{l.admin?.fullName ?? "—"}</Cell>
                <Cell className="max-w-md text-xs break-all text-muted">{l.changes ? JSON.stringify((l.changes as { input?: unknown }).input ?? l.changes) : "—"}</Cell>
                <Cell className="whitespace-nowrap">{when(l.createdAt)}</Cell>
              </tr>
            ))}
          </AdminTable>
        )}
      </AdminSection>
    </>
  );
}
