import { Gift } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { panelClasses } from "@/components/ui/styles";
import { UserAvatar } from "@/components/ui/UserAvatar";
import type { Draw, DrawHistoryItem } from "@/lib/api/types";
import { DrawPanel } from "./DrawPanel";

/** Gifts page: the current draw (or a note that none is running), how it works step by step, and past draws. */
export async function GiftsPage({ draw, history, signedIn }: { draw: Draw | null; history: DrawHistoryItem[]; signedIn: boolean }) {
  const t = await getTranslations("Rewards.draw");
  const format = await getFormatter();

  return (
    <div className="flex flex-col gap-6">
      <section className={`${panelClasses} flex flex-col gap-5`}>
        <PageHeader crumbs={[{ label: t("home"), href: "/" }, { label: t("title") }]} title={draw?.title ?? t("title")} subtitle={t("subtitle")} />
        {draw ? (
          <DrawPanel initial={draw} signedIn={signedIn} />
        ) : (
          <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted">
            <Gift className="size-12 text-placeholder" strokeWidth={1.2} aria-hidden />
            {t("noDraw")}
          </div>
        )}
      </section>

      <section className={`${panelClasses} flex flex-col gap-4`}>
        <h2 className="text-lg font-bold">{t("howItWorks")}</h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {(["earn", "buy", "wait", "draw", "claim"] as const).map((step, index) => (
            <li key={step} className="flex flex-col gap-1.5 rounded-xl border border-border p-3 text-sm">
              <span className="flex size-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">{index + 1}</span>
              <span className="font-bold">{t(`steps.${step}.title`)}</span>
              <span className="text-xs text-muted">{t(`steps.${step}.text`)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className={`${panelClasses} flex flex-col gap-4`}>
        <h2 className="text-lg font-bold">{t("history")}</h2>
        {history.length ? (
          <ul className="flex flex-col gap-3">
            {history.map((item) => (
              <li key={item.id} className="flex flex-col gap-2 rounded-xl border border-border p-4">
                <div className="flex flex-wrap justify-between gap-2 text-sm">
                  <span className="font-bold">{item.title}</span>
                  <span className="text-xs text-muted">
                    {format.dateTime(new Date(item.drawnAt), { dateStyle: "medium" })} · {t("historyStats", { players: item.players, tickets: item.tickets })}
                  </span>
                </div>
                <ul className="flex flex-wrap gap-4">
                  {item.winners.map((winner) => (
                    <li key={winner.rank} className="flex items-center gap-2 text-sm">
                      <UserAvatar name={winner.user.fullName} src={winner.user.avatarUrl} size={28} />
                      <span>
                        <span className="block font-medium">{winner.user.fullName}</span>
                        <span className="block text-xs text-muted">
                          {t("rank", { rank: winner.rank })} · {winner.prize.name}
                        </span>
                      </span>
                    </li>
                  ))}
                  {!item.winners.length && <li className="text-sm text-muted">{t("noWinners")}</li>}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{t("noHistory")}</p>
        )}
      </section>
    </div>
  );
}
