"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePresence } from "./usePresence";

type DropdownItem = { value: string; label: ReactNode };

type DropdownProps = {
  trigger: ReactNode;
  items: DropdownItem[];
  selected?: string;
  onSelect: (value: string) => void;
  label: string;
};

/** Height of one item plus the list's padding, to tell whether the menu fits below its trigger. */
const ITEM_HEIGHT = 40;
const MARGIN = 12;
/** Widest the menu gets (flag + language or currency name), to keep it on screen sideways. */
const MENU_WIDTH = 176;

/**
 * Small menu under a trigger (language, currency): marks the selected item and closes on outside click or Escape.
 * It opens upward when there is no room below (e.g. at the bottom of the mobile menu), so it never needs scrolling
 * to be seen, and it fades and slides in.
 */
export function Dropdown({ trigger, items, selected, onSelect, label }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [above, setAbove] = useState(false);
  // Which physical edge of the trigger the menu lines up with, so it never runs off the side of the screen.
  const [side, setSide] = useState<"left" | "right">("right");
  const ref = useRef<HTMLDivElement>(null);
  const { mounted, leaving } = usePresence(open);

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

  const toggle = () => {
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const below = window.innerHeight - rect.bottom;
      setAbove(below < items.length * ITEM_HEIGHT + MARGIN && rect.top > below);
      setSide(rect.right - MENU_WIDTH >= MARGIN ? "right" : window.innerWidth - rect.left - MENU_WIDTH >= MARGIN ? "left" : "right");
    }
    setOpen((value) => !value);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        onClick={toggle}
        className="flex items-center gap-1 rounded-md px-1.5 py-[7.5px] transition-colors hover:bg-surface-muted"
      >
        {trigger}
      </button>
      {mounted && (
        <ul
          role="listbox"
          className={`absolute ${side === "right" ? "right-0" : "left-0"} z-30 min-w-32 overflow-hidden rounded-lg border border-border glass py-1 ${
            above ? "bottom-full mb-1" : "top-full mt-1"
          } ${leaving ? "pop-leave" : above ? "pop-up" : "pop-down"}`}
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
                className={`flex w-full items-center gap-2 px-3 py-2 text-start text-base transition-colors hover:bg-surface-muted ${
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
