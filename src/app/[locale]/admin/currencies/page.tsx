import { getTranslations, setRequestLocale } from "next-intl/server";
import { AdminHeader, AdminSection, type AdminCurrency } from "@/modules/admin";
import { CurrenciesEditor } from "@/modules/admin/components/CurrenciesEditor";
import { adminGet } from "@/modules/admin/server";

/** Admin › Currencies: which currencies the marketplace offers and in what order, from GET /admin/currencies. */
export default async function AdminCurrencies({ params }: PageProps<"/[locale]/admin/currencies">) {
  setRequestLocale((await params).locale);
  const [t, { data }] = await Promise.all([getTranslations("Admin.currencies"), adminGet<{ data: AdminCurrency[] }>("/admin/currencies")]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      <AdminSection>
        <CurrenciesEditor currencies={data} />
      </AdminSection>
    </>
  );
}
