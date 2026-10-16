"use client";

import { Gift, Medal as MedalIcon, Minus, PartyPopper, Plus, Ticket } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { ResultModal } from "@/components/ui/ResultModal";
import { Link, useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { Draw, DrawPrize } from "@/lib/api/types";
import { useAuthGate } from "@/components/providers/AuthGateProvider";
import { Countdown } from "./Countdown";

const RANK_TONES = ["border-[#f5b301] bg-[#f5b301]/10", "border-[#9ca3af] bg-[#9ca3af]/10", "border-[#b45309] bg-[#b45309]/10"];
const ADDRESS = ["name", "phone", "address", "city", "country"] as const;

export function DrawPanel({ initial }: { initial: Draw; signedIn?: boolean }) {
  const t = useTranslations("Rewards.draw");
  const format = useFormatter();
  const router = useRouter();
  const { requireAuth } = useAuthGate();
  const [draw, setDraw] = useState(initial);
  const [tickets, setTickets] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [bought, setBought] = useState<number | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [address, setAddress] = useState<Record<string, string>>({});
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(false);

  const prize = (item: DrawPrize) =>
    item.kind === "cash" && item.value != null && item.currency ? format.number(item.value, { style: "currency", currency: item.currency }) : item.name;
  const cost = tickets * draw.ticketCost;
  const left = draw.maxTicketsPerUser ? draw.maxTicketsPerUser - (draw.me?.tickets ?? 0) : null;
  const won = draw.me?.won;

  const join = async () => {
    if (!(await requireAuth(t("signUpReason")))) return;
    setBusy(true);
    // Reload the draw as the new account sees it (their points and tickets).
    api<{ data: Draw }>("/draws/current")
      .then(({ data }) => setDraw(data))
      .catch(() => router.refresh())
      .finally(() => setBusy(false));
  };

  const buy = async () => {
    setBusy(true);
    setError(null);
    try {
      const { data } = await api<{ data: Draw }>(`/draws/${draw.id}/entries`, { method: "POST", body: { tickets } });
      setDraw(data);
      setBought(tickets);
      setTickets(1);
      router.refresh();
    } catch (caught) {
      const apiError = caught as ApiError;
      setError({ message: apiError.fields.tickets ?? apiError.message ?? t("failed"), code: apiError.code });
    } finally {
      setBusy(false);
    }
  };

  const claim = async (method: "wallet" | "delivery") => {
    if (!won) return;
    setBusy(true);
    setClaimError(null);
    try {
      await api(`/draw-winners/${won.id}/claim`, { method: "POST", body: { method, ...(method === "delivery" && { details: address }) } });
      setDraw({ ...draw, me: draw.me && { ...draw.me, won: { ...won, claimedAt: new Date().toISOString(), claimMethod: method } } });
      setClaiming(false);
      setClaimed(true);
    } catch (caught) {
      const apiError = caught as ApiError;
      setClaimError(Object.values(apiError.fields)[0] ?? apiError.message ?? t("failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="flex flex-col items-center justify-center gap-3 rounded-xl border border-brand/40 bg-brand-soft p-5 text-center">
          <p className="text-sm font-bold text-brand">{draw.isOpen ? t("timeLeft") : draw.status === "drawn" ? t("drawnOn") : t("startsSoon")}</p>
          {draw.status === "drawn" && draw.drawnAt ? (
            <p className="text-xl font-bold">{format.dateTime(new Date(draw.drawnAt), { dateStyle: "long" })}</p>
          ) : (
            <Countdown to={draw.isOpen ? draw.drawAt : draw.startsAt} />
          )}
          <p className="text-xs text-muted">{t("drawDate", { date: format.dateTime(new Date(draw.drawAt), { dateStyle: "medium", timeStyle: "short" }) })}</p>
        </section>

        <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-5">
          {draw.me ? (
            <>
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-xs text-muted">{t("yourPoints")}</p>
                  <p className="text-2xl font-bold text-brand">{t("pointsValue", { points: format.number(draw.me.points) })}</p>
                </div>
                <div className="text-end">
                  <p className="text-xs text-muted">{t("yourTickets")}</p>
                  <p className="text-2xl font-bold">{draw.me.tickets}</p>
                </div>
              </div>
              <div>
                <div className="mb-1 flex justify-between text-xs text-muted">
                  <span>{t("yourChance")}</span>
                  <span>{draw.me.chance}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                  <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${Math.min(100, draw.me.chance)}%` }} />
                </div>
              </div>
              {draw.isOpen && (left === null || left > 0) && (
                <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
                  <div className="flex items-center rounded-md border border-border">
                    <button type="button" aria-label={t("fewer")} onClick={() => setTickets((value) => Math.max(1, value - 1))} className="p-2 hover:text-brand">
                      <Minus className="size-4" />
                    </button>
                    <span className="w-10 text-center font-bold tabular-nums" aria-live="polite">
                      {tickets}
                    </span>
                    <button
                      type="button"
                      aria-label={t("more")}
                      onClick={() => setTickets((value) => (left === null ? value + 1 : Math.min(left, value + 1)))}
                      className="p-2 hover:text-brand"
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <Button variant="solid" font="button" loading={busy} disabled={cost > draw.me.points} onClick={buy}>
                    <Ticket className="size-4" />
                    {t("buy", { cost })}
                  </Button>
                </div>
              )}
              {draw.isOpen && left === 0 && <p className="text-sm text-muted">{t("maxReached")}</p>}
              {draw.isOpen && cost > draw.me.points && (
                <p className="text-sm text-orange">
                  {t.rich("notEnough", { link: (chunks) => <Link href="/settings/points" className="font-bold underline">{chunks}</Link> })}
                </p>
              )}
              {error && <p className="text-sm text-danger">{error.message}</p>}
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <p className="text-sm">{t("loginToPlay")}</p>
              <Button variant="solid" font="button" pill loading={busy} onClick={join}>
                {t("join")}
              </Button>
            </div>
          )}
        </section>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          [t("ticketCost"), t("pointsValue", { points: draw.ticketCost })],
          [t("totalTickets"), format.number(draw.totals.tickets)],
          [t("players"), format.number(draw.totals.players)],
          [t("limit"), draw.maxTicketsPerUser ?? t("noLimit")],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-lg border border-border p-3">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="font-bold">{value}</dd>
          </div>
        ))}
      </dl>

      {won && (
        <section className="flex flex-wrap items-center gap-4 rounded-xl border border-[#f5b301] bg-[#f5b301]/10 p-4">
          <PartyPopper className="size-10 text-[#b98700]" aria-hidden />
          <div className="me-auto">
            <p className="font-bold">{t("youWon", { rank: won.rank })}</p>
            <p className="text-sm">{prize(won.prize)}</p>
          </div>
          {won.claimedAt ? (
            <span className="text-sm font-medium text-brand">{t(won.claimMethod === "wallet" ? "claimedWallet" : "claimedDelivery")}</span>
          ) : (
            <Button variant="solid" font="button" onClick={() => setClaiming(true)}>
              {t("claim")}
            </Button>
          )}
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">{t("prizes")}</h2>
        <ul className="grid gap-3 sm:grid-cols-3">
          {draw.prizes.map((item, index) => (
            <li key={item.rank} className={`flex flex-col gap-2 rounded-xl border-2 p-4 ${RANK_TONES[index] ?? "border-border"}`}>
              <span className="flex items-center gap-1.5 text-sm font-bold">
                <MedalIcon className="size-4" aria-hidden />
                {t("rank", { rank: item.rank })}
              </span>
              <span className="flex h-24 items-center justify-center rounded-lg bg-surface">
                <Gift className="size-10 text-brand" strokeWidth={1.3} aria-hidden />
              </span>
              <span className="font-bold">{item.name}</span>
              {item.value != null && item.currency && (
                <span className="text-sm text-brand">{t("worth", { value: format.number(item.value, { style: "currency", currency: item.currency }) })}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <ResultModal open={bought !== null} onClose={() => setBought(null)} type="success" message={t("bought", { count: bought ?? 0 })}>
        <Button variant="solid" font="button" onClick={() => setBought(null)}>
          {t("close")}
        </Button>
      </ResultModal>

      <Modal open={claiming} onClose={() => setClaiming(false)} showClose title={t("claimTitle")}>
        {won && (
          <div className="flex w-full flex-col gap-4 text-start">
            <p className="rounded-lg bg-brand-soft p-3 text-center text-sm">
              {t("youWon", { rank: won.rank })} <strong>{prize(won.prize)}</strong>
            </p>
            {won.prize.kind === "cash" ? (
              <>
                <p className="text-sm">{t("claimCash")}</p>
                <Button variant="solid" font="button" loading={busy} onClick={() => claim("wallet")} className="self-center">
                  {t("toWallet")}
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm">{t("claimItem")}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ADDRESS.map((key) => (
                    <Field
                      key={key}
                      label={t(`address.${key}`)}
                      required
                      value={address[key] ?? ""}
                      className={key === "address" ? "sm:col-span-2" : ""}
                      onChange={(event) => setAddress((current) => ({ ...current, [key]: event.target.value }))}
                    />
                  ))}
                </div>
                <Button variant="solid" font="button" loading={busy} disabled={ADDRESS.some((key) => !address[key]?.trim())} onClick={() => claim("delivery")} className="self-center">
                  {t("ship")}
                </Button>
              </>
            )}
            {claimError && <p className="text-sm text-danger">{claimError}</p>}
          </div>
        )}
      </Modal>

      <ResultModal open={claimed} onClose={() => setClaimed(false)} type="success" message={t(draw.me?.won?.claimMethod === "wallet" ? "claimedWallet" : "claimedDelivery")}>
        <Button variant="solid" font="button" onClick={() => setClaimed(false)}>
          {t("close")}
        </Button>
      </ResultModal>
    </div>
  );
}
