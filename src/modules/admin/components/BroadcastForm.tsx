"use client";

import { confirmDialog } from "@/components/ui/ConfirmDialog";
import { Megaphone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Listbox } from "@/components/ui/Listbox";
import { api } from "@/lib/api/client";
import { inputClasses } from "./ActionButton";
import { LabeledInput, SaveBar, TextInput } from "./FormBits";
import { useAdminSave } from "./useAdminSave";

const AUDIENCES = ["all", "clients", "freelancers", "influencers", "user"] as const;

/** Write an announcement in both languages, choose who gets it, see how many people that is, and send it. */
export function BroadcastForm() {
  const t = useTranslations("Admin.broadcasts");
  const { busy, error, fields, saved, save } = useAdminSave();
  const [draft, setDraft] = useState({ titleEn: "", titleAr: "", bodyEn: "", bodyAr: "", audience: "all", userId: "", email: false });
  const [count, setCount] = useState<number | null>(null);
  const set = (key: keyof typeof draft) => (value: string | boolean) => {
    setDraft((current) => ({ ...current, [key]: value }));
    if (key === "audience" || key === "userId") setCount(null);
  };

  const body = (preview: boolean) => ({
    titleEn: draft.titleEn || "-",
    titleAr: draft.titleAr || "-",
    bodyEn: draft.bodyEn || "-",
    bodyAr: draft.bodyAr || "-",
    audience: draft.audience,
    userId: draft.audience === "user" ? Number(draft.userId) : undefined,
    channels: draft.email ? ["in_app", "email"] : ["in_app"],
    preview,
  });

  const preview = async () => {
    const { data } = await api<{ data: { recipients: number } }>("/admin/broadcasts", { method: "POST", body: body(true) }).catch(() => ({ data: { recipients: 0 } }));
    setCount(data.recipients);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!(await confirmDialog(t("confirmSend")))) return;
    const result = await save("/admin/broadcasts", "POST", body(false));
    if (result) {
      setDraft({ titleEn: "", titleAr: "", bodyEn: "", bodyAr: "", audience: "all", userId: "", email: false });
      setCount(null);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <TextInput label={t("titleEn")} dir="ltr" value={draft.titleEn} onChange={set("titleEn")} error={fields.titleEn} required />
        <TextInput label={t("titleAr")} dir="rtl" value={draft.titleAr} onChange={set("titleAr")} error={fields.titleAr} required />
        <LabeledInput label={t("bodyEn")} error={fields.bodyEn}>
          {(id) => <textarea id={id} dir="ltr" rows={4} required maxLength={2000} value={draft.bodyEn} onChange={(e) => set("bodyEn")(e.target.value)} className={inputClasses} />}
        </LabeledInput>
        <LabeledInput label={t("bodyAr")} error={fields.bodyAr}>
          {(id) => <textarea id={id} dir="rtl" rows={4} required maxLength={2000} value={draft.bodyAr} onChange={(e) => set("bodyAr")(e.target.value)} className={inputClasses} />}
        </LabeledInput>
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium" id="broadcast-audience">
            {t("audience")}
          </span>
          <Listbox aria-labelledby="broadcast-audience" value={draft.audience} onChange={set("audience")} options={AUDIENCES.map((value) => ({ value, label: t(`audiences.${value}`) }))} />
        </div>
        {draft.audience === "user" && <TextInput label={t("userId")} hint={t("userIdHint")} type="number" value={draft.userId} onChange={set("userId")} error={fields.userId} required />}
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={draft.email} onChange={(e) => set("email")(e.target.checked)} className="size-4 accent-brand" />
        {t("alsoEmail")}
      </label>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <button type="button" onClick={preview} className="text-link hover:underline">
          {t("countRecipients")}
        </button>
        {count !== null && <span className="font-semibold">{t("recipients", { count })}</span>}
      </div>
      <SaveBar busy={busy} error={error} saved={saved} label={t("send")} extra={<Megaphone className="size-5 text-muted" aria-hidden />} />
    </form>
  );
}
