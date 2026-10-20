"use client";

import { Pencil, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Listbox } from "@/components/ui/Listbox";
import { Modal } from "@/components/ui/Modal";
import type { AdminMedal } from "../types";
import { SaveBar, TextInput } from "./FormBits";
import { useAdminSave } from "./useAdminSave";

/** Create a medal or change one: names, description, icon, and what earns it automatically. */
export function MedalEditor({ medal, metrics }: { medal?: AdminMedal; metrics: string[] }) {
  const t = useTranslations("Admin.medals");
  const { busy, error, fields, saved, save } = useAdminSave();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({
    code: medal?.code ?? "",
    nameEn: medal?.nameEn ?? "",
    nameAr: medal?.nameAr ?? "",
    descriptionEn: medal?.descriptionEn ?? "",
    descriptionAr: medal?.descriptionAr ?? "",
    icon: medal?.icon ?? "",
    metric: medal?.metric ?? "",
    target: String(medal?.target ?? 1),
    sortOrder: String(medal?.sortOrder ?? 0),
  });
  const set = (key: keyof typeof draft) => (value: string) => setDraft((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const body = {
      ...(medal ? {} : { code: draft.code }),
      nameEn: draft.nameEn,
      nameAr: draft.nameAr,
      descriptionEn: draft.descriptionEn || null,
      descriptionAr: draft.descriptionAr || null,
      icon: draft.icon || null,
      metric: draft.metric || null,
      target: Number(draft.target || 1),
      sortOrder: Number(draft.sortOrder || 0),
    };
    if (await save(medal ? `/admin/medals/${medal.id}` : "/admin/medals", medal ? "PATCH" : "POST", body)) setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={medal ? t("edit") : undefined}
        className={medal ? "flex size-8 items-center justify-center rounded-md border border-border hover:border-brand" : "inline-flex h-10 items-center gap-1.5 rounded-md bg-brand px-4 text-sm font-semibold text-white"}
      >
        {medal ? <Pencil className="size-4" /> : <><Plus className="size-4" /> {t("new")}</>}
      </button>
      <Modal open={open} onClose={() => !busy && setOpen(false)} title={medal ? t("edit") : t("new")} showClose>
        <form onSubmit={submit} className="flex w-full flex-col gap-4 text-start">
          <div className="grid gap-3 sm:grid-cols-2">
            {!medal && <TextInput label={t("code")} hint={t("codeHint")} dir="ltr" value={draft.code} onChange={set("code")} error={fields.code} required />}
            <TextInput label={t("icon")} hint={t("iconHint")} dir="ltr" value={draft.icon} onChange={set("icon")} />
            <TextInput label={t("nameEn")} dir="ltr" value={draft.nameEn} onChange={set("nameEn")} error={fields.nameEn} required />
            <TextInput label={t("nameAr")} dir="rtl" value={draft.nameAr} onChange={set("nameAr")} error={fields.nameAr} required />
            <TextInput label={t("descriptionEn")} dir="ltr" value={draft.descriptionEn} onChange={set("descriptionEn")} />
            <TextInput label={t("descriptionAr")} dir="rtl" value={draft.descriptionAr} onChange={set("descriptionAr")} />
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium" id="medal-metric">
                {t("earnedBy")}
              </span>
              <Listbox
                aria-labelledby="medal-metric"
                value={draft.metric}
                onChange={set("metric")}
                options={[{ value: "", label: t("manualOnly") }, ...metrics.map((m) => ({ value: m, label: t(`metrics.${m}`) }))]}
              />
            </div>
            <TextInput label={t("target")} hint={t("targetHint")} type="number" value={draft.target} onChange={set("target")} error={fields.target} />
            <TextInput label={t("order")} type="number" value={draft.sortOrder} onChange={set("sortOrder")} />
          </div>
          <SaveBar busy={busy} error={error} saved={saved} />
        </form>
      </Modal>
    </>
  );
}
