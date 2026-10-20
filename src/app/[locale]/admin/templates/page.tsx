import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { StatusPill } from "@/components/ui/StatusPill";
import { pickParams } from "@/lib/params";
import { ActionButton, AdminHeader, AdminSearch, AdminSection, type NotificationTemplateRow } from "@/modules/admin";
import { adminGet } from "@/modules/admin/server";

export default async function AdminTemplates({ params, searchParams }: PageProps<"/[locale]/admin/templates">) {
  setRequestLocale((await params).locale);
  const filter = pickParams(await searchParams, ["group", "q"]);
  const [t, locale, result] = await Promise.all([getTranslations("Admin.templates"), getLocale(), adminGet<{ data: NotificationTemplateRow[] }>("/admin/notification-templates")]);
  const ar = locale === "ar";
  const groups = [...new Set(result.data.map((row) => row.group))];
  const q = filter.q?.toLowerCase();
  const rows = result.data.filter(
    (row) => (!filter.group || row.group === filter.group) && (!q || [row.type, row.defaultEn, row.defaultAr, row.custom?.textEn, row.custom?.textAr].some((v) => v?.toLowerCase().includes(q))),
  );

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} />
      <AdminSection>
        <AdminSearch placeholder={t("search")} filters={[{ name: "group", label: t("anyGroup"), options: groups.map((g) => ({ value: g, label: t(`groups.${g}`) })) }]} />
        <ul className="flex flex-col divide-y divide-border">
          {rows.map((row) => (
            <li key={row.type} className="flex flex-col gap-2 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="flex flex-wrap items-center gap-2">
                  <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">{row.type}</code>
                  <StatusPill tone="muted">{t(`groups.${row.group}`)}</StatusPill>
                  {row.custom && <StatusPill tone={row.custom.isActive ? "success" : "muted"}>{row.custom.isActive ? t("customised") : t("customOff")}</StatusPill>}
                </span>
                <div className="flex gap-1.5">
                  <ActionButton
                    label={t("edit")}
                    method="PUT"
                    endpoint={`/admin/notification-templates/${row.type}`}
                    description={row.placeholders.length ? t("placeholders", { list: row.placeholders.map((p) => `:${p}`).join("  ") }) : t("noPlaceholders")}
                    fields={[
                      { name: "textEn", label: t("textEn"), type: "textarea", required: true, defaultValue: row.custom?.textEn ?? row.defaultEn },
                      { name: "textAr", label: t("textAr"), type: "textarea", required: true, defaultValue: row.custom?.textAr ?? row.defaultAr },
                      { name: "subjectEn", label: t("subjectEn"), defaultValue: row.custom?.subjectEn ?? "", hint: t("subjectHint") },
                      { name: "subjectAr", label: t("subjectAr"), defaultValue: row.custom?.subjectAr ?? "" },
                      { name: "isActive", label: t("active"), type: "checkbox", defaultValue: row.custom?.isActive === false ? "" : "1" },
                    ]}
                  />
                  {row.custom && <ActionButton label={t("reset")} tone="danger" method="DELETE" endpoint={`/admin/notification-templates/${row.type}`} confirm={t("confirmReset")} />}
                </div>
              </div>
              <p className="text-sm">{row.custom?.isActive ? (ar ? row.custom.textAr : row.custom.textEn) : ar ? row.defaultAr : row.defaultEn}</p>
              {row.custom?.isActive && <p className="text-xs text-muted line-through">{ar ? row.defaultAr : row.defaultEn}</p>}
            </li>
          ))}
        </ul>
      </AdminSection>
    </>
  );
}
