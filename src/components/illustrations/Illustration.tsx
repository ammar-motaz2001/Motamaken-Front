import type { ReactNode } from "react";

export type IllustrationName = "services" | "guide" | "contact" | "categories" | "payments" | "shield" | "legal" | "about";

/**
 * Flat illustrations in the brand palette (green, orange and the logo's hexagons). Drawn with theme colours, so they
 * follow dark mode. Decorative: hidden from screen readers.
 */
export function Illustration({ name, className = "" }: { name: IllustrationName; className?: string }) {
  return (
    <svg viewBox="0 0 320 240" className={className} aria-hidden fill="none" xmlns="http://www.w3.org/2000/svg">
      <Backdrop />
      {SCENES[name]}
    </svg>
  );
}

/** Soft blob, dotted grid and the logo's hexagons behind every scene. */
function Backdrop() {
  return (
    <>
      <path d="M58 64c28-40 104-52 158-30s82 72 62 120-78 76-136 66S12 170 22 126s8-22 36-62Z" className="fill-brand/10" />
      {[0, 1, 2, 3].map((row) =>
        [0, 1, 2, 3, 4].map((col) => <circle key={`${row}-${col}`} cx={238 + col * 12} cy={24 + row * 12} r={1.6} className="fill-brand/25" />),
      )}
      <Hex x={34} y={170} size={14} className="stroke-orange" />
      <Hex x={286} y={196} size={9} className="stroke-brand-light" />
      <Hex x={48} y={40} size={8} className="fill-orange/80" filled />
    </>
  );
}

