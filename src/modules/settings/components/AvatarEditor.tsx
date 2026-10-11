"use client";

import { Camera } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { User } from "@/lib/api/types";
import { CropStep, PhotoStep } from "@/modules/promotions";

export function AvatarEditor({ user, onChange }: { user: User; onChange: (user: User) => void }) {
  const t = useTranslations("Settings.profile");
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => (setOpen(false), setFile(null), setError(null));

  const upload = async (blob: Blob) => {
    setBusy(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("avatar", blob, "avatar.jpg");
      const { data } = await api<{ data: User }>("/me/avatar", { method: "POST", body });
      onChange(data);
      close();
    } catch (caught) {
      setError((caught as ApiError).fields.avatar ?? (caught as ApiError).message ?? t("photoFailed"));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const { data } = await api<{ data: User }>("/me/avatar", { method: "DELETE" });
    onChange(data);
  };

  return (
    <div className="flex items-center gap-4">
      <button type="button" onClick={() => setOpen(true)} className="group relative rounded-full" aria-label={t("changePhoto")}>
        <UserAvatar name={user.fullName} src={user.avatarUrl} size={80} />
        <span className="absolute -end-1 bottom-0 flex size-7 items-center justify-center rounded-full border-2 border-surface bg-brand text-white">
          <Camera className="size-3.5" />
        </span>
      </button>
      <div className="flex flex-col items-start gap-1 text-sm">
        <button type="button" onClick={() => setOpen(true)} className="font-medium text-brand hover:underline">
          {t("changePhoto")}
        </button>
        {user.avatarUrl && (
          <button type="button" onClick={remove} className="text-xs text-danger hover:underline">
            {t("removePhoto")}
          </button>
        )}
      </div>
      <Modal open={open} onClose={close} showClose title={file ? t("cropTitle") : t("changePhoto")}>
        {file ? (
          <CropStep file={file} busy={busy} onCrop={upload} />
        ) : (
          <PhotoStep name={user.fullName} currentUrl={null} onCurrent={close} onFile={setFile} />
        )}
        {error && <p className="text-sm text-danger">{error}</p>}
      </Modal>
    </div>
  );
}
