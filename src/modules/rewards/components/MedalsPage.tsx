import { getFormatter, getTranslations } from "next-intl/server";
import type { Medal } from "@/lib/api/types";
import { SettingsPanel } from "@/modules/settings";
import { MedalIcon } from "./MedalIcon";

/** Medals screen: the earned medals, then every medal with its award date or the progress towards it. */
export async function MedalsPage({ medals }: { medals: Medal[] }) {
  const t = await getTranslations("Rewards.medals");
  const format = await getFormatter();
  const earned = medals.filter((medal) => medal.earned);

  return (
    <SettingsPanel title={t("title")} subtitle={t("subtitle")}>
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-bold">{t("myMedals", { count: earned.length, total: medals.length })}</h3>
        {earned.length ? (
          <ul className="flex flex-wrap gap-2">
            {earned.map((medal) => (
              <li key={medal.code} title={medal.name}>
                <MedalIcon code={medal.code} size={44} />
                <span className="sr-only">{medal.name}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">{t("none")}</p>
        )}
      </div>

      <p className="text-sm text-muted">{t("explain")}</p>

      <ul className="grid gap-3 sm:grid-cols-2">
        {medals.map((medal) => (
          <li key={medal.code} className={`flex items-center gap-3 rounded-xl border p-3 ${medal.earned ? "border-brand/40 bg-brand-soft/40" : "border-border"}`}>
            <MedalIcon code={medal.code} muted={!medal.earned} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{medal.name}</p>
              <p className="text-xs text-muted">{medal.description}</p>
              {medal.earned ? (
                medal.awardedAt && (
                  <p className="mt-1 text-xs font-medium text-brand">{t("earnedOn", { date: format.dateTime(new Date(medal.awardedAt), { dateStyle: "medium" }) })}</p>
                )
              ) : (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuenow={medal.current} aria-valuemin={0} aria-valuemax={medal.target} aria-label={medal.name}>
                    <div className="h-full rounded-full bg-orange" style={{ width: `${(medal.current / medal.target) * 100}%` }} />
                  </div>
                  <span className="text-xs text-muted tabular-nums">
                    {medal.current}/{medal.target}
                  </span>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </SettingsPanel>
  );
}
