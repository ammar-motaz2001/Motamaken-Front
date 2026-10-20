import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import { ActionButton, AdminHeader, AdminSection, AdminTable, Cell, InfoGrid, StatCard, UserCell, dateTime, money, toneFor, type AdminProjectDetail } from "@/modules/admin";
import { EscrowPanel } from "@/modules/admin/components/EscrowPanel";
import { adminGet, getAdminPermissions } from "@/modules/admin/server";

export default async function AdminProjectPage({ params }: PageProps<"/[locale]/admin/projects/[id]">) {
  const { locale: routeLocale, id } = await params;
  setRequestLocale(routeLocale);
  if (!/^\d+$/.test(id)) notFound();
  const can = await getAdminPermissions();
  const [t, tp, locale, { data: p }] = await Promise.all([getTranslations("Admin.projects"), getTranslations("Admin.proposals"), getLocale(), adminGet<{ data: AdminProjectDetail }>(`/admin/projects/${id}`)]);
  const when = (value: string | null) => dateTime(value, locale);

  return (
    <>
      <AdminHeader
        title={p.title}
        subtitle={`#${p.id} · ${t(`type.${p.type}`)}${p.category ? ` · ${p.category.name}` : ""}`}
        actions={
          <>
            <Link href={`/projects/${p.id}`} className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-semibold hover:border-brand">
              {t("viewOnSite")}
            </Link>
            <Link href={`/admin/ledger?projectId=${p.id}`} className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-semibold hover:border-brand">
              {t("money")}
            </Link>
            {p.status === "open" && !p.hiddenAt &&
              (p.isFeatured ? (
                <ActionButton label={t("unfeature")} endpoint={`/admin/projects/${p.id}/unfeature`} confirm={t("confirmUnfeature")} />
              ) : (
                <ActionButton label={t("feature")} tone="orange" endpoint={`/admin/projects/${p.id}/feature`} fields={[{ name: "days", label: t("days"), type: "number", required: true, defaultValue: "7" }]} />
              ))}
            {p.status === "open" && <ActionButton label={t("close")} tone="danger" endpoint={`/admin/projects/${p.id}/close`} confirm={t("confirmClose", { title: p.title })} />}
            {p.hiddenAt || (p.status === "closed" && !p.acceptedProposalId) ? (
              <ActionButton label={t("reactivate")} tone="brand" endpoint={`/admin/projects/${p.id}/reactivate`} confirm={t("confirmReactivate")} />
            ) : (
              <ActionButton label={t("hide")} tone="danger" endpoint={`/admin/projects/${p.id}/hide`} description={t("hideHint")} fields={[{ name: "reason", label: t("reason"), type: "textarea", required: true }]} />
            )}
          </>
        }
      />

      {p.hiddenAt && (
        <p className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
          {t("hiddenSince", { date: when(p.hiddenAt) })} — {p.hiddenReason}
        </p>
      )}

      <AdminSection>
        <InfoGrid
          columns={4}
          items={[
            { label: t("owner"), value: <UserCell user={p.owner} /> },
            { label: t("state"), value: <StatusPill tone={toneFor(p.status)}>{t(`status.${p.status}`)}</StatusPill> },
            { label: t("budget"), value: <span dir="ltr">{`${money(p.budget.min, p.budget.currency, locale)} – ${money(p.budget.max, p.budget.currency, locale)}`}</span> },
            { label: t("created"), value: when(p.createdAt) },
            { label: t("description"), value: <p className="whitespace-pre-line">{p.description}</p>, wide: true },
          ]}
        />
      </AdminSection>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label={t("offers")} value={p.proposals.length} />
        <StatCard label={t("disputes")} value={p.disputes.length} tone={p.disputes.some((d) => ["open", "under_review"].includes(d.status)) ? "orange" : "default"} />
        <StatCard label={t("reviews")} value={p.reviews.length} />
        <StatCard label={t("reports")} value={p.reports.length} tone={p.reports.some((r) => r.status === "open") ? "danger" : "default"} />
      </div>

      <AdminSection title={t("offers")}>
        <AdminTable head={[t("sender"), t("amount"), t("delivery"), t("message"), t("state")]} empty={p.proposals.length ? false : t("noOffers")}>
          {p.proposals.map((offer) => (
            <tr key={offer.id} className={offer.id === p.acceptedProposalId ? "bg-brand/5" : ""}>
              <Cell>
                <UserCell user={offer.user} />
                {offer.team && <div className="text-xs text-muted">{t("asTeam", { team: offer.team.name })}</div>}
              </Cell>
              <Cell className="whitespace-nowrap">{money(offer.amount, offer.currency, locale)}</Cell>
              <Cell className="whitespace-nowrap">{t("deliveryDays", { count: offer.deliveryDays })}</Cell>
              <Cell className="max-w-md text-xs whitespace-pre-line text-muted">{offer.message}</Cell>
              <Cell>
                <StatusPill tone={toneFor(offer.status)}>{tp(`statuses.${offer.status}`)}</StatusPill>
              </Cell>
            </tr>
          ))}
        </AdminTable>
      </AdminSection>

      {p.escrow && (
        <AdminSection title={t("contract")} actions={<Link href={`/admin/escrows/${p.escrow.id}`} className="text-sm text-link hover:underline">{t("openContract")}</Link>}>
          <EscrowPanel escrow={p.escrow} canCancel={can.has("finance.manage")} />
        </AdminSection>
      )}

      {p.matches.length > 0 && (
        <AdminSection title={t("matches")}>
          <p className="text-sm text-muted">{t("matchesHint")}</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {p.matches.map((m) => (
              <li key={m.profileId} className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
                <div className="min-w-0">
                  <UserCell user={m} />
                  <p className="truncate text-xs text-muted">{m.jobTitle}</p>
                </div>
                <span className="shrink-0 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">{Math.round(m.score * 100)}%</span>
              </li>
            ))}
          </ul>
        </AdminSection>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <AdminSection title={t("disputes")}>
          {p.disputes.length ? (
            <ul className="flex flex-col gap-2">
              {p.disputes.map((d) => (
                <li key={d.id}>
                  <Link href={`/admin/disputes/${d.id}`} className="flex items-center justify-between gap-2 rounded-lg border border-border p-3 text-sm hover:border-brand">
                    <span>
                      {d.openedBy?.fullName} → {d.against?.fullName}
                      <span className="block text-xs text-muted">{d.reason.replaceAll("_", " ")} · {when(d.createdAt)}</span>
                    </span>
                    <StatusPill tone={toneFor(d.status)}>{d.resolution?.replaceAll("_", " ") ?? d.status.replaceAll("_", " ")}</StatusPill>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">{t("none")}</p>
          )}
        </AdminSection>
        <AdminSection title={t("reviews")}>
          {p.reviews.length ? (
            <ul className="flex flex-col gap-2">
              {p.reviews.map((r) => (
                <li key={r.id} className="rounded-lg border border-border p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-orange">{"★".repeat(r.rating)}</span>
                    {r.hidden && <StatusPill tone="danger">{t("hidden")}</StatusPill>}
                  </div>
                  {r.comment && <p className="mt-1 text-muted">{r.comment}</p>}
                  <p className="mt-1 text-xs text-muted">
                    {r.reviewer?.fullName} → {r.reviewee?.fullName}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">{t("none")}</p>
          )}
        </AdminSection>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <AdminSection title={t("reports")}>
          {p.reports.length ? (
            <ul className="flex flex-col gap-2">
              {p.reports.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-2 rounded-lg border border-border p-3 text-sm">
                  <span>
                    {r.reason} {r.source === "ai" && <StatusPill tone="muted">AI</StatusPill>}
                    {r.details && <span className="block text-xs text-muted">{r.details}</span>}
                  </span>
                  <StatusPill tone={toneFor(r.status)}>{r.status}</StatusPill>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">{t("none")}</p>
          )}
        </AdminSection>
        <AdminSection title={t("adminLog")}>
          {p.adminLog.length ? (
            <ul className="flex flex-col gap-2 text-sm">
              {p.adminLog.map((l) => (
                <li key={l.id} className="flex justify-between gap-2">
                  <span className="font-mono text-xs">{l.action}</span>
                  <span className="text-xs text-muted">
                    {l.admin?.fullName} · {when(l.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">{t("none")}</p>
          )}
        </AdminSection>
      </div>
    </>
  );
}
