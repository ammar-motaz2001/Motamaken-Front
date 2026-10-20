"use client";

import { Archive, ArchiveRestore, CornerDownRight, Pencil, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { CATEGORY_ICONS, CategoryIcon } from "@/components/ui/CategoryIcon";
import type { AdminCategory } from "../types";
import { SaveBar, TextInput } from "./FormBits";
import { Listbox } from "@/components/ui/Listbox";
import { useAdminSave } from "./useAdminSave";

type Draft = { type: AdminCategory["type"]; slug: string; nameEn: string; nameAr: string; icon: string; sortOrder: string; parentId: string };

const EMPTY: Draft = { type: "project", slug: "", nameEn: "", nameAr: "", icon: "", sortOrder: "0", parentId: "" };

/** The category list with one inline form, used both to add a category and to edit the chosen one. */
export function CategoryEditor({ categories }: { categories: AdminCategory[] }) {
  const t = useTranslations("Admin.categories");
  const { busy, error, fields, saved, save } = useAdminSave();
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const remove = useAdminSave();
  const archive = useAdminSave();

  const open = (category?: AdminCategory) => {
    setEditing(category?.id ?? "new");
    setDraft(
      category
        ? {
            type: category.type,
            slug: category.slug,
            nameEn: category.nameEn,
            nameAr: category.nameAr,
            icon: category.icon ?? "",
            sortOrder: String(category.sortOrder),
            parentId: category.parentId ? String(category.parentId) : "",
          }
        : EMPTY,
    );
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const body = { ...draft, icon: draft.icon || null, sortOrder: Number(draft.sortOrder || 0), parentId: draft.parentId ? Number(draft.parentId) : null };
    const result = await save(editing === "new" ? "/admin/categories" : `/admin/categories/${editing}`, editing === "new" ? "POST" : "PATCH", body);
    if (result) setEditing(null);
  };

  const destroy = async (category: AdminCategory) => {
    if (!window.confirm(t("confirmDelete", { name: category.nameEn }))) return;
    setDeleteError(null);
    const result = await remove.save(`/admin/categories/${category.id}`, "DELETE");
    if (!result) setDeleteError(t("deleteFailed", { name: category.nameEn }));
  };

  const toggleArchive = async (category: AdminCategory) => {
    if (category.isActive && !window.confirm(t("confirmArchive", { name: category.nameEn }))) return;
    await archive.save(`/admin/categories/${category.id}`, "PATCH", { isActive: !category.isActive });
  };

  const set = (key: keyof Draft) => (value: string) => setDraft((current) => ({ ...current, [key]: value }));
  // Top-level categories, each followed by its subcategories.
  const ordered = (type: AdminCategory["type"]) =>
    categories
      .filter((c) => c.type === type && !c.parentId)
      .flatMap((parent) => [parent, ...categories.filter((c) => c.parentId === parent.id)]);
  const groups = (["project", "influencer"] as const).map((type) => ({ type, items: ordered(type) }));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-end">
        <button type="button" onClick={() => open()} className="inline-flex h-10 items-center gap-1.5 rounded-md bg-brand px-4 text-sm font-semibold text-white">
          <Plus className="size-4" /> {t("add")}
        </button>
      </div>

      {editing !== null && (
        <form onSubmit={submit} className="flex flex-col gap-4 rounded-xl border border-brand/40 bg-brand/5 p-4">
          <p className="font-bold">{editing === "new" ? t("add") : t("edit")}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="category-type" className="text-sm font-medium">
                {t("type")}
              </label>
              <Listbox
                id="category-type"
                value={draft.type}
                onChange={(value) => setDraft((current) => ({ ...current, type: value as Draft["type"], parentId: "" }))}
                options={[
                  { value: "project", label: t("types.project") },
                  { value: "influencer", label: t("types.influencer") },
                ]}
              />
            </div>
            <TextInput label={t("slug")} hint={t("slugHint")} dir="ltr" value={draft.slug} onChange={set("slug")} error={fields.slug} required />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="category-icon" className="text-sm font-medium">
                {t("icon")}
              </label>
              <div className="flex items-center gap-2">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-brand">
                  <CategoryIcon icon={draft.icon} className="size-5" />
                </span>
                <Listbox
                  id="category-icon"
                  className="flex-1"
                  value={draft.icon}
                  onChange={set("icon")}
                  options={[
                    { value: "", label: t("noIcon") },
                    ...CATEGORY_ICONS.map((icon) => ({ value: icon, label: icon, icon: <CategoryIcon icon={icon} className="size-4 text-brand" /> })),
                  ]}
                />
              </div>
            </div>
            <TextInput label={t("nameEn")} dir="ltr" value={draft.nameEn} onChange={set("nameEn")} error={fields.nameEn} required />
            <TextInput label={t("nameAr")} dir="rtl" value={draft.nameAr} onChange={set("nameAr")} error={fields.nameAr} required />
            <TextInput label={t("sortOrder")} type="number" value={draft.sortOrder} onChange={set("sortOrder")} error={fields.sortOrder} />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="category-parent" className="text-sm font-medium">
                {t("parent")}
              </label>
              <Listbox
                id="category-parent"
                value={draft.parentId}
                onChange={set("parentId")}
                options={[
                  { value: "", label: t("topLevel") },
                  ...categories.filter((c) => c.type === draft.type && !c.parentId && c.id !== editing).map((c) => ({ value: String(c.id), label: `${c.nameEn} · ${c.nameAr}` })),
                ]}
              />
              {fields.parentId && <p className="text-xs text-danger">{fields.parentId}</p>}
            </div>
          </div>
          <SaveBar
            busy={busy}
            error={error}
            saved={saved}
            extra={
              <button type="button" onClick={() => setEditing(null)} className="h-10 rounded-md border border-border bg-surface px-4 text-sm font-semibold">
                {t("cancel")}
              </button>
            }
          />
        </form>
      )}

      {deleteError && (
        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {remove.error ?? deleteError}
        </p>
      )}

      {groups.map((group) => (
        <section key={group.type} className="flex flex-col gap-2">
          <h3 className="font-bold">{t(`types.${group.type}`)}</h3>
          <ul className="divide-y divide-border rounded-xl border border-border">
            {group.items.map((category) => (
              <li key={category.id} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${category.parentId ? "ps-10" : ""} ${category.isActive ? "" : "opacity-60"}`}>
                {category.parentId && <CornerDownRight className="size-4 shrink-0 text-muted" aria-hidden />}
                <span className="flex size-9 items-center justify-center rounded-lg bg-surface-muted text-brand">
                  <CategoryIcon icon={category.icon ?? ""} className="size-5" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-medium">
                    {category.nameEn} · <span dir="rtl">{category.nameAr}</span>
                    {!category.isActive && <span className="ms-2 rounded-full bg-surface-muted px-2 py-0.5 text-xs text-muted">{t("archived")}</span>}
                  </span>
                  <span className="text-xs text-muted" dir="ltr">
                    {category.slug} · #{category.sortOrder} · {t("projects", { count: category.projects })}
                  </span>
                </span>
                <button type="button" onClick={() => open(category)} aria-label={t("edit")} className="flex size-8 items-center justify-center rounded-md border border-border hover:border-brand">
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => toggleArchive(category)}
                  disabled={archive.busy}
                  title={category.isActive ? t("archive") : t("restore")}
                  aria-label={category.isActive ? t("archive") : t("restore")}
                  className="flex size-8 items-center justify-center rounded-md border border-border hover:border-brand disabled:opacity-40"
                >
                  {category.isActive ? <Archive className="size-4" /> : <ArchiveRestore className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => destroy(category)}
                  disabled={remove.busy || category.projects > 0}
                  title={category.projects > 0 ? t("inUse") : t("delete")}
                  aria-label={t("delete")}
                  className="flex size-8 items-center justify-center rounded-md border border-border text-danger hover:bg-danger-soft disabled:opacity-40"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
            {group.items.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted">{t("empty")}</li>}
          </ul>
        </section>
      ))}
    </div>
  );
}
