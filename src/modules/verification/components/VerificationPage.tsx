"use client";

import { CircleCheck, CircleDashed, Clock, CircleX } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { StatusPill, type StatusTone } from "@/components/ui/StatusPill";
import { Link } from "@/i18n/navigation";
import type { KycStatus, KycSubmission, User } from "@/lib/api/types";
import { SettingsPanel } from "@/modules/settings";
import { KycForm } from "./KycForm";

type Check = { key: string; done: boolean; tone: StatusTone; label: string; href?: string };

const ICONS = { success: CircleCheck, warning: Clock, danger: CircleX, muted: CircleDashed } as const;

type VerificationPageProps = { user: User; kyc: { status: KycStatus; submission: KycSubmission | null }; hasPaymentMethod: boolean };

export function VerificationPage({ user, kyc: initial, hasPaymentMethod }: VerificationPageProps) {
  const t = useTranslations("Verification");
  const format = useFormatter();
  const [kyc, setKyc] = useState(initial);

  const identityTone: StatusTone = { none: "muted", pending: "warning", approved: "success", rejected: "danger" }[kyc.status] as StatusTone;
  const checks: Check[] = [
    { key: "email", done: Boolean(user.emailVerifiedAt), tone: user.emailVerifiedAt ? "success" : "muted", label: user.emailVerifiedAt ? t("verified") : t("notVerified") },
    { key: "phone", done: Boolean(user.phoneVerifiedAt), tone: user.phoneVerifiedAt ? "success" : "muted", label: user.phoneVerifiedAt ? t("verified") : t("notVerified") },
    { key: "identity", done: kyc.status === "approved", tone: identityTone, label: t(`kycStatus.${kyc.status}`) },
    { key: "payment", done: hasPaymentMethod, tone: hasPaymentMethod ? "success" : "muted", label: hasPaymentMethod ? t("added") : t("notAdded"), href: "/settings/payment" },
  ];
  const score = checks.filter((check) => check.done).length;

  return (
    <div className="flex flex-col gap-6">
      <SettingsPanel title={t("title")} subtitle={t("subtitle")}>
        <div className="flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={checks.length} aria-label={t("level")}>
            <div className="h-full rounded-full bg-brand" style={{ width: `${(score / checks.length) * 100}%` }} />
          </div>
          <span className="text-sm font-bold text-brand">{t("score", { score, total: checks.length })}</span>
        </div>
        <ul className="flex flex-col divide-y divide-border">
          {checks.map((check) => {
            const Icon = ICONS[check.tone as keyof typeof ICONS];
            return (
              <li key={check.key} className="flex flex-wrap items-center gap-3 py-3">
                <Icon className={`size-5 shrink-0 ${check.done ? "text-brand" : check.tone === "danger" ? "text-danger" : check.tone === "warning" ? "text-orange" : "text-placeholder"}`} aria-hidden />
                <span className="me-auto">
                  <span className="block text-sm font-medium">{t(`checks.${check.key}.title`)}</span>
                  <span className="block text-xs text-muted">{t(`checks.${check.key}.text`)}</span>
                </span>
                {check.href && !check.done && (
                  <Link href={check.href} className="text-xs font-bold text-brand hover:underline">
                    {t("add")}
                  </Link>
                )}
                <StatusPill tone={check.tone}>{check.label}</StatusPill>
              </li>
            );
          })}
        </ul>
      </SettingsPanel>

      <SettingsPanel title={t("identity.title")} subtitle={t("identity.subtitle")}>
        {kyc.status === "approved" && <p className="rounded-lg bg-brand-soft p-4 text-sm text-brand">{t("identity.approved")}</p>}
        {kyc.status === "pending" && kyc.submission && (
          <div className="flex flex-col gap-1 rounded-lg bg-orange/10 p-4 text-sm">
            <p className="font-bold text-orange">{t("identity.pending")}</p>
            <p className="text-muted">
              {t("identity.submitted", {
                document: t(`form.documents.${kyc.submission.documentType}`),
                number: kyc.submission.documentNumber,
                date: format.dateTime(new Date(kyc.submission.submittedAt), { dateStyle: "medium" }),
              })}
            </p>
          </div>
        )}
        {kyc.status === "rejected" && kyc.submission?.rejectionReason && (
          <div role="alert" className="rounded-lg border border-danger/40 bg-danger-soft p-4 text-sm">
            <p className="font-bold text-danger">{t("identity.rejected")}</p>
            <p>{kyc.submission.rejectionReason}</p>
          </div>
        )}
        {(kyc.status === "none" || kyc.status === "rejected") && (
          <KycForm defaultName={user.fullName} onSubmitted={(submission) => setKyc({ status: "pending", submission })} />
        )}
      </SettingsPanel>
    </div>
  );
}
