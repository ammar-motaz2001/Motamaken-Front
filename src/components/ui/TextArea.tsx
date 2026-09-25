"use client";

import { useId, type TextareaHTMLAttributes } from "react";
import { FieldShell } from "./Field";

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
};

export function TextArea({ label, required, error, hint, id, className, rows = 4, ...rest }: TextAreaProps) {
  const generatedId = useId();
  const areaId = id ?? generatedId;

  return (
    <FieldShell id={areaId} label={label} required={required} error={error} hint={hint} className={className} multiline>
      <textarea
        id={areaId}
        rows={rows}
        aria-invalid={Boolean(error)}
        className="min-h-20 w-full resize-y bg-transparent text-base text-inherit outline-none"
        {...rest}
      />
    </FieldShell>
  );
}
