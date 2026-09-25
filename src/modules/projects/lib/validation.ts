import type { ProjectBudget, ProjectDetails, TeamMember } from "../types";

export type BudgetErrors = Partial<Record<keyof ProjectBudget, string>>;
export type DetailsErrors = Partial<Record<"category" | "subcategory", string>>;

type Translate = (key: string) => string;

export function validateDetails(details: ProjectDetails, required: string): DetailsErrors {
  return {
    category: details.category ? undefined : required,
    subcategory: details.subcategory ? undefined : required,
  };
}

export function validateBudget(budget: ProjectBudget, t: Translate): BudgetErrors {
  const amount = Number(budget.amount);
  const duration = Number(budget.duration);
  return {
    title: budget.title.trim() ? undefined : t("required"),
    description: budget.description.trim() ? undefined : t("required"),
    amount: !budget.amount ? t("required") : amount < 10 ? t("amountInvalid") : undefined,
    duration: !budget.duration ? t("required") : duration < 1 || duration > 365 ? t("durationInvalid") : undefined,
  };
}

export function totalShare(members: TeamMember[]) {
  return members.reduce((sum, member) => sum + member.share, 0);
}

export function isTeamReady(members: TeamMember[]) {
  return totalShare(members) === 100 && members.every((member) => member.status !== "pending");
}

export function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}
