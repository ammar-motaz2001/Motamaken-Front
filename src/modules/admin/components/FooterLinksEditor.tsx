"use client";

import { confirmDialog } from "@/components/ui/ConfirmDialog";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FooterColumn } from "@/lib/api/types";
import { inputClasses } from "./ActionButton";

const MAX_COLUMNS = 6;
const MAX_LINKS = 12;

type Props = {
  /** The admins' columns, or null while the footer uses the built-in ones. */
  value: FooterColumn[] | null;
  onChange: (value: FooterColumn[] | null) => void;
  /** The built-in columns in both languages, the starting point when switching to custom links. */
  defaults: FooterColumn[];
  errors: Record<string, string>;
};

const iconButton = "flex size-8 shrink-0 items-center justify-center rounded border border-border hover:border-brand disabled:opacity-30";

/** Editor of the footer's link columns (titles and links in English and Arabic, site paths or https addresses). */
export function FooterLinksEditor({ value, onChange, defaults, errors }: Props) {
  const t = useTranslations("Admin.siteSettings.footer");

  if (!value) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{t("usingDefault")}</p>
        <button type="button" onClick={() => onChange(structuredClone(defaults))} className="inline-flex h-9 items-center rounded-md border border-border px-3 text-sm font-semibold hover:border-brand">
          {t("customize")}
        </button>
      </div>
    );
  }

  const setColumn = (index: number, column: FooterColumn) => onChange(value.map((c, i) => (i === index ? column : c)));
  const move = <T,>(list: T[], from: number, to: number) => {
    const next = [...list];
    [next[from], next[to]] = [next[to], next[from]];
    return next;
  };
  const error = (path: string) => errors[`footer.${path}`];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted">{t("hint")}</p>
        <button type="button" onClick={async () => (await confirmDialog(t("confirmRestore"))) && onChange(null)} className="text-sm text-danger hover:underline">
          {t("restore")}
        </button>
      </div>

      {value.map((column, c) => (
        <div key={c} className="flex flex-col gap-3 rounded-lg border border-border bg-surface-muted/40 p-3">
          <div className="flex flex-wrap items-start gap-2">
            <input dir="ltr" aria-label={t("titleEn")} placeholder={t("titleEn")} value={column.titleEn} onChange={(e) => setColumn(c, { ...column, titleEn: e.target.value })} className={`${inputClasses} min-w-40 flex-1 font-semibold`} />
            <input dir="rtl" aria-label={t("titleAr")} placeholder={t("titleAr")} value={column.titleAr} onChange={(e) => setColumn(c, { ...column, titleAr: e.target.value })} className={`${inputClasses} min-w-40 flex-1 font-semibold`} />
            <span className="flex gap-1">
              <button type="button" disabled={c === 0} onClick={() => onChange(move(value, c, c - 1))} aria-label={t("moveUp")} className={iconButton}>
                <ArrowUp className="size-4" />
              </button>
              <button type="button" disabled={c === value.length - 1} onClick={() => onChange(move(value, c, c + 1))} aria-label={t("moveDown")} className={iconButton}>
                <ArrowDown className="size-4" />
              </button>
              <button type="button" onClick={() => onChange(value.filter((_, i) => i !== c))} aria-label={t("removeColumn")} className={`${iconButton} text-danger`}>
                <Trash2 className="size-4" />
              </button>
            </span>
          </div>
          {(error(`${c}.titleEn`) || error(`${c}.titleAr`) || error(`${c}.links`)) && (
            <p className="text-xs text-danger">{error(`${c}.titleEn`) ?? error(`${c}.titleAr`) ?? error(`${c}.links`)}</p>
          )}

          <ul className="flex flex-col gap-2">
            {column.links.map((link, l) => {
              const setLink = (patch: Partial<FooterColumn["links"][number]>) => setColumn(c, { ...column, links: column.links.map((x, i) => (i === l ? { ...x, ...patch } : x)) });
              const linkError = error(`${c}.links.${l}.labelEn`) ?? error(`${c}.links.${l}.labelAr`) ?? error(`${c}.links.${l}.href`);
              return (
                <li key={l} className="flex flex-col gap-1">
                  <div className="grid gap-2 sm:grid-cols-[1fr_1fr_1.3fr_auto]">
                    <input dir="ltr" aria-label={t("labelEn")} placeholder={t("labelEn")} value={link.labelEn} onChange={(e) => setLink({ labelEn: e.target.value })} className={inputClasses} />
                    <input dir="rtl" aria-label={t("labelAr")} placeholder={t("labelAr")} value={link.labelAr} onChange={(e) => setLink({ labelAr: e.target.value })} className={inputClasses} />
                    <input dir="ltr" aria-label={t("href")} placeholder="/faq · https://…" value={link.href} onChange={(e) => setLink({ href: e.target.value })} className={inputClasses} />
                    <span className="flex gap-1">
                      <button type="button" disabled={l === 0} onClick={() => setColumn(c, { ...column, links: move(column.links, l, l - 1) })} aria-label={t("moveUp")} className={iconButton}>
                        <ArrowUp className="size-4" />
                      </button>
                      <button type="button" onClick={() => setColumn(c, { ...column, links: column.links.filter((_, i) => i !== l) })} aria-label={t("removeLink")} className={`${iconButton} text-danger`}>
                        <Trash2 className="size-4" />
                      </button>
                    </span>
                  </div>
                  {linkError && <p className="text-xs text-danger">{linkError}</p>}
                </li>
              );
            })}
          </ul>
          {column.links.length < MAX_LINKS && (
            <button
              type="button"
              onClick={() => setColumn(c, { ...column, links: [...column.links, { labelEn: "", labelAr: "", href: "/" }] })}
              className="inline-flex items-center gap-1 self-start text-sm font-semibold text-brand hover:underline"
            >
              <Plus className="size-4" /> {t("addLink")}
            </button>
          )}
        </div>
      ))}

      {value.length < MAX_COLUMNS && (
        <button
          type="button"
          onClick={() => onChange([...value, { titleEn: "", titleAr: "", links: [{ labelEn: "", labelAr: "", href: "/" }] }])}
          className="inline-flex h-9 items-center gap-1 self-start rounded-md border border-dashed border-border px-3 text-sm font-semibold hover:border-brand"
        >
          <Plus className="size-4" /> {t("addColumn")}
        </button>
      )}
    </div>
  );
}
