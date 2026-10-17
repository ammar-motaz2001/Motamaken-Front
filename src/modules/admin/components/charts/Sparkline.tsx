"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";

/** A tiny trend line for a stat card. */
export function Sparkline({ values, color, id }: { values: number[]; color: string; id: string }) {
  const data = values.map((value, index) => ({ index, value }));

  return (
    <div className="h-10 w-24" dir="ltr" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#spark-${id})`} dot={false} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
