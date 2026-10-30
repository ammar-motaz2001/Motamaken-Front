const TONES = {
  success: "border-brand/40 bg-brand-soft text-brand-ink",
  warning: "border-orange/40 bg-orange/10 text-orange",
  danger: "border-danger/40 bg-danger-soft text-danger",
  muted: "border-border bg-surface-muted text-muted",
} as const;

export type StatusTone = keyof typeof TONES;

/** Small rounded status label coloured by tone (success, warning, danger...). */
export function StatusPill({ tone, children }: { tone: StatusTone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex min-h-6 shrink-0 items-center justify-center rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap ${TONES[tone]}`}>
      <span className="trim-text">{children}</span>
    </span>
  );
}
