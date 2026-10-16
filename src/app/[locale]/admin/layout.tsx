import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getSummary } from "@/lib/api/reference";
import { apiGetOrNull } from "@/lib/api/server";
import { AdminNav, type Overview } from "@/modules/admin";

export async function generateMetadata({ params }: LayoutProps<"/[locale]/admin">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Admin" });
  return { title: `${t("title")} | Mutamakin`, robots: { index: false } };
}

export default async function AdminLayout({ children }: LayoutProps<"/[locale]/admin">) {
  const summary = await getSummary();
  // Not an admin: behave as if the panel did not exist.
  if (!summary?.user.isAdmin) notFound();

  const [t, overview] = await Promise.all([getTranslations("Admin"), apiGetOrNull<Overview>("/admin/overview")]);

  return (
    <div className="page-container flex flex-col gap-6 py-10">
      <h1 className="text-2xl font-bold text-orange uppercase">{t("title")}</h1>
      <div className="grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <AdminNav queues={overview?.queues ?? null} />
        <div className="flex min-w-0 flex-col gap-5">{children}</div>
      </div>
    </div>
  );
}
