import Image from "next/image";
import type { InputHTMLAttributes, ReactNode } from "react";

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  children: ReactNode;
  invalid?: boolean;
};

export function Checkbox({ children, invalid, className = "", ...inputProps }: CheckboxProps) {
  return (
    <label className={`inline-flex cursor-pointer items-center gap-2.5 pt-2 ${className}`}>
      <input type="checkbox" className="peer sr-only" {...inputProps} />
      <span
        aria-hidden
        className={`relative flex size-7 shrink-0 items-center justify-center before:size-6 before:rounded-[7px] before:border before:bg-surface before:content-[''] peer-checked:before:opacity-0 peer-focus-visible:before:outline-2 peer-focus-visible:before:outline-offset-2 peer-focus-visible:before:outline-brand peer-checked:[&>img]:opacity-100 ${
          invalid ? "before:border-danger before:shadow-[0_0_4px_rgba(236,0,0,0.35)]" : "before:border-orange before:shadow-check"
        }`}
      >
        <Image src="/images/tick-square.svg" alt="" width={28} height={28} className="absolute inset-0 opacity-0" />
      </span>
      <span className="text-base leading-normal font-light tracking-[-0.176px] [&_a]:inline-block [&_a]:border-b [&_a]:border-brand-border [&_a]:font-bold">
        {children}
      </span>
    </label>
  );
}
