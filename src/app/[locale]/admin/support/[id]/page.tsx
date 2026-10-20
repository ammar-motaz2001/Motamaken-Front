import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { StatusPill } from "@/components/ui/StatusPill";
import { ActionButton, AdminHeader, AdminSection, InfoGrid, UserCell, dateTime, toneFor, type StaffMember } from "@/modules/admin";
import { adminGet, getAdminPermissions } from "@/modules/admin/server";
import { ReplyBox, TicketThread, type SupportTicket } from "@/modules/support";

export default async function AdminSupportTicket({ params }: PageProps<"/[locale]/admin/support/[id]">) {
  const { locale: routeLocale, id } = await params;
  setRequestLocale(routeLocale);
  if (!/^\d+$/.test(id)) notFound();
  const can = await getAdminPermissions();
  const [t, ts, locale, { data: ticket }, staff] = await Promise.all([
    getTranslations("Admin.support"),
    getTranslations("Support"),
    getLocale(),
    adminGet<{ data: SupportTicket }>(`/admin/support/${id}`),
    can.has("staff") ? adminGet<{ data: StaffMember[] }>("/admin/staff") : null,
  ]);

  return (
    <>
      <AdminHeader
        title={ticket.subject}
        subtitle={`#${ticket.id} · ${ts(`categories.${ticket.category}`)}`}
        actions={
          <>
            {staff && (
              <ActionButton
                label={t("assign")}
                endpoint={`/admin/support/${ticket.id}`}
                method="PATCH"
                fields={[
                  {
                    name: "assignedTo",
                    label: t("assignee"),
                    type: "select",
                    required: true,
                    defaultValue: ticket.assignedTo ? String(ticket.assignedTo.id) : "",
                    options: staff.data.map((m) => ({ value: String(m.id), label: m.fullName })),
                  },
                ]}
              />
            )}
            {ticket.status === "closed" ? (
              <ActionButton label={t("reopen")} endpoint={`/admin/support/${ticket.id}`} method="PATCH" body={{ status: "open" }} />
            ) : (
              <ActionButton label={t("close")} tone="danger" endpoint={`/admin/support/${ticket.id}`} method="PATCH" body={{ status: "closed" }} confirm={t("confirmClose")} />
            )}
          </>
        }
      />
      <AdminSection>
        <InfoGrid
          columns={4}
          items={[
            { label: t("user"), value: <UserCell user={ticket.user} /> },
            { label: t("status"), value: <StatusPill tone={toneFor(ticket.status)}>{ts(`statuses.${ticket.status}`)}</StatusPill> },
            { label: t("assignee"), value: ticket.assignedTo?.fullName ?? "—" },
            { label: t("opened"), value: dateTime(ticket.createdAt, locale) },
          ]}
        />
      </AdminSection>
      <AdminSection title={t("conversation")}>
        <TicketThread ticket={ticket} side="staff" />
        <ReplyBox endpoint={`/admin/support/${ticket.id}/reply`} placeholder={t("replyPlaceholder")} />
        <p className="text-xs text-muted">{t("replyHint")}</p>
      </AdminSection>
    </>
  );
}
