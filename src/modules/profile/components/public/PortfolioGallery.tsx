"use client";

import { ExternalLink, ImageOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import type { PortfolioItem } from "@/lib/api/types";
import { ReportButton } from "@/modules/reports";

export function PortfolioGallery({ items, signedIn, canReport }: { items: PortfolioItem[]; signedIn: boolean; canReport: boolean }) {
  const t = useTranslations("PublicProfile.portfolio");
  const [open, setOpen] = useState<PortfolioItem | null>(null);

  if (!items.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted">
        <ImageOff className="size-12 text-placeholder" strokeWidth={1.2} aria-hidden />
        {t("empty")}
      </div>
    );
  }

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((item) => (
          <li key={item.id}>
            <button type="button" onClick={() => setOpen(item)} className="group block w-full overflow-hidden rounded-xl border border-border text-start">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt="" className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-105" />
              <span className="block truncate p-2 text-sm font-medium">{item.title}</span>
            </button>
          </li>
        ))}
      </ul>
      <Modal open={Boolean(open)} onClose={() => setOpen(null)} showClose title={open?.title}>
        {open && (
          <div className="flex w-full flex-col gap-3 text-start">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={open.imageUrl} alt={open.title} className="max-h-[60vh] w-full rounded-lg object-contain" />
            {open.description && <p className="text-sm whitespace-pre-line">{open.description}</p>}
            <div className="flex flex-wrap items-center justify-between gap-2">
              {open.link ? (
                <a href={open.link} target="_blank" rel="noreferrer noopener" className="flex items-center gap-1.5 text-sm font-medium text-link hover:underline">
                  <ExternalLink className="size-4" />
                  {t("visit")}
                </a>
              ) : (
                <span />
              )}
              {canReport && <ReportButton targetType="portfolio" targetId={open.id} signedIn={signedIn} />}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
