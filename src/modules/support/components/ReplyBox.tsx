"use client";

import { Paperclip, Send, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";

/** Write in a ticket thread, with an optional file. */
export function ReplyBox({ endpoint, placeholder }: { endpoint: string; placeholder?: string }) {
  const t = useTranslations("Support");
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!body.trim() && !file) return;
    setBusy(true);
    setError(null);
    const form = new FormData();
    if (body.trim()) form.append("body", body.trim());
    if (file) form.append("file", file);
    try {
      await api(endpoint, { method: "POST", body: form });
      setBody("");
      setFile(null);
      router.refresh();
    } catch (caught) {
      const apiError = caught as ApiError;
      setError(Object.values(apiError.fields ?? {})[0] ?? apiError.message ?? t("failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3 focus-within:border-brand">
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={3}
        maxLength={5000}
        placeholder={placeholder ?? t("replyPlaceholder")}
        aria-label={t("reply")}
        className="w-full resize-y bg-transparent text-sm outline-none"
      />
      {error && (
        <p role="alert" className="text-xs text-danger">
          {error}
        </p>
      )}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <input ref={input} type="file" className="hidden" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
          <button type="button" onClick={() => input.current?.click()} className="flex size-9 items-center justify-center rounded-md text-muted hover:bg-surface-muted" aria-label={t("attach")}>
            <Paperclip className="size-4" />
          </button>
          {file && (
            <span className="flex min-w-0 items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-xs">
              <span className="truncate">{file.name}</span>
              <button type="button" onClick={() => setFile(null)} aria-label={t("removeFile")}>
                <X className="size-3.5" />
              </button>
            </span>
          )}
        </div>
        <button type="submit" disabled={busy || (!body.trim() && !file)} className="inline-flex h-9 items-center gap-1.5 rounded-md bg-brand px-4 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" role="status" /> : <Send className="size-4 rtl:-scale-x-100" />}
          {t("send")}
        </button>
      </div>
    </form>
  );
}
