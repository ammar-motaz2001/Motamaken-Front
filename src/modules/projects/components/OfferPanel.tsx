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
import type { Paginated, Profile, Project, Proposal, Team } from "@/lib/api/types";
import { useAuthGate } from "@/components/providers/AuthGateProvider";
import { useDraft } from "@/lib/draft";
import { formatAmount } from "@/lib/format";
import { PROPOSAL_STATUS_TONE } from "../lib/status";

type OfferForm = { amount: string; deliveryDays: string; message: string; teamId: string; jobTitle: string };

const PROFILE_CODES = ["profile_required", "profile_type_mismatch"];

/** My profile, or null when I have none yet (the API answers 404). */
async function loadMyProfile() {
  try {
    return (await api<{ data: Profile | null }>("/me/profile")).data;
  } catch (caught) {
    if ((caught as ApiError).status === 404) return null;
    throw caught;
  }
}

/** Offer form values from an existing proposal, or empty for a new offer. */
function formFrom(proposal?: Proposal | null): OfferForm {
  return {
    amount: proposal ? String(proposal.amount) : "",
    deliveryDays: proposal ? String(proposal.deliveryDays) : "",
    message: proposal?.message ?? "",
    teamId: proposal?.team ? String(proposal.team.id) : "",
    jobTitle: "",
  };
}

/**
 * Send, edit or withdraw an offer on a project (alone or as a team). New offers are kept as a draft so guests can sign
 * up when sending; people without a profile give a job title and one is created.
 */
export function OfferPanel({ project }: { project: Project }) {
  const t = useTranslations("Projects.offer");
  const locale = useLocale();
  const router = useRouter();
  const { signedIn, requireAuth } = useAuthGate();
  const mine = project.myProposal ?? null;
  const [editing, setEditing] = useState(!mine);
  // A new offer is kept as a draft, so a guest can write it all and sign up only when sending it.
  const [form, setForm, clearDraft] = useDraft<OfferForm>(mine ? null : `offer-${project.id}`, formFrom(mine));
  // Offers need a profile of the right kind; people without one give a job title here and it is created with the offer.
  const profileType = project.type === "project" ? "freelancer" : "influencer";
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const askJobTitle = !mine && hasProfile !== true;
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const currency = project.budget.currency;

  useEffect(() => {
    if (!signedIn) return;
    loadMyProfile()
      .then((profile) => setHasProfile(Boolean(profile)))
      .catch(() => setHasProfile(null));
  }, [signedIn]);

  useEffect(() => {
    if (project.type !== "project" || !signedIn) return;
    api<Paginated<Team>>("/teams")
      .then((result) => setTeams(result.data.filter((team) => team.status === "active" && team.myMembership?.isLead)))
      .catch(() => setTeams([]));
  }, [project.type, signedIn]);

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

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found: FieldErrors = {};
    if (!(Number(form.amount) > 0)) found.amount = t("required");
    if (!(Number(form.deliveryDays) >= 1)) found.deliveryDays = t("required");
    if (form.message.trim().length < 10) found.message = t("messageTooShort");
    if (askJobTitle && form.jobTitle.trim().length < 2) found.jobTitle = t("jobTitleRequired");
    setErrors(found);
    if (Object.keys(found).length) return;
    // The deciding moment: a guest confirms an email or phone here, then the offer is sent as written.
    if (!(await requireAuth(t("signUpReason")))) return;

    const body = {
      amount: Number(form.amount),
      deliveryDays: Number(form.deliveryDays),
      message: form.message.trim(),
      ...(form.teamId ? { teamId: Number(form.teamId) } : {}),
    };
    run(async () => {
      if (mine) return api(`/proposals/${mine.id}`, { method: "PATCH", body });
      const profile = await loadMyProfile();
      if (!profile) await api("/me/profile", { method: "PUT", body: { type: profileType, jobTitle: form.jobTitle.trim() } });
      await api(`/projects/${project.id}/proposals`, { method: "POST", body });
      clearDraft();
    });
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
      {askJobTitle && (
        <Field
          label={t("jobTitle")}
          required
          placeholder={t("jobTitlePlaceholder")}
          hint={t(signedIn ? "jobTitleHint" : "jobTitleGuestHint")}
          value={form.jobTitle}
          error={errors.jobTitle}
          onChange={(event) => update("jobTitle", event.target.value)}
        />
      )}
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
        hint={t("messageHint", { count: form.message.trim().length })}
        hintTone={form.message.trim().length < 10 ? "danger" : "success"}
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
