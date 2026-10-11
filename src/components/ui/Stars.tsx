import { Star } from "lucide-react";

export function Stars({ rating, size = 14, label }: { rating: number; size?: number; label: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={label}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          style={{ width: size, height: size }}
          className={index < Math.round(rating) ? "fill-[#f5b301] text-[#f5b301]" : "fill-border text-border"}
          aria-hidden
        />
      ))}
    </span>
  );
}
