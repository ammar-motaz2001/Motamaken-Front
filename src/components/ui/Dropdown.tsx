"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type DropdownItem = { value: string; label: ReactNode };

type DropdownProps = {
  trigger: ReactNode;
  items: DropdownItem[];
  selected?: string;
  onSelect: (value: string) => void;
  label: string;
};

export function Dropdown({ trigger, items, selected, onSelect, label }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1 rounded-md px-1 py-[7.5px]"
      >
        {trigger}
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute end-0 top-full z-30 mt-1 min-w-32 overflow-hidden rounded-md border border-border bg-surface py-1 shadow-card"
        >
          {items.map((item) => (
            <li key={item.value}>
              <button
                type="button"
                role="option"
                aria-selected={item.value === selected}
                onClick={() => {
                  setOpen(false);
                  onSelect(item.value);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-start text-base hover:bg-surface-muted ${
                  item.value === selected ? "font-bold text-brand" : ""
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
