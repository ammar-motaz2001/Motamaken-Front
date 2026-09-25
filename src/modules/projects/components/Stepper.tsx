import { Check } from "lucide-react";
import { useTranslations } from "next-intl";
import type { StepKey } from "../types";

export function Stepper({ steps, current }: { steps: StepKey[]; current: number }) {
  const t = useTranslations("Projects");

  return (
    <ol className="flex items-start">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step} className="relative flex flex-1 flex-col items-center gap-2 text-center">
            {index > 0 && (
              <span
                aria-hidden
                className={`absolute top-4 end-1/2 h-0.5 w-full -translate-y-1/2 ${index <= current ? "bg-brand" : "bg-border"}`}
              />
            )}
            <span
              className={`relative z-10 flex size-8 items-center justify-center rounded-full border-2 bg-surface text-xs font-medium ${
                done || active ? "border-brand text-brand" : "border-border text-muted"
              }`}
            >
              {done ? (
                <Check size={16} strokeWidth={2.5} aria-hidden />
              ) : active ? (
                <span className="size-3 rounded-full bg-brand" />
              ) : (
                String(index + 1).padStart(2, "0")
              )}
            </span>
            <span className={`text-xs sm:text-sm ${active ? "font-bold text-brand" : "text-muted"}`}>{t(`steps.${step}`)}</span>
            {active && index > 0 && <span className="-mt-1.5 text-[11px] text-orange">{t("stepCurrent")}</span>}
          </li>
        );
      })}
    </ol>
  );
}
