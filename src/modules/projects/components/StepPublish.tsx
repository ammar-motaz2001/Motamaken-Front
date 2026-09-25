import { useLocale, useTranslations } from "next-intl";
import { formatMoney, shareAmount } from "../lib/format";
import type { ProjectBudget, ProjectDetails, ProjectMode, TeamMember } from "../types";
import { hintClasses, outlinedPanelClasses, sectionTitleClasses } from "./styles";
import { useMemberName } from "./useMemberName";

type StepPublishProps = {
  mode: ProjectMode;
  details: ProjectDetails;
  budget: ProjectBudget;
  members: TeamMember[];
};

export function StepPublish({ mode, details, budget, members }: StepPublishProps) {
  const t = useTranslations("Projects");
  const locale = useLocale();
  const memberName = useMemberName();
  const amount = Number(budget.amount);

  const rows = [
    { label: t("publish.mode"), value: t(`modes.${mode}.title`) },
    { label: t("publish.title"), value: budget.title },
    {
      label: t("publish.category"),
      value: details.category ? `${t(`categories.${details.category}`)} · ${t(`subcategories.${details.subcategory}`)}` : "",
    },
    { label: t("publish.budget"), value: formatMoney(amount) },
    { label: t("publish.duration"), value: t("publish.days", { count: Number(budget.duration) }) },
    {
      label: t("publish.extras"),
      value: details.extras.length ? new Intl.ListFormat(locale).format(details.extras.map((extra) => t(`extrasOptions.${extra}`))) : t("publish.none"),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className={sectionTitleClasses}>{t("publish.heading")}</h2>
        <p className={hintClasses}>{t("publish.hint")}</p>
      </div>
      <dl className={`${outlinedPanelClasses} grid gap-x-8 gap-y-3 sm:grid-cols-[180px_1fr]`}>
        {rows.map((row) => (
          <div key={row.label} className="contents">
            <dt className="text-sm text-muted">{row.label}</dt>
            <dd className="font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
      {mode === "team" && (
        <div className={outlinedPanelClasses}>
          <h3 className="mb-3 font-bold">{t("publish.team")}</h3>
          <ul className="flex flex-col gap-2">
            {members.map((member) => (
              <li key={member.id} className="flex items-center justify-between gap-3 text-sm">
                <span>
                  {memberName(member)} · <span className="text-muted">{t(`team.roles.${member.role}`)}</span>
                </span>
                <span dir="ltr" className="font-bold text-brand">
                  {member.share}% · {formatMoney(shareAmount(amount, member.share))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {budget.description && (
        <p className="rounded-lg bg-surface-muted p-4 text-sm leading-relaxed whitespace-pre-line">{budget.description}</p>
      )}
    </div>
  );
}
