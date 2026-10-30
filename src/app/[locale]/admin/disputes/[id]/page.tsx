import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import type { ApiError } from "@/lib/api/errors";
import { getSummary } from "@/lib/api/reference";
import { apiGet, apiGetOrNull } from "@/lib/api/server";
import type { Dispute, Message } from "@/lib/api/types";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { ActionButton, AdminSection, dateTime, money } from "@/modules/admin";
import { DisputeCase } from "@/modules/disputes";

/** Admin › Dispute: the case thread from GET /disputes/{id}, where staff can post, review and resolve it. */
export default async function AdminDispute({ params }: PageProps<"/[locale]/admin/disputes/[id]">) {
  const { locale: routeLocale, id } = await params;
  setRequestLocale(routeLocale);
  if (!/^\d+$/.test(id)) notFound();
  const [t, locale, summary, { data: dispute }, chat] = await Promise.all([
    getTranslations("Admin.disputes"),
    getLocale(),
    getSummary(),
    apiGet<{ data: Dispute }>(`/disputes/${id}`).catch((error: ApiError) => {
      if (error.status === 404) notFound();
      throw error;
    }),
    apiGetOrNull<{ data: Message[] }>(`/admin/disputes/${id}/conversation`),
  ]);
  const messages = chat?.data ?? [];
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
      <DisputeCase dispute={dispute} viewerId={summary?.user.id ?? 0} projectHref={dispute.project ? `/admin/projects/${dispute.project.id}` : undefined} />
      <AdminSection title={t("chat")}>
        <p className="text-sm text-muted">{t("chatHint")}</p>
        {messages.length ? (
          <ol className="flex max-h-[560px] flex-col gap-3 overflow-y-auto rounded-xl border border-border bg-surface-muted p-4">
            {messages.map((message) => (
              <li key={message.id} className={`flex items-start gap-2.5 ${message.senderId === dispute.openedBy?.id ? "" : "flex-row-reverse text-end"}`}>
                <UserAvatar name={message.sender?.fullName ?? "?"} src={message.sender?.avatarUrl ?? null} size={32} />
                <div className="flex max-w-[75%] flex-col gap-1 rounded-xl border border-border bg-surface px-3 py-2 text-sm">
                  <span className="text-xs font-bold">{message.sender?.fullName}</span>
                  {message.removed ? (
                    <span className="text-muted italic">{t("chatRemoved")}</span>
                  ) : (
                    <>
                      {message.body && <p className="break-words whitespace-pre-line">{message.body}</p>}
                      {message.attachment &&
                        (message.attachment.mime.startsWith("image/") ? (
                          <a href={message.attachment.url} target="_blank" rel="noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element -- signed API file */}
                            <img src={message.attachment.url} alt={message.attachment.name} className="max-h-48 rounded-lg" />
                          </a>
                        ) : (
                          <a href={message.attachment.url} target="_blank" rel="noreferrer" className="text-link underline">
                            {message.attachment.name}
                          </a>
                        ))}
                    </>
                  )}
                  <span className="text-[11px] text-muted">{dateTime(message.createdAt, locale)}</span>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted">{t("chatEmpty")}</p>
        )}
      </AdminSection>
    </>
  );
}
