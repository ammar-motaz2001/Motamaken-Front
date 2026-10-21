import { getTranslations, setRequestLocale } from "next-intl/server";
import { apiGet } from "@/lib/api/server";
import { AdminHeader, PlanEditor, type AdminPlan } from "@/modules/admin";

/** Admin › Plans: edit the subscription plans and their prices, from GET /admin/plans. */
export default async function AdminPlans({ params }: PageProps<"/[locale]/admin/plans">) {
  setRequestLocale((await params).locale);
  const [t, { data }] = await Promise.all([getTranslations("Admin.plans"), apiGet<{ data: AdminPlan[] }>("/admin/plans")]);

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      {(["client", "freelancer"] as const).map((audience) => (
        <section key={audience} className="flex flex-col gap-3">
          <h3 className="font-bold">{t(`audience.${audience}`)}</h3>
          <div className="grid gap-4 xl:grid-cols-2">
            {data
              .filter((plan) => plan.audience === audience)
              .map((plan) => (
                <PlanEditor key={plan.id} plan={plan} />
              ))}
          </div>
        </section>
      ))}
    </>
  );
}
