"use client";

import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { FieldShell } from "./Field";
import { Listbox } from "./Listbox";

type Ymd = { y: number; m: number; d: number };

const pad = (n: number) => String(n).padStart(2, "0");
const toKey = ({ y, m, d }: Ymd) => `${y}-${pad(m + 1)}-${pad(d)}`;

function parse(value: string | undefined): (Ymd & { hh: number; mm: number }) | null {
  const found = value?.match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  return found ? { y: +found[1], m: +found[2] - 1, d: +found[3], hh: +(found[4] ?? 0), mm: +(found[5] ?? 0) } : null;
}

function todayYmd(): Ymd {
  const now = new Date();
  return { y: now.getFullYear(), m: now.getMonth(), d: now.getDate() };
}

type DatePickerProps = {
  /** `YYYY-MM-DD`, or `YYYY-MM-DDTHH:mm` with `withTime` (the same strings native date inputs use). */
  value: string;
  onChange: (value: string) => void;
  withTime?: boolean;
  /** `YYYY-MM-DD` limits. */
  min?: string;
  max?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  id?: string;
  "aria-label"?: string;
  buttonClassName?: string;
  className?: string;
};

/** The site's calendar (instead of the browser's): localized, RTL, dark mode, keyboard, year jump for birth dates. */
export function DatePicker({ value, onChange, withTime, min, max, placeholder, disabled, required, invalid, id, buttonClassName, className = "", ...aria }: DatePickerProps) {
  const t = useTranslations("Common.calendar");
  const locale = useLocale();
  const generatedId = useId();
  const buttonId = id ?? generatedId;
  const wrapper = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const picked = parse(value);
  const minDate = parse(min);
  const maxDate = parse(max);
  const [open, setOpen] = useState(false);
  const [above, setAbove] = useState(false);
  const [view, setView] = useState<{ y: number; m: number }>(() => picked ?? todayYmd());
  const [focus, setFocus] = useState<Ymd>(() => picked ?? todayYmd());

  // Saturday first in Arabic, Sunday otherwise.
  const weekStart = locale === "ar" ? 6 : 0;
  const weekdays = useMemo(() => {
    // Arabic short names ("الأربعاء") do not fit a 7-column grid; use the one-letter forms there.
    const format = new Intl.DateTimeFormat(locale, { weekday: locale === "ar" ? "narrow" : "short" });
    return Array.from({ length: 7 }, (_, i) => format.format(new Date(2024, 0, 7 + ((weekStart + i) % 7))));
  }, [locale, weekStart]);
  const months = useMemo(() => {
    const format = new Intl.DateTimeFormat(locale, { month: "long" });
    return Array.from({ length: 12 }, (_, i) => format.format(new Date(2024, i, 1)));
  }, [locale]);

  const firstYear = minDate?.y ?? todayYmd().y - 100;
  const lastYear = maxDate?.y ?? todayYmd().y + 10;
  const years = useMemo(() => Array.from({ length: lastYear - firstYear + 1 }, (_, i) => String(lastYear - i)), [firstYear, lastYear]);

  const outOfRange = (day: Ymd) => (min && toKey(day) < min.slice(0, 10)) || (max && toKey(day) > max.slice(0, 10));

  const label = picked
    ? new Intl.DateTimeFormat(locale, withTime ? { dateStyle: "medium", timeStyle: "short" } : { dateStyle: "long" }).format(new Date(picked.y, picked.m, picked.d, picked.hh, picked.mm))
    : (placeholder ?? t("pick"));

  const emit = (day: Ymd, hh = picked?.hh ?? 9, mm = picked?.mm ?? 0) => onChange(withTime ? `${toKey(day)}T${pad(hh)}:${pad(mm)}` : toKey(day));

  // With no date yet, open on today, or on the nearest allowed day (e.g. 18 years ago for a birth date).
  const startDay = (): Ymd => {
    const today = todayYmd();
    if (maxDate && toKey(today) > toKey(maxDate)) return maxDate;
    if (minDate && toKey(today) < toKey(minDate)) return minDate;
    return today;
  };

  const openCalendar = () => {
    if (disabled) return;
    const start = picked ?? startDay();
    setView({ y: start.y, m: start.m });
    setFocus(start);
    setOpen(true);
  };

  const close = (focusButton = true) => {
    setOpen(false);
    if (focusButton) button.current?.focus();
  };

  const select = (day: Ymd) => {
    if (outOfRange(day)) return;
    emit(day);
    if (!withTime) close();
  };

  useLayoutEffect(() => {
    if (!open || !button.current) return;
    const rect = button.current.getBoundingClientRect();
    setAbove(window.innerHeight - rect.bottom < 380 && rect.top > window.innerHeight - rect.bottom);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: MouseEvent) => !wrapper.current?.contains(event.target as Node) && close(false);
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [open]);

  // Keep keyboard focus on the highlighted day.
  useEffect(() => {
    if (open) grid.current?.querySelector<HTMLButtonElement>(`[data-day="${toKey(focus)}"]`)?.focus({ preventScroll: true });
  }, [open, focus]);

  const moveFocus = (days: number) => {
    const next = new Date(focus.y, focus.m, focus.d + days);
    const day = { y: next.getFullYear(), m: next.getMonth(), d: next.getDate() };
    setFocus(day);
    setView({ y: day.y, m: day.m });
  };

  const shiftMonth = (step: number) => {
    const next = new Date(view.y, view.m + step, 1);
    setView({ y: next.getFullYear(), m: next.getMonth() });
  };

  const onGridKey = (event: KeyboardEvent) => {
    const rtl = document.documentElement.dir === "rtl";
    const keys: Record<string, () => void> = {
      ArrowLeft: () => moveFocus(rtl ? 1 : -1),
      ArrowRight: () => moveFocus(rtl ? -1 : 1),
      ArrowUp: () => moveFocus(-7),
      ArrowDown: () => moveFocus(7),
      PageUp: () => moveFocus(-30),
      PageDown: () => moveFocus(30),
      Enter: () => select(focus),
      " ": () => select(focus),
    };
    if (keys[event.key]) {
      event.preventDefault();
      keys[event.key]();
    }
  };

  // The month grid: blanks before the 1st, then every day.
  const lead = (new Date(view.y, view.m, 1).getDay() - weekStart + 7) % 7;
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const today = toKey(todayYmd());
  const number = new Intl.NumberFormat(locale);

  return (
    <div
      ref={wrapper}
      className={`relative min-w-0 ${className}`}
      onKeyDown={(event) => {
        if (open && event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      }}
    >
      <button
        ref={button}
        id={buttonId}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={open}
        {...aria}
        onClick={() => (open ? close() : openCalendar())}
        className={`${
          buttonClassName ??
          `flex h-10 w-full items-center gap-2 rounded-[5px] border bg-surface px-3 text-sm outline-none focus-visible:border-brand aria-expanded:border-brand ${invalid ? "border-danger" : "border-border"}`
        } cursor-pointer text-start disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <span className={`min-w-0 flex-1 truncate ${picked ? "" : "text-placeholder"}`}>{label}</span>
        <CalendarDays className="size-4 shrink-0 text-muted" aria-hidden />
      </button>

      {required && (
        <input
          tabIndex={-1}
          aria-hidden
          required
          aria-invalid={invalid || undefined}
          value={value}
          onChange={() => undefined}
          onFocus={() => button.current?.focus()}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-0"
        />
      )}

      {open && (
        <div
          role="dialog"
          aria-label={t("title")}
          className={`absolute start-0 z-50 w-[300px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-surface p-3 shadow-[0_16px_40px_-10px_rgba(0,0,0,0.3)] ${
            above ? "bottom-full mb-1.5" : "top-full mt-1.5"
          }`}
        >
          <div className="mb-2 flex items-center gap-1">
            <button type="button" onClick={() => shiftMonth(-1)} aria-label={t("previous")} className="flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-surface-muted">
              <ChevronLeft className="size-4 rtl:-scale-x-100" aria-hidden />
            </button>
            <Listbox
              aria-label={t("month")}
              value={String(view.m)}
              onChange={(m) => setView((current) => ({ ...current, m: Number(m) }))}
              options={months.map((name, i) => ({ value: String(i), label: name }))}
              searchable={false}
              className="flex-1"
              buttonClassName="flex h-8 w-full items-center gap-1 rounded-md px-2 text-sm font-semibold hover:bg-surface-muted"
            />
            <Listbox
              aria-label={t("year")}
              value={String(view.y)}
              onChange={(y) => setView((current) => ({ ...current, y: Number(y) }))}
              options={years.map((y) => ({ value: y, label: y }))}
              searchable={years.length > 15}
              className="w-[92px]"
              buttonClassName="flex h-8 w-full items-center gap-1 rounded-md px-2 text-sm font-semibold hover:bg-surface-muted"
            />
            <button type="button" onClick={() => shiftMonth(1)} aria-label={t("next")} className="flex size-8 shrink-0 items-center justify-center rounded-md hover:bg-surface-muted">
              <ChevronRight className="size-4 rtl:-scale-x-100" aria-hidden />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-muted">
            {weekdays.map((day) => (
              <span key={day} className="py-1.5">
                {day}
              </span>
            ))}
          </div>
          <div ref={grid} role="grid" onKeyDown={onGridKey} className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: lead }, (_, i) => (
              <span key={`lead-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = { y: view.y, m: view.m, d: i + 1 };
              const key = toKey(day);
              const isPicked = picked && toKey(picked) === key;
              const isFocus = toKey(focus) === key;
              const blocked = Boolean(outOfRange(day));
              return (
                <button
                  key={key}
                  type="button"
                  data-day={key}
                  tabIndex={isFocus ? 0 : -1}
                  disabled={blocked}
                  aria-pressed={Boolean(isPicked)}
                  aria-current={key === today ? "date" : undefined}
                  onClick={() => (setFocus(day), select(day))}
                  className={`flex aspect-square items-center justify-center rounded-lg text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand/50 disabled:cursor-not-allowed disabled:opacity-30 ${
                    isPicked ? "bg-brand font-bold text-white" : key === today ? "font-bold text-brand ring-1 ring-brand/40 ring-inset hover:bg-brand/10" : "hover:bg-surface-muted"
                  }`}
                >
                  {number.format(i + 1)}
                </button>
              );
            })}
          </div>

          {withTime && (
            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
              <span className="text-sm text-muted">{t("time")}</span>
              <div dir="ltr" className="ms-auto flex items-center gap-1">
                <Listbox
                  aria-label={t("hour")}
                  value={pad(picked?.hh ?? 9)}
                  onChange={(hh) => emit(picked ?? focus, Number(hh), picked?.mm ?? 0)}
                  options={Array.from({ length: 24 }, (_, h) => ({ value: pad(h), label: pad(h) }))}
                  searchable={false}
                  className="w-[68px]"
                />
                <span className="font-bold">:</span>
                <Listbox
                  aria-label={t("minute")}
                  value={pad(picked?.mm ?? 0)}
                  onChange={(mm) => emit(picked ?? focus, picked?.hh ?? 9, Number(mm))}
                  options={Array.from({ length: 12 }, (_, i) => ({ value: pad(i * 5), label: pad(i * 5) }))}
                  searchable={false}
                  className="w-[68px]"
                />
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
            {outOfRange(todayYmd()) ? (
              <span />
            ) : (
              <button
                type="button"
                onClick={() => {
                  const now = todayYmd();
                  setView({ y: now.y, m: now.m });
                  setFocus(now);
                  select(now);
                }}
                className="rounded-md px-2.5 py-1.5 text-sm font-semibold text-brand hover:bg-brand/10"
              >
                {t("today")}
              </button>
            )}
            <div className="flex gap-1">
              {value && !required && (
                <button type="button" onClick={() => (onChange(""), close())} className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-sm text-muted hover:bg-surface-muted">
                  <X className="size-3.5" aria-hidden />
                  {t("clear")}
                </button>
              )}
              {withTime && (
                <button type="button" onClick={() => close()} className="rounded-md bg-brand px-3 py-1.5 text-sm font-semibold text-white hover:opacity-90">
                  {t("done")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type DateFieldProps = Omit<DatePickerProps, "buttonClassName" | "invalid"> & { label?: string; error?: string; hint?: string };

/** A labelled date field (DatePicker inside the form field frame). */
export function DateField({ label, error, hint, id, className, ...picker }: DateFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell id={fieldId} label={label} required={picker.required} error={error} hint={hint} className={className}>
      <DatePicker
        id={fieldId}
        invalid={Boolean(error)}
        {...picker}
        className="-mx-2.5 flex-1 self-stretch"
        buttonClassName="flex h-full w-full items-center gap-2 bg-transparent px-2.5 text-base outline-none"
      />
    </FieldShell>
  );
}
