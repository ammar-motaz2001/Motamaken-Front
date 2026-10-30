import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";

/** The site sells promotion packages, not monthly plans: their prices are managed on the promotions page. */
export default async function AdminPlans() {
  redirect({ href: "/admin/promotions", locale: await getLocale() });
}
