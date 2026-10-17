"use client";

import { useId } from "react";
import { FieldShell } from "./Field";
import { Listbox, type ListboxOption } from "./Listbox";

type SelectProps = {
  label?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  placeholder?: string;
  options: ListboxOption[];
  value?: string;
  /** Receives `{ target: { value } }`, like a native select's change event, so callers did not have to change. */
  onChange?: (event: { target: { value: string } }) => void;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
  searchable?: boolean;
  "aria-label"?: string;
};

/** A labelled dropdown field (the shared Listbox inside the form field frame). */
export function Select({ label, required, error, hint, placeholder, options, id, className, value = "", onChange, disabled, name, searchable, ...aria }: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;

  return (
    <FieldShell id={selectId} label={label} required={required} error={error} hint={hint} className={className}>
      <Listbox
        id={selectId}
        value={value}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        invalid={Boolean(error)}
        name={name}
        searchable={searchable}
        onChange={(next) => onChange?.({ target: { value: next } })}
        className="-mx-2.5 flex-1 self-stretch"
        buttonClassName="flex h-full w-full items-center gap-2 bg-transparent px-2.5 text-base outline-none"
        {...aria}
      />
    </FieldShell>
  );
}
