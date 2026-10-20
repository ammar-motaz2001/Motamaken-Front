import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { StatusPill } from "@/components/ui/StatusPill";
import { ActionButton, AdminHeader, AdminSection, type ActionField, type AdminFaqGroup } from "@/modules/admin";
import { adminGet } from "@/modules/admin/server";

const AUDIENCES = ["all", "client", "freelancer", "influencer"] as const;

export default async function AdminFaqs({ params }: PageProps<"/[locale]/admin/faqs">) {
  setRequestLocale((await params).locale);
  const [t, locale, groups] = await Promise.all([getTranslations("Admin.faqs"), getLocale(), adminGet<{ data: AdminFaqGroup[] }>("/admin/faqs")]);
  const ar = locale === "ar";

  const groupFields = (group?: AdminFaqGroup): ActionField[] => [
    { name: "nameEn", label: t("nameEn"), required: true, defaultValue: group?.nameEn ?? "" },
    { name: "nameAr", label: t("nameAr"), required: true, defaultValue: group?.nameAr ?? "" },
    { name: "sortOrder", label: t("order"), type: "number", defaultValue: String(group?.sortOrder ?? 0) },
  ];
  const faqFields = (groupId: number, faq?: AdminFaqGroup["faqs"][number]): ActionField[] => [
    { name: "categoryId", label: t("group"), type: "select", required: true, defaultValue: String(faq?.categoryId ?? groupId), options: groups.data.map((g) => ({ value: String(g.id), label: ar ? g.nameAr : g.nameEn })) },
    { name: "questionEn", label: t("questionEn"), required: true, defaultValue: faq?.questionEn ?? "" },
    { name: "answerEn", label: t("answerEn"), type: "textarea", required: true, defaultValue: faq?.answerEn ?? "" },
    { name: "questionAr", label: t("questionAr"), required: true, defaultValue: faq?.questionAr ?? "" },
    { name: "answerAr", label: t("answerAr"), type: "textarea", required: true, defaultValue: faq?.answerAr ?? "" },
    { name: "audience", label: t("audience"), type: "select", required: true, defaultValue: faq?.audience ?? "all", options: AUDIENCES.map((value) => ({ value, label: t(`audiences.${value}`) })) },
    { name: "sortOrder", label: t("order"), type: "number", defaultValue: String(faq?.sortOrder ?? 0) },
  ];

  return (
    <>
      <AdminHeader title={t("title")} subtitle={t("subtitle")} actions={<ActionButton label={t("addGroup")} tone="brand" size="md" endpoint="/admin/faq-categories" fields={groupFields()} />} />
      {groups.data.length === 0 && (
        <AdminSection>
          <p className="py-8 text-center text-sm text-muted">{t("empty")}</p>
        </AdminSection>
      )}
      {groups.data.map((group) => (
        <AdminSection
          key={group.id}
          title={`${ar ? group.nameAr : group.nameEn}${group.isActive ? "" : ` (${t("hidden")})`}`}
          actions={
            <div className="flex flex-wrap gap-1.5">
              <ActionButton label={t("addQuestion")} tone="brand" endpoint="/admin/faqs" fields={faqFields(group.id)} />
              <ActionButton label={t("editGroup")} method="PATCH" endpoint={`/admin/faq-categories/${group.id}`} fields={groupFields(group)} />
              <ActionButton label={group.isActive ? t("hide") : t("show")} method="PATCH" endpoint={`/admin/faq-categories/${group.id}`} body={{ isActive: !group.isActive }} />
              <ActionButton label={t("delete")} tone="danger" method="DELETE" endpoint={`/admin/faq-categories/${group.id}`} confirm={t("confirmDeleteGroup")} />
            </div>
          }
        >
          {group.faqs.length ? (
            <ul className="flex flex-col divide-y divide-border">
              {group.faqs.map((faq) => (
                <li key={faq.id} className={`flex flex-wrap items-start justify-between gap-3 py-3 ${faq.isPublished ? "" : "opacity-60"}`}>
                  <details className="min-w-0 flex-1">
                    <summary className="cursor-pointer font-medium">
                      {ar ? faq.questionAr : faq.questionEn}
                      <span className="ms-2 inline-flex gap-1 align-middle">
                        <StatusPill tone="muted">{t(`audiences.${faq.audience}`)}</StatusPill>
                        {!faq.isPublished && <StatusPill tone="warning">{t("draft")}</StatusPill>}
                      </span>
                    </summary>
                    <p className="mt-2 text-sm whitespace-pre-line text-muted">{ar ? faq.answerAr : faq.answerEn}</p>
                  </details>
                  <div className="flex flex-wrap gap-1.5">
                    <ActionButton label={t("edit")} method="PATCH" endpoint={`/admin/faqs/${faq.id}`} fields={faqFields(group.id, faq)} />
                    <ActionButton label={faq.isPublished ? t("unpublish") : t("publish")} method="PATCH" endpoint={`/admin/faqs/${faq.id}`} body={{ isPublished: !faq.isPublished }} />
                    <ActionButton label={t("delete")} tone="danger" method="DELETE" endpoint={`/admin/faqs/${faq.id}`} confirm={t("confirmDelete")} />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">{t("noQuestions")}</p>
          )}
        </AdminSection>
      ))}
    </>
  );
}
