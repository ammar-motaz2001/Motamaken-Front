import { CircleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { STEP_COUNT } from "../lib/data";
import type { ProjectMode } from "../types";

type ModeCardProps = {
  mode: ProjectMode;
  selected: boolean;
  onSelect: () => void;
};

export function ModeCard({ mode, selected, onSelect }: ModeCardProps) {
  const t = useTranslations(`Projects.modes.${mode}`);
  const points = t.raw("points") as string[];

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={`flex h-full flex-col gap-3 rounded-lg border p-4 text-start transition-colors ${
        selected ? "border-brand bg-brand/5 dark:bg-brand/10" : "border-border bg-surface hover:border-brand/50"
      }`}
    >
      <span className="flex w-full items-start justify-between gap-3 border-b border-border pb-3">
        <span className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 ${
              selected ? "border-brand" : "border-border"
            }`}
          >
            {selected && <span className="size-2.5 rounded-full bg-brand" />}
          </span>
          <span className="flex flex-col">
            <span className={`text-base font-bold ${selected ? "text-brand" : ""}`}>{t("title")}</span>
            <span className="text-xs text-muted">{t("subtitle")}</span>
          </span>
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs whitespace-nowrap ${
            selected ? "bg-brand text-white" : "text-muted"
          }`}
        >
          {t("badge", { count: STEP_COUNT[mode] })}
        </span>
      </span>
      <ul className="flex flex-col gap-2">
        {points.map((point) => (
          <li key={point} className="flex items-start gap-2 text-sm">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
            {point}
          </li>
        ))}
      </ul>
      {mode === "team" && (
        <span className="mt-auto flex items-center gap-2 rounded-md bg-orange/10 px-3 py-2 text-xs text-orange">
          <CircleAlert size={14} aria-hidden />
          {t("warning")}
        </span>
      )}
    </button>
  );
}
