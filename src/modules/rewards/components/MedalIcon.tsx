import { BadgeCheck, Crown, CreditCard, Handshake, Rocket, Star, Trophy, Users, type LucideIcon } from "lucide-react";

const MEDALS: Record<string, { Icon: LucideIcon; tone: string }> = {
  verified: { Icon: BadgeCheck, tone: "bg-link/15 text-link" },
  payment_verified: { Icon: CreditCard, tone: "bg-brand/15 text-brand" },
  first_job: { Icon: Rocket, tone: "bg-orange/15 text-orange" },
  rising_star: { Icon: Star, tone: "bg-[#f5b301]/20 text-[#b98700]" },
  top_rated: { Icon: Trophy, tone: "bg-[#f5b301]/20 text-[#b98700]" },
  trusted_client: { Icon: Handshake, tone: "bg-brand/15 text-brand" },
  distinguished: { Icon: Crown, tone: "bg-[#7c3aed]/15 text-[#7c3aed]" },
  connector: { Icon: Users, tone: "bg-link/15 text-link" },
};

export function MedalIcon({ code, size = 48, muted }: { code: string; size?: number; muted?: boolean }) {
  const { Icon, tone } = MEDALS[code] ?? MEDALS.verified;

  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${muted ? "bg-surface-muted text-placeholder grayscale" : tone}`}
      style={{ width: size, height: size }}
    >
      <Icon style={{ width: size * 0.5, height: size * 0.5 }} />
    </span>
  );
}
