import type { ButtonHTMLAttributes } from "react";
import { Link } from "@/i18n/navigation";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "solid" | "outline" | "outlineOrange" | "orange" | "ghost";
  font?: "primary" | "button";
  width?: number | string;
  loading?: boolean;
  pill?: boolean;
  href?: string;
};

const VARIANTS = {
  primary: "bg-gradient-brand text-white",
  solid: "bg-brand text-white",
  ghost: "border border-border bg-surface text-foreground",
  orange: "bg-gradient-orange text-white",
  outline: "border border-brand-border bg-surface",
  outlineOrange: "border border-orange bg-surface text-orange",
};

const FONTS = {
  primary: "font-sans text-base font-medium",
  button: "font-button text-sm font-semibold",
};

export function Button({
  variant = "primary",
  font = "primary",
  width,
  loading,
  pill,
  href,
  className = "",
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  const classes = `inline-flex min-h-[43px] max-w-full items-center justify-center gap-2.5 px-8 py-3 ${pill ? "rounded-full" : "rounded-md"} capitalize whitespace-nowrap transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 ${VARIANTS[variant]} ${FONTS[font]} ${className}`;
  const style = width ? { width } : undefined;
  const label = variant === "outline" ? <span className="text-gradient-brand">{children}</span> : children;

  if (href) {
    return (
      <Link href={href} className={classes} style={style}>
        {label}
      </Link>
    );
  }

  return (
    <button type={type} {...rest} disabled={disabled || loading} className={classes} style={style}>
      {loading ? (
        <span className="size-[18px] animate-spin rounded-full border-2 border-white/50 border-t-white" role="status" />
      ) : (
        label
      )}
    </button>
  );
}
