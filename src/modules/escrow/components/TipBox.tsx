"use client";

import { HandHeart } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { api } from "@/lib/api/client";
import type { Escrow } from "@/lib/api/types";
import { PayModal } from "@/modules/payments";
import { useMoney } from "../lib/useMoney";

const PRESETS = [5, 10, 15];

/** After completion, the client can tip the freelancer or team a percentage or a custom amount (POST .../escrow/tip). */
export function TipBox({ escrow, canTip, onChanged }: { escrow: Escrow; canTip: boolean; onChanged: () => Promise<void> }) {
  const t = useTranslations("Escrow.tip");
  const format = useFormatter();
  const money = useMoney(escrow.currency);
  const [percent, setPercent] = useState<number | null>(10);
  const [custom, setCustom] = useState("");
  const [note, setNote] = useState("");
  const [paying, setPaying] = useState(false);
  const amount = percent ? Math.round(escrow.totals.total * percent) / 100 : Number(custom) || 0;
  const freelancer = escrow.payees.length === 1 ? escrow.payees[0].fullName : t("team");

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-brand/40 bg-brand-soft/40 p-4">
      <div className="flex items-start gap-3">
        <HandHeart className="size-8 shrink-0 text-brand" strokeWidth={1.4} aria-hidden />
        <div>
          <h3 className="text-base font-bold">{t("title")}</h3>
          <p className="text-sm text-muted">{t("intro", { name: freelancer })}</p>
        </div>
      </div>

      {canTip && (
        <>
          <div role="radiogroup" aria-label={t("title")} className="flex flex-wrap items-center gap-2">
            {PRESETS.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={percent === value}
                onClick={() => (setPercent(value), setCustom(""))}
                className={`rounded-full border px-4 py-1.5 text-sm font-bold ${percent === value ? "border-brand bg-brand text-white" : "border-border bg-surface"}`}
              >
                {value}%
              </button>
            ))}
            <Field
              aria-label={t("custom")}
              placeholder={t("custom")}
              type="number"
              min={0}
              step="0.01"
              dir="ltr"
              value={custom}
              className="max-w-[160px]"
              onChange={(event) => (setCustom(event.target.value), setPercent(null))}
            />
          </div>
          <Field label={t("note")} placeholder={t("notePlaceholder")} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} />
          <dl className="grid grid-cols-3 gap-3 text-center text-sm">
            {[
              [t("amount"), money(amount)],
              [t("fee"), money(0)],
              [t("receives"), money(amount)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-surface p-3">
                <dt className="text-xs text-muted">{label}</dt>
                <dd dir="ltr" className="font-bold text-brand">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
          <Button variant="solid" font="button" disabled={amount <= 0} onClick={() => setPaying(true)} className="self-start">
            {t("send")}
          </Button>
        </>
      )}

      {escrow.tips.length > 0 && (
        <ul className="flex flex-col gap-1 text-sm">
          {escrow.tips.map((tip) => (
            <li key={tip.id} className="flex justify-between gap-3">
              <span>
                {t("sent", { amount: money(tip.amount) })} {tip.note && <span className="text-muted">— {tip.note}</span>}
              </span>
              <span className="text-xs text-muted">{format.dateTime(new Date(tip.createdAt), { dateStyle: "medium" })}</span>
            </li>
          ))}
        </ul>
      )}

      {paying && (
        <PayModal
          open
          onClose={() => (setPaying(false), void onChanged())}
          amount={amount}
          currency={escrow.currency}
          feedbackContext="escrow"
          rows={[
            { label: t("for"), value: freelancer },
            { label: t("fee"), value: <span dir="ltr">{money(0)}</span> },
          ]}
          pay={async () => {
            await api(`/projects/${escrow.projectId}/escrow/tip`, { method: "POST", body: { amount, note: note.trim() || null } });
            return escrow.id;
          }}
          success={{
            message: t("success", { amount: money(amount), name: freelancer }),
            actions: (done) => (
              <Button variant="solid" font="button" onClick={done}>
                {t("close")}
              </Button>
            ),
          }}
          errorActions={(dismiss, retry) => (
            <>
              <Button variant="outlineOrange" font="button" onClick={dismiss}>
                {t("close")}
              </Button>
              <Button variant="orange" font="button" onClick={retry}>
                {t("tryAgain")}
              </Button>
            </>
          )}
        />
      )}
    </section>
  );
}
