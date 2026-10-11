export function Badge({ count, tone = "danger", className = "" }: { count: number; tone?: "danger" | "brand"; className?: string }) {
  if (count <= 0) return null;

  return (
    <span
      className={`absolute flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-xs leading-none text-white ${
        tone === "brand" ? "bg-brand" : "bg-badge"
      } ${className}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
