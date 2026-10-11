"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type KeyboardEvent } from "react";
import type { ApiError } from "@/lib/api/errors";
import { firstError } from "./saveSection";

export function SkillsSection({ skills, onSave }: { skills: string[]; onSave: (skills: string[]) => Promise<void> }) {
  const t = useTranslations("ProfileEditor");
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const save = async (next: string[]) => {
    setError(null);
    try {
      await onSave(next);
    } catch (caught) {
      const apiError = caught as ApiError;
      setError(firstError(apiError.fields) ?? apiError.message ?? t("failed"));
    }
  };

  const add = () => {
    const skill = value.trim();
    if (!skill) return;
    if (skills.some((item) => item.toLowerCase() === skill.toLowerCase())) return setValue("");
    setValue("");
    void save([...skills, skill]);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add();
    }
  };

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:p-5">
      <h2 className="text-base font-bold">{t("skills.title")}</h2>
      <ul className="flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <li key={skill} className="flex items-center gap-1 rounded-full bg-brand-soft py-1 ps-2.5 pe-1.5 text-xs text-brand-ink">
            {skill}
            <button type="button" aria-label={t("skills.remove", { skill })} onClick={() => save(skills.filter((item) => item !== skill))} className="rounded-full p-0.5 hover:bg-brand/20">
              <X className="size-3" />
            </button>
          </li>
        ))}
      </ul>
      {skills.length < 20 && (
        <div className="flex gap-2">
          <input
            value={value}
            maxLength={40}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("skills.placeholder")}
            aria-label={t("skills.placeholder")}
            className="h-10 min-w-0 flex-1 rounded-md border border-border bg-surface px-3 text-sm outline-none focus:border-brand"
          />
          <button type="button" onClick={add} className="rounded-md border border-brand px-4 text-sm font-medium text-brand hover:bg-brand-soft">
            {t("add")}
          </button>
        </div>
      )}
      {error && <p className="text-sm text-danger">{error}</p>}
    </section>
  );
}
