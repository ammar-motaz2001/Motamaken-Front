"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { StatusIcon } from "@/components/ui/StatusIcon";
import { INITIAL_MEMBERS, STEP_COUNT } from "../lib/data";
import {
  hasErrors,
  isTeamReady,
  validateBudget,
  validateDetails,
  type BudgetErrors,
  type DetailsErrors,
} from "../lib/validation";
import type { ProjectBudget, ProjectDetails, ProjectMode, StepKey, TeamMember } from "../types";
import { ConfirmModeModal } from "./ConfirmModeModal";
import { StepBudget } from "./StepBudget";
import { StepDetails } from "./StepDetails";
import { StepPublish } from "./StepPublish";
import { StepTeam } from "./StepTeam";
import { Stepper } from "./Stepper";
import { dividerClasses, panelClasses } from "./styles";

const STEPS: Record<ProjectMode, StepKey[]> = {
  individual: ["details", "budget", "publish"],
  team: ["details", "budget", "team", "publish"],
};

const INITIAL_DETAILS: ProjectDetails = { category: "", subcategory: "", extras: ["urgent"] };
const INITIAL_BUDGET: ProjectBudget = { title: "", description: "", amount: "3200", duration: "" };

export function ProjectWizard() {
  const t = useTranslations("Projects");
  const tb = useTranslations("Projects.budget");
  const [mode, setMode] = useState<ProjectMode>("individual");
  const [pendingMode, setPendingMode] = useState<ProjectMode | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [details, setDetails] = useState(INITIAL_DETAILS);
  const [detailsErrors, setDetailsErrors] = useState<DetailsErrors>({});
  const [budget, setBudget] = useState(INITIAL_BUDGET);
  const [budgetErrors, setBudgetErrors] = useState<BudgetErrors>({});
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [draftSaved, setDraftSaved] = useState(false);
  const [published, setPublished] = useState(false);

  const steps = STEPS[mode];
  const step = steps[stepIndex];
  const total = Number(budget.amount) || 0;
  const nextBlocked = step === "team" && !isTeamReady(members);

  const goTo = (index: number) => {
    setStepIndex(index);
    setDraftSaved(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const next = () => {
    if (step === "details") {
      const errors = validateDetails(details, tb("required"));
      setDetailsErrors(errors);
      if (hasErrors(errors)) return;
    }
    if (step === "budget") {
      const errors = validateBudget(budget, tb);
      setBudgetErrors(errors);
      if (hasErrors(errors)) return;
    }
    if (step === "publish") {
      setPublished(true);
      return;
    }
    goTo(stepIndex + 1);
  };

  if (published) {
    return (
      <section className={`${panelClasses} flex flex-col items-center gap-4 py-16 text-center`}>
        <StatusIcon type="success" size={96} />
        <h1 className="text-2xl font-bold text-brand">{t("publish.publishedTitle")}</h1>
        <p className="text-muted">{t("publish.publishedText")}</p>
        <Button href="/projects" variant="solid" pill>
          {t("publish.viewProjects")}
        </Button>
      </section>
    );
  }

  const nextLabel =
    step === "publish" ? t("actions.publish") : steps[stepIndex + 1] === "publish" ? t("actions.nextPublish") : t("actions.next");

  return (
    <section className={`${panelClasses} flex flex-col gap-6`}>
      <nav aria-label="Breadcrumb" className="text-xs text-muted">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-brand">
              {t("breadcrumb.home")}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>{t("breadcrumb.add")}</li>
          <li aria-hidden>/</li>
          <li className="font-bold text-foreground">{t("breadcrumb.newProject")}</li>
        </ol>
      </nav>

      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted">{t("subtitle")}</p>
      </div>

      <Stepper steps={steps} current={stepIndex} />

      <div className={`${dividerClasses} pt-6`}>
        {step === "details" && (
          <StepDetails
            details={details}
            errors={detailsErrors}
            mode={mode}
            onChange={(value) => {
              setDetails(value);
              setDetailsErrors({});
            }}
            onSelectMode={(value) => value !== mode && setPendingMode(value)}
          />
        )}
        {step === "budget" && (
          <StepBudget
            budget={budget}
            errors={budgetErrors}
            onChange={(value) => {
              setBudget(value);
              setBudgetErrors({});
            }}
          />
        )}
        {step === "team" && <StepTeam members={members} total={total} onChange={setMembers} />}
        {step === "publish" && <StepPublish mode={mode} details={details} budget={budget} members={members} />}
      </div>

      <div className={`${dividerClasses} flex flex-col gap-3 pt-5`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          {stepIndex === 0 ? (
            <Button variant="ghost" pill href="/">
              {t("actions.cancel")}
            </Button>
          ) : (
            <Button variant="ghost" pill onClick={() => goTo(stepIndex - 1)}>
              {t("actions.back")}
            </Button>
          )}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" pill onClick={() => setDraftSaved(true)}>
              {draftSaved ? t("draftSaved") : t("actions.saveDraft")}
            </Button>
            <Button variant="solid" pill onClick={next} disabled={nextBlocked}>
              {nextLabel}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted">
          {step === "team" ? t("team.footerNote") : t(`summary.${mode}`, { count: STEP_COUNT[mode] })}
        </p>
      </div>

      <ConfirmModeModal
        mode={pendingMode}
        onCancel={() => setPendingMode(null)}
        onConfirm={() => {
          if (pendingMode) setMode(pendingMode);
          setPendingMode(null);
        }}
      />
    </section>
  );
}
