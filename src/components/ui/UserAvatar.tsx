import Image from "next/image";

type UserAvatarProps = {
  name: string;
  src: string | null;
  size: number;
  online?: boolean;
  className?: string;
};

/** Round profile photo, or the name's first letter when there is none, with an optional online dot. */
export function UserAvatar({ name, src, size, online, className = "" }: UserAvatarProps) {
  const initial = name.trim().charAt(0);
  return (
    <span className={`relative inline-flex shrink-0 ${className}`} style={{ width: size, height: size }}>
      {src ? (
        <Image src={src} alt="" width={size} height={size} unoptimized className="size-full rounded-full object-cover" />
      ) : (
        <span
          aria-hidden
          className="flex size-full items-center justify-center rounded-full bg-gradient-brand font-semibold text-white uppercase select-none"
          style={{ fontSize: Math.max(11, Math.round(size * 0.46)) }}
        >
          {/* Latin letters and digits are trimmed to their own height to sit on the exact centre; Arabic letters dip
              below the line, so they keep the font's full height. */}
          <span className={/^[A-Za-z0-9]/.test(initial) ? "trim-text" : "inline-block -translate-y-[0.2em] leading-none"}>{initial}</span>
        </span>
      )}
      {online && (
        <span className="absolute end-0 bottom-0 size-3.5 rounded-full border-2 border-surface bg-online" aria-hidden />
      )}
    </span>
  );
}
