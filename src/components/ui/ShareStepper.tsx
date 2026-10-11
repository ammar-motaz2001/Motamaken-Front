import { Minus, Plus } from "lucide-react";

type ShareStepperProps = {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  size?: "sm" | "lg";
  label: string;
};

export function ShareStepper({ value, onChange, step = 5, min = 0, max = 100, size = "sm", label }: ShareStepperProps) {
  const button = `flex items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:border-brand hover:text-brand disabled:opacity-40 ${
    size === "lg" ? "size-8" : "size-6"
  }`;

  return (
    <div dir="ltr" role="group" aria-label={label} className="flex items-center gap-2">
      <button type="button" className={button} disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))} aria-label="-">
        <Minus size={size === "lg" ? 16 : 12} aria-hidden />
      </button>
      <span className={`min-w-11 text-center font-bold ${size === "lg" ? "text-4xl text-brand" : "text-sm"}`}>{value}%</span>
      <button type="button" className={button} disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))} aria-label="+">
        <Plus size={size === "lg" ? 16 : 12} aria-hidden />
      </button>
    </div>
  );
}
