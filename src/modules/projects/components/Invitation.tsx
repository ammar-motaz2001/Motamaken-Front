"use client";

import { CircleAlert, CircleCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DEMO_INVITATION } from "../lib/data";
import { formatMoney, shareAmount } from "../lib/format";
import { Avatar } from "./Avatar";
import { NegotiateModal } from "./NegotiateModal";
import { panelClasses, softSuccessClasses, softWarningClasses } from "./styles";
import { useMemberName } from "./useMemberName";

type Outcome = "accepted" | "declined" | "proposalSent" | null;

export function Invitation() {
  const t = useTranslations("Projects.invitation");
  const tt = useTranslations("Projects.team");
  const tp = useTranslations("Projects.people");
  const memberName = useMemberName();
  const [negotiating, setNegotiating] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>(null);
  const { inviter, role, share, total, team } = DEMO_INVITATION;
  const inviterName = tp(inviter);
  const otherShares = team.reduce((sum, member) => sum + member.share, 0);

  return (
    <section className={`${panelClasses} mx-auto flex w-full max-w-[640px] flex-col gap-5`}>
      <h1 className="text-xl font-bold">{t("title")}</h1>

      <div className="flex items-center gap-3">
        <Avatar name={inviterName} tone="brand" size={48} />
        <div>
          <p className="font-bold">{t("from", { name: inviterName })}</p>
          <p className="text-xs text-muted">{t("project")}</p>
        </div>
      </div>

      <div className={`${softSuccessClasses} flex flex-col gap-3 p-4`}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs text-muted">{t("offer")}</p>
            <p dir="ltr" className="text-4xl font-bold text-brand">
              {formatMoney(shareAmount(total, share))}
            </p>
          </div>
          <div className="text-end">
            <p className="text-xs text-muted">{t("shareOffered")}</p>
            <p className="text-4xl font-bold text-brand">{share}%</p>
          </div>
        </div>
        <p className="border-t border-brand/20 pt-3 text-xs leading-relaxed text-muted">
          {t("details", { role: tt(`roles.${role}`), total: formatMoney(total) })}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm font-bold">{t("restOfTeam")}</p>
        <ul className="flex flex-col gap-2">
          {team.map((member, index) => {
            const name = memberName(member);
            return (
              <li key={member.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex items-center gap-2">
                  <Avatar name={name} tone={index === 0 ? "brand" : "orange"} size={26} />
                  {name} · <span className="text-muted">{tt(`roles.${member.role}`)}</span>
                </span>
                <span className="font-bold">{member.share}%</span>
              </li>
            );
          })}
        </ul>
      </div>

      {outcome ? (
        <p
          role="status"
          className={`flex items-center gap-2 p-4 text-sm font-medium ${
            outcome === "declined" ? `${softWarningClasses} text-orange` : `${softSuccessClasses} text-brand`
          }`}
        >
          {outcome === "declined" ? <CircleAlert size={18} aria-hidden /> : <CircleCheck size={18} aria-hidden />}
          {t(outcome)}
        </p>
      ) : (
        <>
          <p className={`${softWarningClasses} flex items-start gap-2 p-3 text-sm text-orange`}>
            <CircleAlert size={16} className="mt-0.5 shrink-0" aria-hidden />
            {t("warning")}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline" pill onClick={() => setNegotiating(true)}>
              {t("negotiate")}
            </Button>
            <div className="flex flex-wrap gap-3">
              <Button variant="ghost" pill className="text-danger" onClick={() => setOutcome("declined")}>
                {t("decline")}
              </Button>
              <Button variant="solid" pill onClick={() => setOutcome("accepted")}>
                {t("accept")}
              </Button>
            </div>
          </div>
        </>
      )}

      <NegotiateModal
        open={negotiating}
        offered={share}
        otherShares={otherShares}
        total={total}
        onClose={() => setNegotiating(false)}
        onSubmit={() => {
          setNegotiating(false);
          setOutcome("proposalSent");
        }}
      />
    </section>
  );
}
