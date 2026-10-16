import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { StatusPill } from "@/components/ui/StatusPill";
import type { ApiError } from "@/lib/api/errors";
import { apiGet } from "@/lib/api/server";
import { ActionButton, AdminHeader, AdminSection, UserCell, date, dateTime, toneFor, type KycSubmission } from "@/modules/admin";

export default async function AdminKycSubmission({ params }: PageProps<"/[locale]/admin/kyc/[id]">) {
  const { locale: routeLocale, id } = await params;
  setRequestLocale(routeLocale);
  if (!/^\d+$/.test(id)) notFound();
  const [t, locale, { data: k }] = await Promise.all([
    getTranslations("Admin.kyc"),
    getLocale(),
    apiGet<{ data: KycSubmission }>(`/admin/kyc/${id}`).catch((error: ApiError) => {
      if (error.status === 404) notFound();
      throw error;
    }),
  ]);
  const files = (["front", "back", "selfie"] as const).filter((side) => k.files?.[side]);

  return (
    <>
      <AdminHeader
        title={t("submission", { id: k.id })}
        actions={
          k.status === "pending" && (
            <>
              <ActionButton label={t("approve")} endpoint={`/admin/kyc/${k.id}/approve`} tone="brand" size="md" confirm={t("confirmApprove", { name: k.fullName })} />
              <ActionButton label={t("reject")} endpoint={`/admin/kyc/${k.id}/reject`} tone="danger" size="md" fields={[{ name: "reason", label: t("reason"), type: "textarea", required: true, hint: t("reasonHint") }]} />
            </>
          )
        }
      />
      <AdminSection>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <UserCell user={k.user} />
          <StatusPill tone={toneFor(k.status)}>{t(`status.${k.status}`)}</StatusPill>
        </div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-muted">{t("name")}</dt>
            <dd className="font-medium">{k.fullName}</dd>
          </div>
          <div>
            <dt className="text-muted">{t("birthDate")}</dt>
            <dd>{date(k.dateOfBirth, locale)}</dd>
          </div>
          <div>
            <dt className="text-muted">{t("document")}</dt>
            <dd>
              {t(`documents.${k.documentType}`)} · <span dir="ltr">{k.documentNumberFull ?? k.documentNumber}</span>
            </dd>
          </div>
          <div>
            <dt className="text-muted">{t("submitted")}</dt>
            <dd>{dateTime(k.submittedAt, locale)}</dd>
          </div>
          <div>
            <dt className="text-muted">{t("reviewed")}</dt>
            <dd>{dateTime(k.reviewedAt, locale)}</dd>
          </div>
        </dl>
        {k.rejectionReason && <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{k.rejectionReason}</p>}
      </AdminSection>
      <AdminSection title={t("files")}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {files.map((side) => (
            <figure key={side} className="flex flex-col gap-2">
              <a href={k.files![side]!} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-border bg-surface-muted">
                {/* eslint-disable-next-line @next/next/no-img-element -- signed, short-lived backend URLs */}
                <img src={k.files![side]!} alt={t(`sides.${side}`)} className="aspect-[4/3] w-full object-contain" />
              </a>
              <figcaption className="text-sm text-muted">{t(`sides.${side}`)}</figcaption>
            </figure>
          ))}
        </div>
        <p className="text-xs text-muted">{t("filesHint")}</p>
      </AdminSection>
    </>
  );
}
