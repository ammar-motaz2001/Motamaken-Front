import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import { pickParams } from "@/lib/params";
import { ActionButton, AdminHeader, AdminSection, AdminTable, Cell, UserCell, dateTime, type AdminMedal, type List, type Person } from "@/modules/admin";
import { MedalEditor } from "@/modules/admin/components/MedalEditor";
import { adminGet } from "@/modules/admin/server";

type Holder = { user: Person | null; awardedAt: string | null; manual: boolean; awardedBy: Person | null; reason: string | null };

/** Admin › Medals: edit medals and see or revoke a medal's holders, from GET /admin/medals. */
export default async function AdminMedals({ params, searchParams }: PageProps<"/[locale]/admin/medals">) {
  setRequestLocale((await params).locale);
  const selected = pickParams(await searchParams, ["medal"]).medal;
  const [t, locale, medals] = await Promise.all([getTranslations("Admin.medals"), getLocale(), adminGet<{ data: AdminMedal[]; metrics: string[] }>("/admin/medals")]);
  const current = medals.data.find((m) => String(m.id) === selected);
  const holders = current ? await adminGet<List<Holder>>(`/admin/medals/${current.id}/holders`) : null;
  const ar = locale === "ar";

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} actions={<MedalEditor metrics={medals.metrics} />} />
      <AdminSection>
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {medals.data.map((medal) => (
            <li key={medal.id} className={`flex flex-col gap-2 rounded-xl border p-4 ${medal.isActive ? "border-border" : "border-dashed border-border opacity-70"} ${current?.id === medal.id ? "ring-2 ring-brand" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{ar ? medal.nameAr : medal.nameEn}</p>
                  <p className="font-mono text-xs text-muted">{medal.code}</p>
                </div>
                <div className="flex gap-1.5">
                  <MedalEditor medal={medal} metrics={medals.metrics} />
                </div>
              </div>
              <p className="text-sm text-muted">{(ar ? medal.descriptionAr : medal.descriptionEn) ?? "—"}</p>
              <p className="text-xs">{medal.metric ? t("rule", { metric: t(`metrics.${medal.metric}`), target: medal.target }) : t("manualOnly")}</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
                <Link href={`/admin/medals?medal=${medal.id}`} className="text-sm text-link hover:underline">
                  {t("holders", { count: medal.holders })}
                </Link>
                <div className="flex items-center gap-2">
                  {!medal.isActive && <StatusPill tone="muted">{t("off")}</StatusPill>}
                  <ActionButton
                    label={medal.isActive ? t("turnOff") : t("turnOn")}
                    tone={medal.isActive ? "outline" : "brand"}
                    method="PATCH"
                    endpoint={`/admin/medals/${medal.id}`}
                    body={{ isActive: !medal.isActive }}
                    confirm={medal.isActive ? t("confirmOff") : undefined}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </AdminSection>

      {current && holders && (
        <AdminSection title={t("holdersOf", { name: ar ? current.nameAr : current.nameEn })}>
          <AdminTable head={[t("user"), t("since"), t("how"), ""]} empty={holders.data.length ? false : t("nobody")}>
            {holders.data.map((h) => (
              <tr key={h.user?.id}>
                <Cell>
                  <UserCell user={h.user} />
                </Cell>
                <Cell className="whitespace-nowrap">{dateTime(h.awardedAt, locale)}</Cell>
                <Cell className="text-xs">{h.manual ? t("byHand", { name: h.awardedBy?.fullName ?? "", reason: h.reason ?? "" }) : t("earned")}</Cell>
                <Cell>{h.user && <ActionButton label={t("revoke")} tone="danger" method="DELETE" endpoint={`/admin/medals/${current.id}/holders/${h.user.id}`} confirm={t("confirmRevoke")} />}</Cell>
              </tr>
            ))}
          </AdminTable>
        </AdminSection>
      )}
    </>
  );
}
