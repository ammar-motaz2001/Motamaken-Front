import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { StatusPill } from "@/components/ui/StatusPill";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Link } from "@/i18n/navigation";
import type { ApiError } from "@/lib/api/errors";
import { getCurrencies } from "@/lib/api/reference";
import { apiGet } from "@/lib/api/server";
import { ActionButton, AdminHeader, AdminSection, AdminTable, Cell, StatCard, dateTime, money, toneFor, type AdminUser, type WalletBalance } from "@/modules/admin";

export default async function AdminUserPage({ params }: PageProps<"/[locale]/admin/users/[id]">) {
  const { locale: routeLocale, id } = await params;
  setRequestLocale(routeLocale);
  if (!/^\d+$/.test(id)) notFound();
  const [t, locale, currencies, result] = await Promise.all([
    getTranslations("Admin.users"),
    getLocale(),
    getCurrencies(),
    apiGet<{ data: AdminUser; wallet: WalletBalance[] }>(`/admin/users/${id}`).catch((error: ApiError) => {
      if (error.status === 404) notFound();
      throw error;
    }),
  ]);
  const user = result.data;

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
            {!user.isAdmin &&
              (user.suspendedAt ? (
                <ActionButton label={t("unsuspend")} endpoint={`/admin/users/${user.id}/unsuspend`} tone="brand" confirm={t("confirmUnsuspend")} />
              ) : (
                <ActionButton label={t("suspend")} endpoint={`/admin/users/${user.id}/suspend`} tone="danger" description={t("suspendHint")} fields={[{ name: "reason", label: t("reason"), type: "textarea", required: true }]} />
              ))}
          </>
        }
      />

      <AdminSection>
        <div className="flex flex-wrap items-center gap-4">
          <UserAvatar name={user.fullName} src={user.avatarUrl} size={64} />
          <dl className="grid flex-1 grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-muted">{t("email")}</dt>
              <dd className="break-all">{user.email ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("phone")}</dt>
              <dd dir="ltr" className="text-start">{user.phone ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("identity")}</dt>
              <dd>
                <StatusPill tone={toneFor(user.kycStatus)}>{t(`kyc.${user.kycStatus}`)}</StatusPill>
              </dd>
            </div>
            <div>
              <dt className="text-muted">{t("joined")}</dt>
              <dd>{dateTime(user.createdAt, locale)}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("lastSeen")}</dt>
              <dd>{dateTime(user.lastSeenAt, locale)}</dd>
            </div>
            <div>
              <dt className="text-muted">{t("points")}</dt>
              <dd>{user.points}</dd>
            </div>
          </dl>
        </div>
        {user.suspendedAt && (
          <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
            {t("suspendedSince", { date: dateTime(user.suspendedAt, locale) })} — {user.suspensionReason}
          </p>
        )}
      </AdminSection>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label={t("projects")} value={user.stats?.projects ?? 0} />
        <StatCard label={t("offers")} value={user.stats?.offers ?? 0} />
        <StatCard label={t("openDisputes")} value={user.stats?.openDisputes ?? 0} tone={user.stats?.openDisputes ? "orange" : "default"} />
      </div>

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
        <Link href={`/admin/ledger?userId=${user.id}`} className="self-start text-sm text-link hover:underline">
          {t("ledger")}
        </Link>
      </AdminSection>
    </>
  );
}
