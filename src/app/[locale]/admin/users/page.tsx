import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { StatusPill } from "@/components/ui/StatusPill";
import { apiGet } from "@/lib/api/server";
import { pageParam, pickParams, toQuery } from "@/lib/params";
import { AdminHeader, AdminSearch, AdminSection, AdminTable, Cell, UserCell, date, toneFor, type AdminUser, type List } from "@/modules/admin";

export default async function AdminUsers({ params, searchParams }: PageProps<"/[locale]/admin/users">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const filter = pickParams(query, ["q", "status", "kyc"]);
  const [t, locale, result] = await Promise.all([
    getTranslations("Admin.users"),
    getLocale(),
    apiGet<List<AdminUser>>(`/admin/users${toQuery({ ...filter, page: pageParam(query) })}`),
  ]);
  const kyc = ["none", "pending", "approved", "rejected"] as const;

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle", { count: result.meta.total })} />
      <AdminSection>
        <AdminSearch
          placeholder={t("search")}
          filters={[
            { name: "status", label: t("allStatuses"), options: [{ value: "active", label: t("active") }, { value: "suspended", label: t("suspended") }] },
            { name: "kyc", label: t("allKyc"), options: kyc.map((value) => ({ value, label: t(`kyc.${value}`) })) },
          ]}
        />
        <AdminTable head={[t("user"), t("contact"), t("identity"), t("points"), t("joined"), t("state")]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((user) => (
            <tr key={user.id}>
              <Cell>
                <UserCell user={user} />
              </Cell>
              <Cell className="text-xs">
                <div>{user.email ?? "—"}</div>
                <div className="text-muted" dir="ltr">{user.phone ?? ""}</div>
              </Cell>
              <Cell>
                <StatusPill tone={toneFor(user.kycStatus)}>{t(`kyc.${user.kycStatus}`)}</StatusPill>
              </Cell>
              <Cell>{user.points}</Cell>
              <Cell className="whitespace-nowrap">{date(user.createdAt, locale)}</Cell>
              <Cell>
                {user.isAdmin ? (
                  <StatusPill tone="success">{t("admin")}</StatusPill>
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
