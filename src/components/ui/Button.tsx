import type { ButtonHTMLAttributes } from "react";
import { Link } from "@/i18n/navigation";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "solid" | "outline" | "outlineOrange" | "orange" | "ghost";
  font?: "primary" | "button";
  /** md is the default; sm and xs fit cards, table rows and tight toolbars. */
  size?: "md" | "sm" | "xs";
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
  primary: "font-sans font-medium",
  button: "font-button font-semibold",
};

const SIZES = {
  md: "min-h-[43px] px-8 py-3",
  sm: "min-h-[37px] px-4 py-2 text-sm",
  xs: "min-h-[30px] px-4 py-1.5 text-xs",
};

type ButtonStyle = {
  variant?: keyof typeof VARIANTS;
  font?: keyof typeof FONTS;
  size?: keyof typeof SIZES;
  pill?: boolean;
};

/**
 * The design system's button classes, for elements that cannot be a <Button> (links handed to other components,
 * render props). Add layout classes (width, flex) after it; colours, sizes, corners and fonts come from here.
 */
export function buttonClasses({ variant = "primary", font = "primary", size = "md", pill }: ButtonStyle = {}) {
  const text = size === "md" ? (font === "button" ? "text-sm" : "text-base") : "";
  return `inline-flex max-w-full items-center justify-center gap-2.5 ${SIZES[size]} ${text} ${pill ? "rounded-full" : "rounded-md"} capitalize whitespace-nowrap transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 ${VARIANTS[variant]} ${FONTS[font]}`;
}

/** The site's button in its colour variants (solid, outline, orange, ghost...), a spinner while loading, and a link when `href` is given. */
export function Button({
  variant = "primary",
  font = "primary",
  size = "md",
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
  const classes = `${buttonClasses({ variant, font, size, pill })} ${className}`;
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
