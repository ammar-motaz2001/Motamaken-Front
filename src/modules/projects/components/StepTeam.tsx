"use client";

import { CircleAlert, CircleCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { ROLES, SHARE_OPTIONS, SHARE_STEP } from "../lib/data";
import { formatMoney, shareAmount } from "../lib/format";
import { totalShare } from "../lib/validation";
import type { RoleKey, TeamMember } from "../types";
import { Avatar } from "./Avatar";
import { ShareStepper } from "./ShareStepper";
import { hintClasses, outlinedPanelClasses, sectionTitleClasses, softSuccessClasses, softWarningClasses } from "./styles";
import { useMemberName } from "./useMemberName";

type StepTeamProps = {
  members: TeamMember[];
  total: number;
  onChange: (members: TeamMember[]) => void;
};

const STATUS_CLASSES = {
  owner: "text-brand",
  accepted: "text-brand",
  pending: "text-orange-light",
};

export function StepTeam({ members, total, onChange }: StepTeamProps) {
  const t = useTranslations("Projects.team");
  const memberName = useMemberName();
  const [reminded, setReminded] = useState(false);
  const sum = totalShare(members);
  const pending = members.filter((member) => member.status === "pending").length;

  const updateShare = (id: string, share: number) =>
    onChange(members.map((member) => (member.id === id ? { ...member, share } : member)));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={sectionTitleClasses}>{t("heading")}</h2>
          <p className={hintClasses}>{t("hint")}</p>
        </div>
        <a href="#invite-member" className="rounded-full bg-brand px-4 py-1.5 text-sm font-medium text-white hover:opacity-90">
          {t("invite")}
        </a>
      </div>

      <div
        className={`flex flex-wrap items-center justify-between gap-4 p-4 ${sum === 100 ? softSuccessClasses : softWarningClasses}`}
      >
        <div className="flex items-start gap-2">
          {sum === 100 ? (
            <CircleCheck size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden />
          ) : (
            <CircleAlert size={18} className="mt-0.5 shrink-0 text-orange" aria-hidden />
          )}
          <div>
            <p className={`font-bold ${sum === 100 ? "text-brand" : "text-orange"}`}>
              {t(sum === 100 ? "sumReady" : "sumInvalid", { total: sum })}
            </p>
            <p className="text-xs text-muted">{t("sumHint")}</p>
          </div>
        </div>
        <div dir="ltr" className="flex w-full items-center gap-3 sm:w-64">
          <span className="h-2 flex-1 overflow-hidden rounded-full bg-border">
            <span
              className={`block h-full rounded-full ${sum === 100 ? "bg-brand" : "bg-orange"}`}
              style={{ width: `${Math.min(sum, 100)}%` }}
            />
          </span>
          <span className="text-sm font-bold">{sum}%</span>
        </div>
      </div>

      {pending > 0 && (
        <div className={`${softWarningClasses} flex flex-wrap items-center justify-between gap-3 p-4`}>
          <div className="flex items-start gap-2">
            <CircleAlert size={18} className="mt-0.5 shrink-0 text-orange" aria-hidden />
            <div>
              <p className="font-bold text-orange">{t("pendingTitle", { count: pending })}</p>
              <p className="text-xs text-muted">{t("pendingHint")}</p>
            </div>
          </div>
          <Button variant="ghost" pill font="button" disabled={reminded} onClick={() => setReminded(true)}>
            {reminded ? t("reminded") : t("remind")}
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-sm">
          <thead>
            <tr className="bg-surface-muted text-start text-xs text-muted">
              <th className="rounded-s-md px-4 py-3 text-start font-medium">{t("columns.member")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("columns.role")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("columns.share")}</th>
              <th className="px-4 py-3 text-start font-medium">{t("columns.amount", { total: formatMoney(total) })}</th>
              <th className="px-4 py-3 text-start font-medium">{t("columns.status")}</th>
              <th className="rounded-e-md px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {members.map((member) => {
              const name = memberName(member);
              return (
                <tr key={member.id} className="[&>td]:border-y [&>td]:border-border [&>td]:bg-surface">
                  <td className="rounded-s-lg border-s px-4 py-3">
                    <span className="flex items-center gap-2 font-bold">
                      <Avatar name={name} tone={member.status === "owner" ? "brand" : "orange"} />
                      {name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted">{t(`roles.${member.role}`)}</td>
                  <td className="px-4 py-3">
                    <ShareStepper
                      label={t("columns.share")}
                      value={member.share}
                      step={SHARE_STEP}
                      onChange={(share) => updateShare(member.id, share)}
                    />
                  </td>
                  <td dir="ltr" className="px-4 py-3 text-start font-bold text-brand rtl:text-right">
                    {formatMoney(shareAmount(total, member.share))}
                  </td>
                  <td className={`px-4 py-3 ${STATUS_CLASSES[member.status]}`}>{t(`status.${member.status}`)}</td>
                  <td className="rounded-e-lg border-e px-4 py-3 text-end">
                    {member.status === "owner" ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <button
                        type="button"
                        className="text-danger hover:underline"
                        onClick={() => onChange(members.filter((item) => item.id !== member.id))}
                      >
                        {t("remove")}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <SplitRules />
        <InviteMemberForm onInvite={(member) => onChange([...members, member])} />
      </div>
    </div>
  );
}

function SplitRules() {
  const t = useTranslations("Projects.team");
  const rules = t.raw("rules") as string[];

  return (
    <div className={outlinedPanelClasses}>
      <h3 className="mb-3 font-bold">{t("rulesTitle")}</h3>
      <ul className="flex flex-col gap-2.5">
        {rules.map((rule) => (
          <li key={rule} className="flex items-start gap-2 text-sm">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
            {rule}
          </li>
        ))}
      </ul>
    </div>
  );
}

function InviteMemberForm({ onInvite }: { onInvite: (member: TeamMember) => void }) {
  const t = useTranslations("Projects.team");
  const [user, setUser] = useState("");
  const [role, setRole] = useState<RoleKey | "">("");
  const [share, setShare] = useState("10");
  const [errors, setErrors] = useState<{ user?: string; role?: string }>({});

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = {
      user: user.trim() ? undefined : t("inviteUserRequired"),
      role: role ? undefined : t("inviteRoleRequired"),
    };
    setErrors(nextErrors);
    if (nextErrors.user || nextErrors.role) return;
    onInvite({ id: crypto.randomUUID(), name: user.trim(), role: role as RoleKey, share: Number(share), status: "pending" });
    setUser("");
    setRole("");
    setShare("10");
  };

  return (
    <form id="invite-member" onSubmit={onSubmit} noValidate className={`${outlinedPanelClasses} flex flex-col gap-4`}>
      <h3 className="font-bold">{t("inviteTitle")}</h3>
      <Field
        label={t("inviteUser")}
        placeholder={t("inviteUserPlaceholder")}
        value={user}
        error={errors.user}
        onChange={(event) => {
          setUser(event.target.value);
          setErrors((current) => ({ ...current, user: undefined }));
        }}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label={t("inviteRole")}
          placeholder={t("inviteRolePlaceholder")}
          value={role}
          error={errors.role}
          options={ROLES.filter((item) => item !== "lead").map((item) => ({ value: item, label: t(`roles.${item}`) }))}
          onChange={(event) => {
            setRole(event.target.value as RoleKey);
            setErrors((current) => ({ ...current, role: undefined }));
          }}
        />
        <Select
          label={t("inviteShare")}
          value={share}
          options={SHARE_OPTIONS.map((value) => ({ value: String(value), label: `${value}%` }))}
          onChange={(event) => setShare(event.target.value)}
        />
      </div>
      <div className="flex flex-col items-start gap-2">
        <Button type="submit" variant="solid" pill font="button">
          {t("send")}
        </Button>
        <p className="text-xs text-muted">{t("inviteNote")}</p>
      </div>
    </form>
  );
}
