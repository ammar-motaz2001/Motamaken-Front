"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

type UserAvatarProps = {
  name: string;
  src: string | null;
  size: number;
  online?: boolean;
  className?: string;
};

const LATIN = /^[A-Za-z0-9]/;

/** "Abdulrahman Reda" → "AR", "Hamed" → "H", "لينا الجهني" → "ل" (Arabic letters change shape when joined, so one). */
export function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  const first = words[0].charAt(0);
  if (!LATIN.test(first) || words.length < 2) return first.toUpperCase();
  const last = words.at(-1)!.charAt(0);
  return LATIN.test(last) ? `${first}${last}`.toUpperCase() : first.toUpperCase();
}

/** Offsets that move the letters' ink (not the font's line box) onto the circle's centre, measured once per text. */
const offsets = new Map<string, { x: number; y: number }>();

function measure(text: string, font: string): { x: number; y: number } {
  const key = `${font}|${text}`;
  const known = offsets.get(key);
  if (known) return known;
  const context = document.createElement("canvas").getContext("2d");
  if (!context) return { x: 0, y: 0 };
  context.font = font;
  const m = context.measureText(text);
  // Ink centre vs. the centre of the line box the browser centres: shift by the difference.
  const y = (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2 - (m.fontBoundingBoxAscent - m.fontBoundingBoxDescent) / 2;
  const x = (m.actualBoundingBoxLeft - m.actualBoundingBoxRight) / 2 + m.width / 2;
  const result = { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
  offsets.set(key, result);
  return result;
}

/** Round profile photo, or the person's initials on the brand's soft green, with an optional online dot. */
export function UserAvatar({ name, src, size, online, className = "" }: UserAvatarProps) {
  const initials = initialsOf(name);
  const letter = useRef<HTMLSpanElement>(null);
  const [shift, setShift] = useState<{ x: number; y: number } | null>(null);
  const fontSize = Math.max(11, Math.round(size * (initials.length > 1 ? 0.38 : 0.44)));

  useLayoutEffect(() => {
    if (src || !letter.current) return;
    const element = letter.current;
    const apply = () => {
      const style = getComputedStyle(element);
      setShift(measure(initials, `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`));
    };
    apply();
    // Measure again once the web font has loaded (the first pass may have used the fallback).
    let active = true;
    document.fonts?.ready.then(() => active && apply());
    return () => {
      active = false;
    };
  }, [initials, src, fontSize]);

  return (
    <span className={`relative inline-flex shrink-0 ${className}`} style={{ width: size, height: size }}>
      {src ? (
        <Image src={src} alt="" width={size} height={size} unoptimized className="size-full rounded-full object-cover" />
      ) : (
        <span
          aria-hidden
          className="flex size-full items-center justify-center overflow-hidden rounded-full bg-brand-soft font-bold text-brand-ink ring-1 ring-brand/20 select-none ring-inset"
          style={{ fontSize }}
        >
          <span
            ref={letter}
            className="leading-none tracking-wide"
            style={shift ? { transform: `translate(${shift.x}px, ${shift.y}px)` } : { visibility: "hidden" }}
          >
            {initials}
          </span>
        </span>
      )}
      {online && (
        <span className="absolute end-0 bottom-0 size-3.5 rounded-full border-2 border-surface bg-online" aria-hidden />
      )}
    </span>
  );
}