/** Pointy-top hexagon centred at (x, y) for the illustrations, outlined or filled. */
function Hex({ x, y, size, className, filled }: { x: number; y: number; size: number; className: string; filled?: boolean }) {
  const points = Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 6;
    return `${(x + size * Math.cos(a)).toFixed(1)},${(y + size * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
  return <polygon points={points} className={className} strokeWidth={filled ? 0 : 3} fill={filled ? undefined : "none"} />;
}

const card = "fill-surface stroke-border";

const SCENES: Record<IllustrationName, ReactNode> = {
  services: (
    <>
      {/* Laptop with a project card */}
      <rect x="70" y="62" width="150" height="100" rx="10" className={card} strokeWidth={2} />
      <rect x="80" y="72" width="130" height="80" rx="6" className="fill-brand/10" />
      <rect x="90" y="82" width="60" height="8" rx="4" className="fill-brand" />
      <rect x="90" y="96" width="100" height="6" rx="3" className="fill-brand/30" />
      <rect x="90" y="108" width="80" height="6" rx="3" className="fill-brand/30" />
      <rect x="90" y="126" width="44" height="16" rx="8" className="fill-orange" />
      <path d="M56 162h178l-10 14H66l-10-14Z" className="fill-brand" />
      {/* Megaphone */}
      <path d="M232 104l40-20v58l-40-18v-20Z" className="fill-orange" />
      <rect x="220" y="102" width="14" height="26" rx="4" className="fill-orange-light" />
      <path d="M284 96c8 6 8 30 0 36M294 88c14 10 14 42 0 52" className="stroke-orange" strokeWidth={3} strokeLinecap="round" />
      {/* Person */}
      <circle cx="150" cy="198" r="0" />
      <circle cx="252" cy="176" r="12" className="fill-brand-light" />
      <path d="M232 214c0-16 9-26 20-26s20 10 20 26" className="fill-brand" />
    </>
  ),
  guide: (
    <>
      {/* A path of numbered steps ending at a flag */}
      <path d="M52 192c40 0 40-44 80-44s40-44 80-44 40-36 64-36" className="stroke-brand/40" strokeWidth={4} strokeDasharray="2 10" strokeLinecap="round" />
      {[
        [52, 192, "1"],
        [132, 148, "2"],
        [212, 104, "3"],
      ].map(([x, y, n]) => (
        <g key={n as string}>
          <circle cx={x as number} cy={y as number} r="20" className="fill-brand" />
          <text x={x as number} y={(y as number) + 7} textAnchor="middle" className="fill-white" fontSize="20" fontWeight="700" fontFamily="sans-serif">
            {n}
          </text>
        </g>
      ))}
      <path d="M276 30v52" className="stroke-foreground" strokeWidth={4} strokeLinecap="round" />
      <path d="M278 30h34l-10 12 10 12h-34Z" className="fill-orange" />
      <rect x="84" y="56" width="92" height="56" rx="10" className={card} strokeWidth={2} />
      <rect x="96" y="70" width="50" height="7" rx="3.5" className="fill-orange/70" />
      <rect x="96" y="84" width="68" height="6" rx="3" className="fill-brand/30" />
      <rect x="96" y="96" width="40" height="6" rx="3" className="fill-brand/30" />
    </>
  ),
  contact: (
    <>
      {/* Envelope */}
      <rect x="70" y="80" width="150" height="104" rx="12" className={card} strokeWidth={2} />
      <path d="M72 88l73 54 73-54" className="stroke-brand" strokeWidth={4} strokeLinejoin="round" />
      {/* Chat bubbles */}
      <path d="M190 42h96a12 12 0 0 1 12 12v40a12 12 0 0 1-12 12h-50l-18 16v-16h-28a12 12 0 0 1-12-12V54a12 12 0 0 1 12-12Z" className="fill-brand" />
      {[214, 234, 254].map((x) => (
        <circle key={x} cx={x} cy="74" r="5" className="fill-white" />
      ))}
      <path d="M232 148h52a10 10 0 0 1 10 10v26a10 10 0 0 1-10 10h-8v14l-16-14h-28a10 10 0 0 1-10-10v-26a10 10 0 0 1 10-10Z" className="fill-orange" />
      <rect x="236" y="162" width="40" height="6" rx="3" className="fill-white/90" />
      <rect x="236" y="174" width="26" height="6" rx="3" className="fill-white/70" />
    </>
  ),
  categories: (
    <>
      {/* A grid of category tiles */}
      {[
        [62, 50, "fill-brand"],
        [142, 50, "fill-orange"],
        [222, 50, "fill-brand-light"],
        [62, 130, "fill-orange-light"],
        [142, 130, "fill-brand"],
        [222, 130, "fill-link"],
      ].map(([x, y, tone]) => (
        <g key={`${x}-${y}`}>
          <rect x={x as number} y={y as number} width="68" height="68" rx="14" className={card} strokeWidth={2} />
          <rect x={(x as number) + 20} y={(y as number) + 14} width="28" height="28" rx="8" className={tone as string} />
          <rect x={(x as number) + 14} y={(y as number) + 50} width="40" height="6" rx="3" className="fill-foreground/20" />
        </g>
      ))}
    </>
  ),
  payments: (
    <>
      {/* Wallet with coins and a shield */}
      <rect x="66" y="78" width="160" height="110" rx="16" className="fill-brand" />
      <rect x="66" y="78" width="160" height="30" rx="16" className="fill-brand-light" />
      <rect x="180" y="118" width="58" height="36" rx="10" className="fill-surface" />
      <circle cx="200" cy="136" r="7" className="fill-orange" />
      {[
        [96, 60],
        [124, 48],
        [152, 60],
      ].map(([x, y]) => (
        <g key={x}>
          <circle cx={x} cy={y} r="16" className="fill-orange-light" />
          <circle cx={x} cy={y} r="10" className="stroke-white" strokeWidth={3} />
        </g>
      ))}
      <path d="M262 92l30 12v24c0 20-14 34-30 40-16-6-30-20-30-40v-24l30-12Z" className="fill-orange" />
      <path d="M249 128l9 9 18-18" className="stroke-white" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  shield: (
    <>
      {/* Big shield with a scale for fairness */}
      <path d="M160 34l70 26v56c0 46-32 78-70 92-38-14-70-46-70-92V60l70-26Z" className="fill-brand" />
      <path d="M160 34l70 26v56c0 46-32 78-70 92V34Z" className="fill-brand-light/60" />
      <path d="M160 82v72M132 96h56" className="stroke-white" strokeWidth={5} strokeLinecap="round" />
      <path d="M132 96l-12 26h24l-12-26ZM188 96l-12 26h24l-12-26Z" className="fill-orange-light stroke-white" strokeWidth={2} strokeLinejoin="round" />
      <rect x="140" y="154" width="40" height="8" rx="4" className="fill-white" />
    </>
  ),
  legal: (
    <>
      {/* A signed document */}
      <rect x="96" y="30" width="128" height="170" rx="12" className={card} strokeWidth={2} />
      <rect x="116" y="52" width="70" height="10" rx="5" className="fill-brand" />
      {[74, 88, 102, 116, 130].map((y, i) => (
        <rect key={y} x="116" y={y} width={i % 2 ? 72 : 88} height="6" rx="3" className="fill-foreground/15" />
      ))}
      <path d="M118 168c10-14 18 8 28-4s14-10 22 2" className="stroke-brand" strokeWidth={3} strokeLinecap="round" />
      <circle cx="226" cy="168" r="26" className="fill-orange" />
      <path d="M214 168l8 8 16-16" className="stroke-white" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  about: (
    <>
      {/* Two people shaking hands over a hexagon */}
      <circle cx="112" cy="84" r="20" className="fill-brand-light" />
      <path d="M78 176c0-34 15-54 34-54s34 20 34 54" className="fill-brand" />
      <circle cx="208" cy="84" r="20" className="fill-orange-light" />
      <path d="M174 176c0-34 15-54 34-54s34 20 34 54" className="fill-orange" />
      <path d="M140 150l20-14 20 14" className="stroke-surface" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
      <rect x="66" y="176" width="188" height="10" rx="5" className="fill-foreground/15" />
    </>
  ),
};

/** Which illustration an info page gets, by its address. */
export function illustrationFor(slug: string, section?: string): IllustrationName {
  if (slug === "services") return "services";
  if (["guide", "bidding-system", "evaluation-system", "affiliate-system"].includes(slug)) return "guide";
  if (["contact", "support"].includes(slug)) return "contact";
  if (["payment-protection", "site-fees", "guarantee-of-rights"].includes(slug)) return "payments";
  if (["disputes-system", "black-list"].includes(slug)) return "shield";
  if (section === "legal") return "legal";
  return section === "help" ? "guide" : "about";
}
