import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { AdminHeader, AdminSection, AdminTable, Cell, dateTime, type AdminEscrow } from "@/modules/admin";
import { EscrowPanel } from "@/modules/admin/components/EscrowPanel";
import { adminGet, getAdminPermissions } from "@/modules/admin/server";

export default async function AdminEscrowPage({ params }: PageProps<"/[locale]/admin/escrows/[id]">) {
  const { locale: routeLocale, id } = await params;
  setRequestLocale(routeLocale);
  if (!/^\d+$/.test(id)) notFound();
  const can = await getAdminPermissions();
  const [t, locale, { data: escrow }] = await Promise.all([getTranslations("Admin.escrows"), getLocale(), adminGet<{ data: AdminEscrow }>(`/admin/escrows/${id}`)]);

  return (
    <>
      <AdminHeader
        title={escrow.project?.title ?? t("title")}
        subtitle={t("contractNumber", { id: escrow.id })}
        actions={
          escrow.project && (
            <Link href={`/admin/projects/${escrow.project.id}`} className="inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-semibold hover:border-brand">
              {t("openProject")}
            </Link>
          )
        }
      />
      <AdminSection>
        <EscrowPanel escrow={escrow} canCancel={can.has("finance.manage")} />
      </AdminSection>
      <AdminSection title={t("movements")} actions={<Link href={`/admin/ledger?projectId=${escrow.project?.id ?? ""}`} className="text-sm text-link hover:underline">{t("inLedger")}</Link>}>
        <AdminTable head={["#", t("type"), t("description"), t("date")]} empty={escrow.transactions?.length ? false : t("noMovements")}>
          {(escrow.transactions ?? []).map((tx) => (
            <tr key={tx.id}>
              <Cell className="text-xs text-muted">{tx.id}</Cell>
              <Cell className="capitalize">{tx.type.replaceAll("_", " ")}</Cell>
              <Cell className="text-xs">{tx.description ?? String(tx.meta?.milestone ?? "")}</Cell>
              <Cell className="whitespace-nowrap">{dateTime(tx.createdAt, locale)}</Cell>
            </tr>
          ))}
        </AdminTable>
      </AdminSection>
    </>
  );
}
