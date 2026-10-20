import { ShieldCheck, ShieldOff } from "lucide-react";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { StatusPill } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import { ActionButton, AdminHeader, AdminSection, AdminTable, Cell, RoleEditor, UserCell, dateTime, type AdminRoleRow, type StaffMember } from "@/modules/admin";
import { adminGet } from "@/modules/admin/server";

export default async function AdminStaff({ params }: PageProps<"/[locale]/admin/staff">) {
  setRequestLocale((await params).locale);
  const [t, locale, staff, roles] = await Promise.all([
    getTranslations("Admin.staff"),
    getLocale(),
    adminGet<{ data: StaffMember[] }>("/admin/staff"),
    adminGet<{ data: AdminRoleRow[]; permissions: string[] }>("/admin/roles"),
  ]);
  const ar = locale === "ar";
  const roleOptions = [{ value: "", label: t("fullAccess") }, ...roles.data.filter((r) => r.slug !== "super_admin").map((r) => ({ value: String(r.id), label: ar ? r.nameAr : r.nameEn }))];

  return (
    <>
      <AdminHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <>
            <Link href="/admin/audit" className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-semibold hover:border-brand">
              {t("auditLink")}
            </Link>
            <ActionButton
              label={t("add")}
              tone="brand"
              size="md"
              endpoint="/admin/staff"
              description={t("addHint")}
              fields={[
                { name: "identifier", label: t("identifier"), required: true, placeholder: "name@example.com" },
                { name: "roleId", label: t("role"), type: "select", options: roleOptions },
                { name: "name", label: t("newName"), hint: t("newOnly") },
                { name: "password", label: t("newPassword"), hint: t("newOnly") },
              ]}
            />
          </>
        }
      />

      <AdminSection title={t("members")}>
        <AdminTable head={[t("member"), t("role"), t("twoFactor"), t("activity"), ""]}>
          {staff.data.map((member) => (
            <tr key={member.id}>
              <Cell>
                <UserCell user={member} />
                <span className="text-xs text-muted">{member.email}</span>
              </Cell>
              <Cell>
                <StatusPill tone={member.fullAccess ? "success" : "muted"}>{member.role ? (ar ? member.role.nameAr : member.role.nameEn) : t("fullAccess")}</StatusPill>
              </Cell>
              <Cell>
                {member.twoFactor ? (
                  <span className="flex items-center gap-1 text-sm text-brand">
                    <ShieldCheck className="size-4" /> {t("on")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm text-orange">
                    <ShieldOff className="size-4" /> {t("off")}
                  </span>
                )}
              </Cell>
              <Cell className="text-xs">
                <div>{t("lastSeen", { date: dateTime(member.lastSeenAt, locale) })}</div>
                <div className="text-muted">{t("actions", { count: member.actions })} · {t("sessions", { count: member.sessions })}</div>
              </Cell>
              <Cell>
                <div className="flex flex-wrap justify-end gap-1.5">
                  <ActionButton
                    label={t("changeRole")}
                    endpoint={`/admin/staff/${member.id}`}
                    method="PATCH"
                    fields={[{ name: "roleId", label: t("role"), type: "select", options: roleOptions, defaultValue: member.role && member.role.slug !== "super_admin" ? String(member.role.id) : "" }]}
                    body={{ roleId: null }}
                  />
                  <ActionButton label={t("signOut")} endpoint={`/admin/staff/${member.id}/sessions/revoke`} confirm={t("confirmSignOut")} />
                  <ActionButton label={t("remove")} tone="danger" endpoint={`/admin/staff/${member.id}`} method="PATCH" body={{ active: false }} confirm={t("confirmRemove", { name: member.fullName })} />
                </div>
              </Cell>
            </tr>
          ))}
        </AdminTable>
      </AdminSection>

      <AdminSection title={t("roles")} actions={<RoleEditor permissions={roles.permissions} />}>
        <ul className="grid gap-3 md:grid-cols-2">
          {roles.data.map((role) => (
            <li key={role.id} className="flex flex-col gap-2 rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{ar ? role.nameAr : role.nameEn}</p>
                  <p className="text-xs text-muted">{t("people", { count: role.users ?? 0 })}{role.isSystem ? ` · ${t("builtIn")}` : ""}</p>
                </div>
                <div className="flex gap-1.5">
                  {role.slug !== "super_admin" && <RoleEditor role={role} permissions={roles.permissions} />}
                  {!role.isSystem && !role.users && <ActionButton label={t("delete")} tone="danger" method="DELETE" endpoint={`/admin/roles/${role.id}`} confirm={t("confirmDelete")} />}
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(role.permissions.includes("*") ? roles.permissions : role.permissions).map((p) => (
                  <span key={p} className="rounded-full bg-brand/10 px-2 py-0.5 text-xs text-brand">
                    {t(`permission.${p.replace(".", "_")}`)}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </AdminSection>
    </>
  );
}
