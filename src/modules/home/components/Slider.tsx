"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useRef, type ReactNode } from "react";

/** Horizontal card carousel with previous/next arrows that scroll by most of a screen, mirrored in right-to-left pages. */
export function Slider({ children }: { children: ReactNode }) {
  const t = useTranslations("Home");
  const track = useRef<HTMLDivElement>(null);

  const scroll = (direction: 1 | -1) => {
    const element = track.current;
    if (!element) return;
    const rtl = getComputedStyle(element).direction === "rtl";
    element.scrollBy({ left: direction * (rtl ? -1 : 1) * element.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <button type="button" aria-label={t("previous")} onClick={() => scroll(-1)} className="hidden shrink-0 sm:block">
        <Image src="/images/arrow-left.svg" alt="" width={24} height={24} className="rtl:-scale-x-100 dark:invert" />
      </button>
      <div
        ref={track}
        className="flex min-w-0 flex-1 snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <button type="button" aria-label={t("next")} onClick={() => scroll(1)} className="hidden shrink-0 sm:block">
        <Image src="/images/arrow-right.svg" alt="" width={24} height={24} className="rtl:-scale-x-100 dark:invert" />
      </button>
    </div>
  );
}
