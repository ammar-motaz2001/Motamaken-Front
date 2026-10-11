"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

function parts(target: number, now: number) {
  const seconds = Math.max(0, Math.floor((target - now) / 1000));
  return { days: Math.floor(seconds / 86400), hours: Math.floor((seconds % 86400) / 3600), minutes: Math.floor((seconds % 3600) / 60), seconds: seconds % 60 };
}

export function Countdown({ to }: { to: string }) {
  const t = useTranslations("Rewards.countdown");
  const target = new Date(to).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 1000);
    return () => (clearTimeout(first), clearInterval(timer));
  }, []);

  const value = parts(target, now ?? target);

  return (
    <div className="flex items-center justify-center gap-1.5" dir="ltr" role="timer" aria-label={t("label", value)}>
      {(["days", "hours", "minutes", "seconds"] as const).map((unit, index) => (
        <span key={unit} className="flex items-center gap-1.5">
          {index > 0 && <span className="text-xl font-bold text-brand">:</span>}
          <span className="flex flex-col items-center">
            <span className="min-w-12 rounded-lg bg-surface px-2 py-1.5 text-center text-2xl font-bold tabular-nums shadow-card">
              {now === null ? "--" : String(value[unit]).padStart(2, "0")}
            </span>
            <span className="mt-1 text-[10px] text-muted">{t(unit)}</span>
          </span>
        </span>
      ))}
    </div>
  );
}
