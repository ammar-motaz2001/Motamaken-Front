import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { StatusPill } from "@/components/ui/StatusPill";
import { getCategories } from "@/lib/api/reference";
import { pickParams, toQuery } from "@/lib/params";
import { ActionButton, AdminHeader, AdminSearch, AdminSection, AdminTable, Cell, type AdminSkill } from "@/modules/admin";
import { adminGet } from "@/modules/admin/server";

export default async function AdminSkills({ params, searchParams }: PageProps<"/[locale]/admin/skills">) {
  setRequestLocale((await params).locale);
  const filter = pickParams(await searchParams, ["q", "categoryId"]);
  const [t, locale, categories, result] = await Promise.all([
    getTranslations("Admin.skills"),
    getLocale(),
    getCategories(),
    adminGet<{ data: AdminSkill[]; suggestions: { name: string; profiles: number }[] }>(`/admin/skills${toQuery(filter)}`),
  ]);
  const ar = locale === "ar";
  const categoryOptions = [{ value: "", label: t("noCategory") }, ...categories.filter((c) => c.type === "project").map((c) => ({ value: String(c.id), label: c.name }))];
  const fields = (skill?: AdminSkill) => [
    { name: "nameEn", label: t("nameEn"), required: true, defaultValue: skill?.nameEn ?? "" },
    { name: "nameAr", label: t("nameAr"), required: true, defaultValue: skill?.nameAr ?? "" },
    { name: "categoryId", label: t("category"), type: "select" as const, options: categoryOptions, defaultValue: skill?.category ? String(skill.category.id) : "" },
    { name: "sortOrder", label: t("order"), type: "number" as const, defaultValue: String(skill?.sortOrder ?? 0) },
  ];

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} actions={<ActionButton label={t("add")} tone="brand" size="md" endpoint="/admin/skills" fields={fields()} />} />
      {result.suggestions.length > 0 && (
        <AdminSection title={t("suggestions")}>
          <p className="text-sm text-muted">{t("suggestionsHint")}</p>
          <div className="flex flex-wrap gap-2">
            {result.suggestions.map((s) => (
              <span key={s.name} className="flex items-center gap-2 rounded-full border border-border py-1 ps-3 pe-1 text-sm">
                {s.name} <span className="text-xs text-muted">{t("profiles", { count: s.profiles })}</span>
                <ActionButton label={t("addOne")} endpoint="/admin/skills" fields={fields({ id: 0, slug: "", nameEn: s.name, nameAr: s.name, isActive: true, sortOrder: 0, category: null })} />
              </span>
            ))}
          </div>
        </AdminSection>
      )}
      <AdminSection>
        <AdminSearch placeholder={t("search")} filters={[{ name: "categoryId", label: t("anyCategory"), options: categoryOptions.slice(1) }]} />
        <AdminTable head={[t("skill"), t("category"), t("order"), t("state"), ""]} empty={result.data.length ? false : t("empty")}>
          {result.data.map((skill) => (
            <tr key={skill.id} className={skill.isActive ? "" : "opacity-60"}>
              <Cell>
                <span className="font-medium">{ar ? skill.nameAr : skill.nameEn}</span>
                <div className="text-xs text-muted">
                  {ar ? skill.nameEn : skill.nameAr} · <span dir="ltr">{skill.slug}</span>
                </div>
              </Cell>
              <Cell>{skill.category ? (ar ? skill.category.nameAr : skill.category.nameEn) : "—"}</Cell>
              <Cell>{skill.sortOrder}</Cell>
              <Cell>
                <StatusPill tone={skill.isActive ? "success" : "muted"}>{skill.isActive ? t("suggested") : t("hidden")}</StatusPill>
              </Cell>
              <Cell>
                <div className="flex flex-wrap justify-end gap-1.5">
                  <ActionButton label={t("edit")} endpoint={`/admin/skills/${skill.id}`} method="PATCH" fields={fields(skill)} />
                  <ActionButton label={skill.isActive ? t("hide") : t("show")} endpoint={`/admin/skills/${skill.id}`} method="PATCH" body={{ isActive: !skill.isActive }} />
                  <ActionButton label={t("delete")} tone="danger" method="DELETE" endpoint={`/admin/skills/${skill.id}`} confirm={t("confirmDelete")} />
                </div>
              </Cell>
            </tr>
          ))}
        </AdminTable>
      </AdminSection>
    </>
  );
}
