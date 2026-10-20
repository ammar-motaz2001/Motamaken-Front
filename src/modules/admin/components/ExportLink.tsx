"use client";

import { Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { toQuery } from "@/lib/params";

/** Downloads the current list as a CSV file (opens in Excel), with the same filters as the screen. */
export function ExportLink({ dataset, query = {} }: { dataset: string; query?: Record<string, string | undefined> }) {
  const t = useTranslations("Admin");
  return (
    <a
      href={`/api/backend/admin/export/${dataset}${toQuery(query)}`}
      download
      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-xs font-semibold hover:border-brand"
    >
      <Download className="size-3.5" aria-hidden />
      {t("export")}
    </a>
  );
}
