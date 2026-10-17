"use client";

import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Markdown } from "@/components/ui/Markdown";
import { useRouter } from "@/i18n/navigation";
import type { AdminPage } from "../types";
import { inputClasses } from "./ActionButton";
import { SaveBar, TextInput } from "./FormBits";
import { Listbox } from "@/components/ui/Listbox";
import { useAdminSave } from "./useAdminSave";

type Lang = "En" | "Ar";

/** Bilingual Markdown editor for an info page, with a live preview of the language being edited. */
export function PageEditor({ page, placeholders }: { page: AdminPage | null; placeholders: string[] }) {
  const t = useTranslations("Admin.pages");
  const router = useRouter();
  const { busy, error, fields, saved, save } = useAdminSave();
  const remove = useAdminSave();
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [section, setSection] = useState<AdminPage["section"]>(page?.section ?? "help");
  const [sortOrder, setSortOrder] = useState(String(page?.sortOrder ?? 0));
  const [published, setPublished] = useState(page?.isPublished ?? true);
  const [title, setTitle] = useState({ En: page?.titleEn ?? "", Ar: page?.titleAr ?? "" });
  const [body, setBody] = useState({ En: page?.bodyEn ?? "", Ar: page?.bodyAr ?? "" });
  const [lang, setLang] = useState<Lang>("En");
  const [preview, setPreview] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const result = await save(`/admin/pages/${encodeURIComponent(slug.trim())}`, "PUT", {
      section,
      titleEn: title.En,
      titleAr: title.Ar,
      bodyEn: body.En,
      bodyAr: body.Ar,
      isPublished: published,
      sortOrder: Number(sortOrder || 0),
    });
    if (result && !page) router.replace(`/admin/pages/${slug.trim()}`);
  };

  const destroy = async () => {
    if (!page || !window.confirm(t("confirmDelete", { title: page.titleEn }))) return;
    if (await remove.save(`/admin/pages/${page.slug}`, "DELETE")) router.replace("/admin/pages");
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <TextInput label={t("slug")} hint={page ? t("slugLocked") : t("slugHint")} dir="ltr" value={slug} onChange={setSlug} required readOnly={Boolean(page)} error={fields.slug} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="page-section" className="text-sm font-medium">
            {t("section")}
          </label>
          <Listbox
            id="page-section"
            value={section}
            onChange={(value) => setSection(value as AdminPage["section"])}
            options={(["about", "help", "legal"] as const).map((value) => ({ value, label: t(`sections.${value}`) }))}
          />
        </div>
        <TextInput label={t("sortOrder")} type="number" value={sortOrder} onChange={setSortOrder} error={fields.sortOrder} />
        <label className="flex items-center gap-2 self-end pb-3 text-sm">
          <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} className="size-4 accent-brand" />
          {t("published")}
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-lg border border-border p-1" role="tablist">
          {(["En", "Ar"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={lang === value}
              onClick={() => setLang(value)}
              className={`rounded-md px-4 py-1.5 text-sm ${lang === value ? "bg-brand text-white" : "hover:bg-surface-muted"}`}
            >
              {t(`lang.${value}`)}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={preview} onChange={(event) => setPreview(event.target.checked)} className="size-4 accent-brand" />
          {t("preview")}
        </label>
      </div>

      <div dir={lang === "Ar" ? "rtl" : "ltr"} className="flex flex-col gap-4">
        <TextInput
          label={t("pageTitle")}
          value={title[lang]}
          onChange={(value) => setTitle((current) => ({ ...current, [lang]: value }))}
          required
          error={fields[`title${lang}`]}
        />
        <div className={`grid gap-4 ${preview ? "lg:grid-cols-2" : ""}`}>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="page-body" className="text-sm font-medium">
              {t("body")}
            </label>
            <textarea
              id="page-body"
              rows={22}
              value={body[lang]}
              required
              onChange={(event) => setBody((current) => ({ ...current, [lang]: event.target.value }))}
              className={`${inputClasses} font-mono text-[13px] leading-relaxed`}
            />
            {fields[`body${lang}`] && <p className="text-xs text-danger">{fields[`body${lang}`]}</p>}
          </div>
          {preview && (
            <div className="max-h-[560px] overflow-y-auto rounded-lg border border-border p-4">
              <h2 className="mb-3 text-xl font-bold">{title[lang]}</h2>
              <Markdown source={body[lang]} />
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-muted">
        {t("help")} {placeholders.map((p) => <code key={p} className="mx-0.5 rounded bg-surface-muted px-1" dir="ltr">{p}</code>)}
      </p>

      <SaveBar
        busy={busy}
        error={error ?? remove.error}
        saved={saved}
        extra={
          page && (
            <button type="button" onClick={destroy} disabled={remove.busy} className="h-10 rounded-md border border-danger/40 px-4 text-sm font-semibold text-danger hover:bg-danger-soft">
              {t("delete")}
            </button>
          )
        }
      />
    </form>
  );
}
