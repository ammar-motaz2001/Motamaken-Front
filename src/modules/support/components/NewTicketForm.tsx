"use client";

import { Paperclip } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Listbox } from "@/components/ui/Listbox";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import { SUPPORT_CATEGORIES, type SupportTicket } from "../types";

const field = "w-full rounded-[5px] border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand";

/** "Contact support": opens a ticket with the first message. */
export function NewTicketForm() {
  const t = useTranslations("Support");
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setErrors({});
    setError(null);
    const form = new FormData();
    form.append("subject", subject);
    form.append("category", category);
    form.append("body", body);
    if (file) form.append("file", file);
    try {
      const { data } = await api<{ data: SupportTicket }>("/support", { method: "POST", body: form });
      router.push(`/support/${data.id}`);
    } catch (caught) {
      const apiError = caught as ApiError;
      setErrors(apiError.fields ?? {});
      setError(apiError.fields ? null : (apiError.message ?? t("failed")));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_14rem]">
        <label className="flex flex-col gap-1.5 text-sm font-medium">
          {t("subject")}
          <input required minLength={5} maxLength={150} value={subject} onChange={(e) => setSubject(e.target.value)} className={field} />
          {errors.subject && <span className="text-xs font-normal text-danger">{errors.subject}</span>}
        </label>
        <div className="flex flex-col gap-1.5 text-sm font-medium">
          <span id="ticket-category">{t("category")}</span>
          <Listbox
            aria-labelledby="ticket-category"
            required
            value={category}
            onChange={setCategory}
            placeholder={t("chooseCategory")}
            options={SUPPORT_CATEGORIES.map((value) => ({ value, label: t(`categories.${value}`) }))}
          />
        </div>
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        {t("message")}
        <textarea required minLength={10} maxLength={5000} rows={6} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t("messagePlaceholder")} className={field} />
        {errors.body && <span className="text-xs font-normal text-danger">{errors.body}</span>}
      </label>
      <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-link">
        <Paperclip className="size-4" />
        {file ? file.name : t("attachOptional")}
        <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </label>
      {errors.file && <span className="text-xs text-danger">{errors.file}</span>}
      {error && (
        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <button type="submit" disabled={busy} className="h-11 self-start rounded-md bg-brand px-6 text-sm font-semibold text-white disabled:opacity-50">
        {busy ? <span className="inline-block size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" role="status" /> : t("open")}
      </button>
    </form>
  );
}
