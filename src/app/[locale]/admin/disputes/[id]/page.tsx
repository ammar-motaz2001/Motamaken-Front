import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import type { ApiError } from "@/lib/api/errors";
import { getSummary } from "@/lib/api/reference";
import { apiGet } from "@/lib/api/server";
import type { Dispute } from "@/lib/api/types";
import { ActionButton, AdminSection, money } from "@/modules/admin";
import { DisputeCase } from "@/modules/disputes";

export default async function AdminDispute({ params }: PageProps<"/[locale]/admin/disputes/[id]">) {
  const { locale: routeLocale, id } = await params;
  setRequestLocale(routeLocale);
  if (!/^\d+$/.test(id)) notFound();
  const [t, locale, summary, { data: dispute }] = await Promise.all([
    getTranslations("Admin.disputes"),
    getLocale(),
    getSummary(),
    apiGet<{ data: Dispute }>(`/disputes/${id}`).catch((error: ApiError) => {
      if (error.status === 404) notFound();
      throw error;
    }),
  ]);
  const active = dispute.status === "open" || dispute.status === "under_review";
  const amount = dispute.milestone && dispute.currency ? money(dispute.milestone.amount, dispute.currency, locale) : "";

  return (
    <>
      {active && (
        <AdminSection title={t("decide")}>
          <p className="text-sm text-muted">{t("decideHint", { amount })}</p>
          <div className="flex flex-wrap gap-2">
            {dispute.status === "open" && <ActionButton label={t("take")} endpoint={`/admin/disputes/${dispute.id}/review`} tone="orange" size="md" confirm={t("confirmTake")} />}
            <ActionButton
              label={t("note")}
              endpoint={`/admin/disputes/${dispute.id}/messages`}
              size="md"
              body={{ internal: true }}
              description={t("noteHint")}
              fields={[{ name: "body", label: t("noteBody"), type: "textarea", required: true }]}
            />
            <ActionButton
              label={t("resolve")}
              endpoint={`/admin/disputes/${dispute.id}/resolve`}
              tone="brand"
              size="md"
              description={t("resolveHint")}
              fields={[
                {
                  name: "resolution",
                  label: t("resolution"),
                  type: "select",
                  required: true,
                  options: (["client_refund", "freelancer_payout", "split"] as const).map((value) => ({ value, label: t(`resolutions.${value}`) })),
                },
                { name: "clientPercent", label: t("clientPercent"), type: "number", required: true, hint: t("clientPercentHint"), showWhen: { field: "resolution", value: "split" } },
                { name: "note", label: t("resolutionNote"), type: "textarea", required: true, hint: t("resolutionNoteHint") },
              ]}
            />
          </div>
        </AdminSection>
      )}
      <DisputeCase dispute={dispute} viewerId={summary?.user.id ?? 0} />
    </>
  );
}
