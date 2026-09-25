"use client";

import { ChevronDown } from "lucide-react";
import { useId, type SelectHTMLAttributes } from "react";
import { FieldShell } from "./Field";

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
};

export function Select({ label, required, error, hint, placeholder, options, id, className, value, ...rest }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <FieldShell id={selectId} label={label} required={required} error={error} hint={hint} className={className}>
      <select
        id={selectId}
        value={value}
        aria-invalid={Boolean(error)}
        className={`h-full min-w-0 flex-1 cursor-pointer appearance-none bg-transparent text-base outline-none ${
          value ? "text-inherit" : "text-placeholder"
        }`}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} className="text-foreground">
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown size={18} className="pointer-events-none shrink-0 text-muted" aria-hidden />
    </FieldShell>
  );
}
