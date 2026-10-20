import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { apiGet } from "@/lib/api/server";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { AdminHeader, AdminSearch, AdminSection, AdminTable, Cell, ExportLink, UserCell, date, toneFor, type AdminUser, type List } from "@/modules/admin";

export default async function AdminUsers({ params, searchParams }: PageProps<"/[locale]/admin/users">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const filter = pickParams(query, ["q", "status", "kyc", "type", "activity"]);
  const [t, locale, result] = await Promise.all([
    getTranslations("Admin.users"),
    getLocale(),
    apiGet<List<AdminUser>>(`/admin/users${toQuery({ ...filter, page: pageParam(query) })}`),
  ]);
  const kyc = ["none", "pending", "approved", "rejected", "needs_update"] as const;

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle", { count: result.meta.total })} actions={<ExportLink dataset="users" query={filter} />} />
      <AdminSection>
        <AdminSearch
          placeholder={t("search")}
          filters={[
            { name: "type", label: t("allTypes"), options: (["client", "freelancer", "influencer"] as const).map((value) => ({ value, label: t(`types.${value}`) })) },
            { name: "status", label: t("allStatuses"), options: [{ value: "active", label: t("active") }, { value: "suspended", label: t("suspended") }, { value: "staff", label: t("staff") }] },
            { name: "kyc", label: t("allKyc"), options: kyc.map((value) => ({ value, label: t(`kyc.${value}`) })) },
            { name: "activity", label: t("anyActivity"), options: (["online", "week", "month", "inactive"] as const).map((value) => ({ value, label: t(`activity.${value}`) })) },
          ]}
        />
        <AdminTable head={[t("user"), t("type"), t("contact"), t("identity"), t("points"), t("lastSeen"), t("joined"), t("state")]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((user) => (
            <tr key={user.id}>
              <Cell>
                <UserCell user={user} />
              </Cell>
              <Cell className="text-xs">{user.accountType ? t(`types.${user.accountType}`) : "—"}</Cell>
              <Cell className="text-xs">
                <div>{user.email ?? "—"}</div>
                <div className="text-muted" dir="ltr">{user.phone ?? ""}</div>
              </Cell>
              <Cell>
                <StatusPill tone={toneFor(user.kycStatus)}>{t(`kyc.${user.kycStatus}`)}</StatusPill>
              </Cell>
              <Cell>{user.points}</Cell>
              <Cell className="text-xs whitespace-nowrap">{date(user.lastSeenAt, locale)}</Cell>
              <Cell className="whitespace-nowrap">{date(user.createdAt, locale)}</Cell>
              <Cell>
                {user.isAdmin ? (
                  <StatusPill tone="success">{user.adminRole ? (locale === "ar" ? user.adminRole.nameAr : user.adminRole.nameEn) : t("admin")}</StatusPill>
                ) : user.suspendedAt ? (
                  <StatusPill tone="danger">{t("suspended")}</StatusPill>
                ) : (
                  <StatusPill tone="muted">{t("active")}</StatusPill>
                )}
              </Cell>
            </tr>
          ))}
        </AdminTable>
        <Pagination page={result.meta.current_page} lastPage={result.meta.last_page} pathname="/admin/users" query={filter} />
      </AdminSection>
    </>
  );
}
