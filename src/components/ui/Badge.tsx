/** Unread-count bubble; hidden at zero and capped at "99+". `inline` sits in the text flow instead of on an icon corner. */
export function Badge({
  count,
  tone = "danger",
  inline,
  max = 99,
  className = "",
}: {
  count: number;
  tone?: "danger" | "brand";
  inline?: boolean;
  max?: number;
  className?: string;
}) {
  if (count <= 0) return null;

  return (
    <span
      className={`${inline ? "inline-flex" : "absolute flex"} h-4 min-w-4 shrink-0 items-center justify-center rounded-full px-1 text-[10.5px] leading-none font-bold text-white tabular-nums ring-2 ring-surface ${
        tone === "brand" ? "bg-brand" : "bg-badge"
      } ${className}`}
    >
      <span className="trim-text">{count > max ? `${max}+` : count}</span>
    </span>
  );
}
