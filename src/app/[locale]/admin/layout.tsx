import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { getSummary } from "@/lib/api/reference";
import { apiGetOrNull } from "@/lib/api/server";
import { AdminNav, type Overview } from "@/modules/admin";

/** Admin panel browser title; the whole panel is kept out of search engines. */
export async function generateMetadata({ params }: LayoutProps<"/[locale]/admin">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Admin" });
  return { title: `${t("title")} | Mutamakin`, robots: { index: false } };
}

/** Admin panel shell: 404 for non-staff, then the menu filtered by role with queue counts from GET /admin/overview. */
export default async function AdminLayout({ children }: LayoutProps<"/[locale]/admin">) {
  const summary = await getSummary();
  // Not an admin: behave as if the panel did not exist.
  if (!summary?.user.isAdmin) notFound();

  const permissions = summary.user.adminPermissions ?? [];
  const [t, messages, overview] = await Promise.all([
    getTranslations("Admin"),
    getMessages(),
    permissions.includes("overview") ? apiGetOrNull<Overview>("/admin/overview") : null,
  ]);

  // The root layout leaves the admin texts out of the browser bundle; staff pages get the full set here.
  return (
    <NextIntlClientProvider messages={messages}>
      <div className="page-container flex flex-col gap-6 py-10">
        <h1 className="text-2xl font-bold text-orange uppercase">{t("title")}</h1>
        <div className="grid items-start gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
          <AdminNav queues={overview?.queues ?? null} permissions={permissions} />
          <div className="flex min-w-0 flex-col gap-5">{children}</div>
        </div>
      </div>
    </NextIntlClientProvider>
  );
}
