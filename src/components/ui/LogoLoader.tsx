/* eslint-disable @next/next/no-img-element -- an animated GIF: next/image would add nothing and could freeze it */

type LogoLoaderProps = {
  /** Shown under the bee; also read out by screen readers. */
  label?: string;
  /** `page`: fills the content area. `overlay`: covers the whole screen (payments, long actions). `inline`: just the bee. */
  variant?: "page" | "overlay" | "inline";
  size?: number;
};

/** The flying Mutamakin bee: the one loading animation used across the site. */
export function LogoLoader({ label, variant = "page", size = 168 }: LogoLoaderProps) {
  const bee = (
    <span className="relative flex items-center justify-center">
      <span className="absolute size-[70%] animate-ping rounded-full bg-brand/10 [animation-duration:2s]" aria-hidden />
      <img src="/images/loader.gif" alt="" width={size} height={size} className="relative select-none" draggable={false} />
    </span>
  );

  if (variant === "inline") return <span role="status" aria-label={label}>{bee}</span>;

  const content = (
    <>
      {bee}
      {label && <p className="max-w-sm animate-pulse text-sm font-medium text-muted">{label}</p>}
    </>
  );

  if (variant === "overlay") {
    return (
      <div role="status" aria-live="polite" className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-surface/95 p-6 text-center backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div role="status" aria-live="polite" className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4 p-6 text-center">
      {content}
    </div>
  );
}
