"use client";

import { FileCheck2, Upload } from "lucide-react";
import { useId } from "react";

type FilePickProps = { label: string; hint: string; accept: string; file: File | null; error?: string; required?: boolean; onChange: (file: File | null) => void };

/** File chooser for one document photo, showing the chosen file's name and the error. */
export function FilePick({ label, hint, accept, file, error, required, onChange }: FilePickProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-2">
      <span className="text-base font-medium">
        {label}
        {required && <span className="text-danger"> *</span>}
      </span>
      <label
        htmlFor={id}
        className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed p-4 text-center text-sm transition-colors hover:border-brand ${
          error ? "border-danger" : file ? "border-brand bg-brand-soft" : "border-border"
        }`}
      >
        {file ? <FileCheck2 className="size-6 text-brand" aria-hidden /> : <Upload className="size-6 text-muted" aria-hidden />}
        <span className="max-w-full truncate font-medium">{file ? file.name : hint}</span>
        <input id={id} type="file" accept={accept} className="sr-only" onChange={(event) => onChange(event.target.files?.[0] ?? null)} />
      </label>
      {error && <p className="text-end font-hint text-xs text-danger">{error}</p>}
    </div>
  );
}
