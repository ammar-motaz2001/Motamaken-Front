export function Avatar({ name, tone = "orange", size = 32 }: { name: string; tone?: "brand" | "orange"; size?: number }) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={`flex shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
        tone === "brand" ? "bg-brand" : "bg-orange"
      }`}
    >
      {name.trim().charAt(0)}
    </span>
  );
}
