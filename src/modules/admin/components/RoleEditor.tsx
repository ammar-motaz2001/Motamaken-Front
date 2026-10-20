"use client";

import { Pencil, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import type { AdminRoleRow } from "../types";
import { SaveBar, TextInput } from "./FormBits";
import { useAdminSave } from "./useAdminSave";

/** Create a staff role or change one: a name in both languages and the parts of the panel it opens. */
export function RoleEditor({ role, permissions }: { role?: AdminRoleRow; permissions: string[] }) {
  const t = useTranslations("Admin.staff");
  const locale = useLocale();
  const { busy, error, fields, saved, save } = useAdminSave();
  const [open, setOpen] = useState(false);
  const [nameEn, setNameEn] = useState(role?.nameEn ?? "");
  const [nameAr, setNameAr] = useState(role?.nameAr ?? "");
  const [picked, setPicked] = useState<string[]>(role?.permissions ?? ["overview"]);

  const toggle = (permission: string) => setPicked((current) => (current.includes(permission) ? current.filter((p) => p !== permission) : [...current, permission]));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await save(role ? `/admin/roles/${role.id}` : "/admin/roles", role ? "PATCH" : "POST", { nameEn, nameAr, permissions: picked });
    if (result) setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={role ? "flex size-8 items-center justify-center rounded-md border border-border hover:border-brand" : "inline-flex h-8 items-center gap-1.5 rounded-md bg-brand px-3 text-xs font-semibold text-white"}
        aria-label={role ? t("editRole") : undefined}
      >
        {role ? <Pencil className="size-4" /> : <><Plus className="size-4" /> {t("newRole")}</>}
      </button>
      <Modal open={open} onClose={() => !busy && setOpen(false)} title={role ? (locale === "ar" ? role.nameAr : role.nameEn) : t("newRole")} showClose>
        <form onSubmit={submit} className="flex w-full flex-col gap-4 text-start">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput label={t("nameEn")} dir="ltr" value={nameEn} onChange={setNameEn} error={fields.nameEn} required />
            <TextInput label={t("nameAr")} dir="rtl" value={nameAr} onChange={setNameAr} error={fields.nameAr} required />
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium">{t("permissions")}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {permissions.map((permission) => (
                <label key={permission} className="flex items-start gap-2 rounded-lg border border-border p-2.5 text-sm has-checked:border-brand has-checked:bg-brand/5">
                  <input type="checkbox" checked={picked.includes(permission)} onChange={() => toggle(permission)} className="mt-0.5 size-4 accent-brand" />
                  <span>
                    <span className="font-medium">{t(`permission.${permission.replace(".", "_")}`)}</span>
                    <span className="block text-xs text-muted">{t(`permissionHint.${permission.replace(".", "_")}`)}</span>
                  </span>
                </label>
              ))}
            </div>
            {fields.permissions && <p className="text-xs text-danger">{fields.permissions}</p>}
          </fieldset>
          <SaveBar busy={busy} error={error} saved={saved} />
        </form>
      </Modal>
    </>
  );
}
