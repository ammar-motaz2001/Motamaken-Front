"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type ListboxOption = { value: string; label: string; disabled?: boolean; icon?: ReactNode };

type ListboxProps = {
  value: string;
  onChange: (value: string) => void;
  options: ListboxOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  id?: string;
  name?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  /** Classes for the button. Defaults to a bordered field; pass your own for compact or embedded triggers. */
  buttonClassName?: string;
  className?: string;
  /** Show a search box in the list; on by default for long lists. */
  searchable?: boolean;
  /** Width of the list when it should be wider than the button. */
  menuClassName?: string;
  /** Custom content of the button (default: the chosen option's icon and label). */
  renderValue?: (selected: ListboxOption | undefined) => ReactNode;
};

const listboxFieldClasses =
  "flex h-10 w-full items-center gap-2 rounded-[5px] border border-border bg-surface px-3 text-sm outline-none transition-colors focus-visible:border-brand aria-expanded:border-brand";

/**
 * The site's one dropdown (instead of the browser's native select): same look everywhere, light and dark, RTL,
 * keyboard (arrows, Home/End, Enter, Escape, type-ahead) and a search box for long lists.
 */
export function Listbox({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  required,
  invalid,
  id,
  name,
  buttonClassName,
  className = "",
  searchable,
  menuClassName = "",
  renderValue,
  ...aria
}: ListboxProps) {
  const t = useTranslations("Common");
  const generatedId = useId();
  const buttonId = id ?? generatedId;
  const listId = `${buttonId}-list`;
  const wrapper = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [above, setAbove] = useState(false);
  const typed = useRef({ text: "", at: 0 });
  const withSearch = searchable ?? options.length > 8;

  const selected = options.find((option) => option.value === value);
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((option) => option.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const openList = () => {
    if (disabled) return;
    setQuery("");
    setActive(Math.max(0, options.findIndex((option) => option.value === value)));
    setOpen(true);
  };

  const close = (focusButton = true) => {
    setOpen(false);
    if (focusButton) button.current?.focus();
  };

  const choose = (option: ListboxOption | undefined) => {
    if (!option || option.disabled) return;
    if (option.value !== value) onChange(option.value);
    close();
  };

  // Open upwards when there is no room below (e.g. near the bottom of a modal).
  useLayoutEffect(() => {
    if (!open || !button.current) return;
    const rect = button.current.getBoundingClientRect();
    setAbove(window.innerHeight - rect.bottom < 280 && rect.top > window.innerHeight - rect.bottom);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const outside = (event: MouseEvent) => !wrapper.current?.contains(event.target as Node) && close(false);
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  }, [open]);

  useEffect(() => {
    if (open) list.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const move = (step: number) => {
    if (!visible.length) return;
    let next = active;
    for (let i = 0; i < visible.length; i++) {
      next = (next + step + visible.length) % visible.length;
      if (!visible[next].disabled) break;
    }
    setActive(next);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }
    const keys: Record<string, () => void> = {
      ArrowDown: () => move(1),
      ArrowUp: () => move(-1),
      Home: () => setActive(0),
      End: () => setActive(visible.length - 1),
      Enter: () => choose(visible[active]),
      Escape: () => close(),
    };
    if (keys[event.key]) {
      event.preventDefault();
      // Escape closes this list only, not the modal it may sit in.
      if (event.key === "Escape") event.stopPropagation();
      keys[event.key]();
    } else if (event.key === "Tab") {
      close(false);
    } else if (!withSearch && event.key.length === 1) {
      // Type-ahead: jump to the first option starting with the typed letters.
      const now = event.timeStamp;
      typed.current = { text: (now - typed.current.at < 700 ? typed.current.text : "") + event.key.toLowerCase(), at: now };
      const found = visible.findIndex((option) => option.label.toLowerCase().startsWith(typed.current.text));
      if (found >= 0) setActive(found);
    }
  };

  return (
    <div ref={wrapper} className={`relative min-w-0 ${className}`} onKeyDown={onKeyDown}>
      <button
        ref={button}
        id={buttonId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        {...aria}
        onClick={() => (open ? close() : openList())}
        className={`${buttonClassName ?? `${listboxFieldClasses} ${invalid ? "border-danger" : ""}`} cursor-pointer text-start disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {renderValue ? (
          renderValue(selected)
        ) : (
          <>
            {selected?.icon}
            <span className={`min-w-0 flex-1 truncate ${selected ? "" : "text-placeholder"}`}>{selected?.label ?? placeholder ?? t("choose")}</span>
          </>
        )}
        <ChevronDown className={`size-4 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>

      {/* Keeps native form validation (required) and form submission (name) working. */}
      {(required || name) && (
        <input
          tabIndex={-1}
          aria-hidden
          name={name}
          required={required}
          aria-invalid={invalid || undefined}
          value={value}
          onChange={() => undefined}
          onFocus={() => button.current?.focus()}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-0"
        />
      )}

      {open && (
        <div
          className={`absolute z-50 min-w-full overflow-hidden rounded-lg border border-border bg-surface shadow-[0_12px_32px_-8px_rgba(0,0,0,0.25)] ${
            above ? "bottom-full mb-1.5 pop-up" : "top-full mt-1.5 pop-down"
          } start-0 ${menuClassName}`}
        >
          {withSearch && (
            <div className="flex items-center gap-2 border-b border-border px-3">
              <Search className="size-4 shrink-0 text-muted" aria-hidden />
              <input
                autoFocus
                value={query}
                onChange={(event) => (setQuery(event.target.value), setActive(0))}
                placeholder={t("searchList")}
                aria-label={t("searchList")}
                aria-controls={listId}
                className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none"
              />
            </div>
          )}
          <ul
            ref={list}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={aria["aria-labelledby"] ?? buttonId}
            aria-activedescendant={visible[active] ? `${listId}-${active}` : undefined}
            className="max-h-64 overflow-y-auto overscroll-contain p-1"
          >
            {visible.map((option, index) => {
              const isSelected = option.value === value;
              return (
                <li
                  key={option.value || `empty-${index}`}
                  id={`${listId}-${index}`}
                  data-index={index}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  onMouseEnter={() => setActive(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => choose(option)}
                  className={`flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm ${
                    option.disabled ? "cursor-default text-muted opacity-60" : index === active ? "bg-brand/10 text-brand" : ""
                  } ${isSelected ? "font-semibold" : ""}`}
                >
                  {option.icon}
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  {isSelected && <Check className="size-4 shrink-0 text-brand" aria-hidden />}
                </li>
              );
            })}
            {!visible.length && <li className="px-2.5 py-3 text-center text-sm text-muted">{t("noMatches")}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
