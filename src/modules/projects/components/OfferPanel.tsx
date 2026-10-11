"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { StatusPill } from "@/components/ui/StatusPill";
import { outlinedPanelClasses, sectionTitleClasses } from "@/components/ui/styles";
import { TextArea } from "@/components/ui/TextArea";
import { Link, useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError, FieldErrors } from "@/lib/api/errors";
import type { Paginated, Project, Proposal, Team } from "@/lib/api/types";
import { formatAmount } from "@/lib/format";
import { PROPOSAL_STATUS_TONE } from "../lib/status";

type OfferForm = { amount: string; deliveryDays: string; message: string; teamId: string };

const PROFILE_CODES = ["profile_required", "profile_type_mismatch"];

function formFrom(proposal?: Proposal | null): OfferForm {
  return {
    amount: proposal ? String(proposal.amount) : "",
    deliveryDays: proposal ? String(proposal.deliveryDays) : "",
    message: proposal?.message ?? "",
    teamId: proposal?.team ? String(proposal.team.id) : "",
  };
}

export function OfferPanel({ project }: { project: Project }) {
  const t = useTranslations("Projects.offer");
  const locale = useLocale();
  const router = useRouter();
  const mine = project.myProposal ?? null;
  const [editing, setEditing] = useState(!mine);
  const [form, setForm] = useState<OfferForm>(formFrom(mine));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const currency = project.budget.currency;

  useEffect(() => {
    if (project.type !== "project") return;
    api<Paginated<Team>>("/teams")
      .then((result) => setTeams(result.data.filter((team) => team.status === "active" && team.myMembership?.isLead)))
      .catch(() => setTeams([]));
  }, [project.type]);

  const update = (key: keyof OfferForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const run = async (action: () => Promise<unknown>) => {
    setSaving(true);
    setError(null);
    try {
      await action();
      setEditing(false);
      router.refresh();
    } catch (caught) {
      const apiError = caught as ApiError;
      setErrors(apiError.fields);
      setError({ message: apiError.message || t("failed"), code: apiError.code });
    } finally {
      setSaving(false);
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const body = {
      amount: Number(form.amount),
      deliveryDays: Number(form.deliveryDays),
      message: form.message.trim(),
      ...(form.teamId ? { teamId: Number(form.teamId) } : {}),
    };
    run(() =>
      mine
        ? api(`/proposals/${mine.id}`, { method: "PATCH", body })
        : api(`/projects/${project.id}/proposals`, { method: "POST", body }),
    );
  };

  if (mine && !editing) {
    return (
      <div className={`${outlinedPanelClasses} flex flex-col gap-3`}>
        <div className="flex items-center justify-between gap-3">
          <h2 className={sectionTitleClasses}>{t("yours")}</h2>
          <StatusPill tone={PROPOSAL_STATUS_TONE[mine.status]}>{t(`status.${mine.status}`)}</StatusPill>
        </div>
        <p className="text-2xl font-bold text-brand">{formatAmount(mine.amount, mine.currency, locale)}</p>
        <p className="text-sm text-muted">{t("deliveryIn", { count: mine.deliveryDays })}</p>
        {mine.team && <p className="text-sm">{t("asTeam", { name: mine.team.name })}</p>}
        <p className="text-sm whitespace-pre-line">{mine.message}</p>
        {error && <p className="text-sm text-danger">{error.message}</p>}
        {mine.status === "pending" && (
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" pill onClick={() => setEditing(true)}>
              {t("edit")}
            </Button>
            <Button
              variant="ghost"
              pill
              className="text-danger"
              loading={saving}
              onClick={() => run(() => api(`/proposals/${mine.id}/withdraw`, { method: "POST" }))}
            >
              {t("withdraw")}
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (project.status !== "open") {
    return <p className={`${outlinedPanelClasses} text-sm text-muted`}>{t("closed")}</p>;
  }

  return (
    <form onSubmit={submit} noValidate className={`${outlinedPanelClasses} flex flex-col gap-4`}>
      <h2 className={sectionTitleClasses}>{t(mine ? "editTitle" : "title")}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t("amount", { currency })}
          required
          type="number"
          min={1}
          step="0.01"
          value={form.amount}
          error={errors.amount}
          hint={t("budgetHint", {
            min: formatAmount(project.budget.min, currency, locale),
            max: formatAmount(project.budget.max, currency, locale),
          })}
          onChange={(event) => update("amount", event.target.value)}
        />
        <Field
          label={t("days")}
          required
          type="number"
          min={1}
          max={365}
          value={form.deliveryDays}
          error={errors.deliveryDays}
          onChange={(event) => update("deliveryDays", event.target.value)}
        />
      </div>
      {teams.length > 0 && (
        <Select
          label={t("team")}
          value={form.teamId}
          error={errors.teamId}
          options={[{ value: "", label: t("alone") }, ...teams.map((team) => ({ value: String(team.id), label: team.name }))]}
          onChange={(event) => update("teamId", event.target.value)}
        />
      )}
      <TextArea
        label={t("message")}
        required
        rows={5}
        maxLength={3000}
        placeholder={t("messagePlaceholder")}
        value={form.message}
        error={errors.message}
        onChange={(event) => update("message", event.target.value)}
      />
      {error && (
        <p role="alert" className="rounded-lg bg-danger-soft p-3 text-sm text-danger">
          {error.message}{" "}
          {error.code && PROFILE_CODES.includes(error.code) && (
            <Link href="/profile" className="font-bold underline">
              {t("goToProfile")}
            </Link>
          )}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="solid" pill loading={saving}>
          {t(mine ? "save" : "send")}
        </Button>
        {mine && (
          <Button variant="ghost" pill onClick={() => setEditing(false)}>
            {t("cancel")}
          </Button>
        )}
      </div>
    </form>
  );
}
