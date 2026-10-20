"use client";

import { Wrench } from "lucide-react";
import Image from "next/image";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import type { PublicSiteSettings } from "@/lib/api/types";

/** Pages that stay open during maintenance, so the staff can still sign in. */
const OPEN = /^\/(login|signup|verify|forgot-password|reset-password)(\/|$)/;

/**
 * Maintenance mode switched on from the admin panel: everyone but the staff sees the admins' message instead of the
 * page. The API refuses their calls too; this is the friendly face of it.
 */
export function MaintenanceGate({ maintenance, isStaff, children }: { maintenance: PublicSiteSettings["maintenance"] | null; isStaff: boolean; children: ReactNode }) {
  const t = useTranslations("Maintenance");
  const locale = useLocale();
  const format = useFormatter();
  const pathname = usePathname();

  if (!maintenance?.enabled || isStaff || OPEN.test(pathname)) return children;

  return (
    <div className="page-container flex min-h-[60vh] flex-col items-center justify-center gap-5 py-16 text-center">
      <Image src="/images/logo.png" alt="Mutamakin" width={181} height={48} />
      <span className="flex size-16 items-center justify-center rounded-full bg-orange/10 text-orange">
        <Wrench className="size-8" aria-hidden />
      </span>
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="max-w-lg text-muted">{locale === "ar" ? maintenance.messageAr : maintenance.messageEn}</p>
      {maintenance.endsAt && <p className="text-sm font-medium">{t("backAt", { time: format.dateTime(new Date(maintenance.endsAt), { dateStyle: "medium", timeStyle: "short" }) })}</p>}
      <Link href="/login" className="text-xs text-muted hover:text-brand">
        {t("staff")}
      </Link>
    </div>
  );
}
