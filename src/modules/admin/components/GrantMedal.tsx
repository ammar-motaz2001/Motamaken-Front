"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Listbox } from "@/components/ui/Listbox";
import { Modal } from "@/components/ui/Modal";
import { inputClasses } from "./ActionButton";
import { SaveBar } from "./FormBits";
import { useAdminSave } from "./useAdminSave";

/** Give a user a medal by hand, with the reason kept in the record. */
export function GrantMedal({ userId, medals }: { userId: number; medals: { id: number; name: string }[] }) {
  const t = useTranslations("Admin.users");
  const { busy, error, saved, save } = useAdminSave();
  const [open, setOpen] = useState(false);
  const [medal, setMedal] = useState("");
  const [reason, setReason] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (await save(`/admin/medals/${medal}/grant`, "POST", { userId, reason })) setOpen(false);
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-8 items-center rounded-md border border-border bg-surface px-3 text-xs font-semibold hover:border-brand">
        {t("giveMedal")}
      </button>
      <Modal open={open} onClose={() => !busy && setOpen(false)} title={t("giveMedal")} showClose>
        <form onSubmit={submit} className="flex w-full flex-col gap-4 text-start">
          <Listbox aria-label={t("medal")} required value={medal} onChange={setMedal} options={medals.map((m) => ({ value: String(m.id), label: m.name }))} placeholder={t("medal")} />
          <textarea required minLength={3} rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t("reason")} aria-label={t("reason")} className={inputClasses} />
          <SaveBar busy={busy} error={error} saved={saved} label={t("giveMedal")} />
        </form>
      </Modal>
    </>
  );
}
