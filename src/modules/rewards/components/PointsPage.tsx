import { CircleCheck, Coins, Gift } from "lucide-react";
import { getFormatter, getTranslations } from "next-intl/server";
import { Pagination } from "@/components/ui/Pagination";
import { Link } from "@/i18n/navigation";
import type { Draw, PointsSummary } from "@/lib/api/types";
import { SettingsPanel } from "@/modules/settings";
import { Countdown } from "./Countdown";
import { buttonClasses } from "@/components/ui/Button";

/** Points screen: current balance, ways to earn, the movement history and the current draw to spend points on. */
export async function PointsPage({ summary, draw }: { summary: PointsSummary; draw: Draw | null }) {
  const t = await getTranslations("Rewards.points");
  const format = await getFormatter();

  return (
    <div className="flex flex-col gap-6">
      <SettingsPanel title={t("title")} subtitle={t("subtitle")}>
        <div className="flex items-center gap-4 rounded-xl bg-gradient-brand p-5 text-white">
          <Coins className="size-12 shrink-0" strokeWidth={1.4} aria-hidden />
          <div>
            <p className="text-sm opacity-90">{t("balance")}</p>
            <p className="text-3xl font-bold">{format.number(summary.balance)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-bold">{t("howToEarn")}</h3>
          <ul className="flex flex-col divide-y divide-border">
            {summary.earn
              .filter((rule) => rule.reason !== "promotion" || rule.points > 0)
              .map((rule) => {
                // One-time actions are crossed out once done; repeatable ones stay open and count how often they paid.
                const times = rule.times ?? (rule.done ? 1 : 0);
                const earned = rule.done || times > 0;
                return (
                  <li key={rule.reason} className="flex items-center gap-3 py-2 text-sm">
                    <CircleCheck className={`size-5 shrink-0 ${earned ? "text-brand" : "text-border"}`} aria-hidden />
                    <span className={`me-auto ${rule.done ? "text-muted line-through" : ""}`}>
                      {rule.label}
                      <span className="ms-1 text-xs text-muted">{rule.once ? t("once") : t("each")}</span>
                      {!rule.once && times > 0 && (
                        <span className="ms-2 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand-ink">{t("timesEarned", { count: times })}</span>
                      )}
                    </span>
                    <span className="font-bold text-brand">+{rule.points}</span>
                    {earned && <span className="sr-only">{t("done")}</span>}
                  </li>
                );
              })}
          </ul>
        </div>
      </SettingsPanel>

      {draw?.isOpen && (
        <section className="flex flex-col items-center gap-3 rounded-xl border border-brand/40 bg-brand-soft p-5 text-center">
          <Gift className="size-8 text-brand" aria-hidden />
          <p className="font-bold">{draw.title}</p>
          <p className="text-sm text-brand">{t("drawStartsIn")}</p>
          <Countdown to={draw.drawAt} />
          <Link href="/gifts" className={buttonClasses({ size: "sm", pill: true })}>
            {t("joinDraw", { cost: draw.ticketCost })}
          </Link>
        </section>
      )}

      <SettingsPanel title={t("history")}>
        {summary.data.length ? (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[420px] text-sm">
              <thead className="bg-surface-muted text-xs text-muted">
                <tr>
                  <th className="px-3 py-2.5 text-start font-medium">{t("date")}</th>
                  <th className="px-3 py-2.5 text-start font-medium">{t("reason")}</th>
                  <th className="px-3 py-2.5 text-end font-medium">{t("points")}</th>
                </tr>
              </thead>
              <tbody>
                {summary.data.map((row) => (
                  <tr key={row.id} className="border-t border-border">
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted">{format.dateTime(new Date(row.createdAt), { dateStyle: "medium" })}</td>
                    <td className="px-3 py-2.5">{row.label}</td>
                    <td dir="ltr" className={`px-3 py-2.5 text-end font-bold ${row.amount >= 0 ? "text-brand" : "text-danger"}`}>
                      {row.amount >= 0 ? `+${row.amount}` : row.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted">{t("empty")}</p>
        )}
        <Pagination page={summary.meta.current_page} lastPage={summary.meta.last_page} pathname="/settings/points" />
      </SettingsPanel>
    </div>
  );
}
