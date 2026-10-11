"use client";

import { ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { TextArea } from "@/components/ui/TextArea";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { PortfolioItem } from "@/lib/api/types";

type Draft = { id: number | null; title: string; description: string; link: string; image: File | null; preview: string | null };

const MAX_BYTES = 8 * 1024 * 1024;

export function PortfolioSection({ initial }: { initial: PortfolioItem[] }) {
  const t = useTranslations("ProfileEditor.portfolio");
  const [items, setItems] = useState(initial);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const open = (item: PortfolioItem | null) => {
    setErrors({});
    setDraft(
      item
        ? { id: item.id, title: item.title, description: item.description ?? "", link: item.link ?? "", image: null, preview: item.imageUrl }
        : { id: null, title: "", description: "", link: "", image: null, preview: null },
    );
  };

  const pick = (file: File | undefined) => {
    if (!file || !draft) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > MAX_BYTES) return setErrors({ image: t("imageInvalid") });
    setErrors({});
    setDraft({ ...draft, image: file, preview: URL.createObjectURL(file) });
  };

  const save = async () => {
    if (!draft) return;
    const found: Record<string, string> = {};
    if (draft.title.trim().length < 2) found.title = t("titleRequired");
    if (!draft.id && !draft.image) found.image = t("imageRequired");
    setErrors(found);
    if (Object.keys(found).length) return;

    const body = new FormData();
    body.append("title", draft.title.trim());
    if (draft.description.trim()) body.append("description", draft.description.trim());
    if (draft.link.trim()) body.append("link", draft.link.trim());
    if (draft.image) body.append("image", draft.image);
    if (draft.id) body.append("_method", "PATCH");

    setBusy(true);
    try {
      const { data } = await api<{ data: PortfolioItem }>(draft.id ? `/me/portfolio/${draft.id}` : "/me/portfolio", { method: "POST", body });
      setItems((current) => (draft.id ? current.map((item) => (item.id === data.id ? data : item)) : [...current, data]));
      setDraft(null);
    } catch (caught) {
      const apiError = caught as ApiError;
      setErrors({ ...apiError.fields, ...(Object.keys(apiError.fields).length ? {} : { form: apiError.message ?? t("failed") }) });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    await api(`/me/portfolio/${id}`, { method: "DELETE" }).catch(() => undefined);
    setItems((current) => current.filter((item) => item.id !== id));
  };

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-base font-bold">{t("title")}</h2>
        {items.length < 30 && (
          <button type="button" onClick={() => open(null)} className="flex items-center gap-1 text-sm font-medium text-brand hover:underline">
            <Plus className="size-4" />
            {t("add")}
          </button>
        )}
      </div>
      {items.length ? (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="group relative overflow-hidden rounded-xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt="" className="aspect-[4/3] w-full object-cover" />
              <p className="truncate p-2 text-sm font-medium">{item.title}</p>
              <div className="absolute end-2 top-2 flex gap-1">
                <button type="button" aria-label={t("edit")} onClick={() => open(item)} className="rounded-full bg-surface/90 p-1.5 shadow-card hover:text-brand">
                  <Pencil className="size-3.5" />
                </button>
                <button type="button" aria-label={t("delete")} onClick={() => remove(item.id)} className="rounded-full bg-surface/90 p-1.5 shadow-card hover:text-danger">
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">{t("empty")}</p>
      )}

      <Modal open={Boolean(draft)} onClose={() => setDraft(null)} showClose title={draft?.id ? t("editTitle") : t("addTitle")}>
        {draft && (
          <div className="flex w-full flex-col gap-4 text-start">
            <label className={`flex cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border border-dashed text-sm ${errors.image ? "border-danger" : "border-border"}`}>
              {draft.preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.preview} alt="" className="max-h-56 w-full object-contain" />
              ) : (
                <span className="flex flex-col items-center gap-2 py-8 text-muted">
                  <ImagePlus className="size-8" aria-hidden />
                  {t("pickImage")}
                </span>
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => pick(event.target.files?.[0])} />
            </label>
            {errors.image && <p className="-mt-2 text-xs text-danger">{errors.image}</p>}
            <Field label={t("itemTitle")} required maxLength={120} value={draft.title} error={errors.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
            <TextArea label={t("description")} rows={3} maxLength={2000} value={draft.description} error={errors.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} />
            <Field label={t("link")} type="url" dir="ltr" placeholder="https://" value={draft.link} error={errors.link} onChange={(event) => setDraft({ ...draft, link: event.target.value })} />
            {errors.form && <p className="text-sm text-danger">{errors.form}</p>}
            <div className="flex justify-center gap-3">
              <Button variant="outline" font="button" onClick={() => setDraft(null)}>
                {t("cancel")}
              </Button>
              <Button variant="solid" font="button" loading={busy} onClick={save}>
                {t("save")}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
