import type { ReactNode } from "react";

/** Label / value pairs in a responsive grid, for detail screens. */
export function InfoGrid({ items, columns = 3 }: { items: { label: string; value: ReactNode; wide?: boolean }[]; columns?: 2 | 3 | 4 }) {
  const grid = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[columns];
  return (
    <dl className={`grid grid-cols-1 gap-x-6 gap-y-3 text-sm ${grid}`}>
      {items.map((item) => (
        <div key={item.label} className={`min-w-0 ${item.wide ? "sm:col-span-full" : ""}`}>
          <dt className="text-xs text-muted">{item.label}</dt>
          <dd className="mt-0.5 break-words">{item.value ?? "—"}</dd>
        </div>
      ))}
    </dl>
  );
}
