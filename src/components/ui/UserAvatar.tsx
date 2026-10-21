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
  return (
    <span className={`relative inline-flex shrink-0 ${className}`} style={{ width: size, height: size }}>
      {src ? (
        <Image src={src} alt="" width={size} height={size} unoptimized className="size-full rounded-full object-cover" />
      ) : (
        <span
          aria-hidden
          className="flex size-full items-center justify-center rounded-full bg-gradient-brand font-bold text-white uppercase"
          style={{ fontSize: Math.max(12, size * 0.4) }}
        >
          {name.trim().charAt(0)}
        </span>
      )}
      {online && (
        <span className="absolute end-0 bottom-0 size-3.5 rounded-full border-2 border-surface bg-online" aria-hidden />
      )}
    </span>
  );
}
