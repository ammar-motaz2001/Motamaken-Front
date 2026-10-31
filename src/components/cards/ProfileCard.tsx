import { BadgeCheck } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { buttonClasses } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import type { ProfileCard as Profile } from "@/lib/api/types";
import { FavoriteButton } from "./FavoriteButton";
import { HireButton } from "./HireButton";

/** Card of a freelancer or influencer: photo (or initial), name with a verified badge, role and stars, linking to the public profile. */
export function ProfileCard({ profile, signedIn }: { profile: Profile; signedIn: boolean }) {
  const t = useTranslations("Home");
  const stars = Math.round(profile.rating);

  return (
    <article className="relative flex w-[212px] shrink-0 in-[.card-grid]:w-auto snap-start flex-col overflow-hidden rounded-xl bg-surface shadow-card dark:border dark:border-border">
      {/* As in the design: a tall photo with the specialty tag on top and the name and stars over its lower edge. */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-brand">
        {/* The whole picture (photo or initial), name and stars open the profile; the heart sits above this link. */}
        <Link href={`/users/${profile.userId}`} aria-label={profile.fullName} className="absolute inset-0">
          {profile.avatarUrl ? (
            <Image src={profile.avatarUrl} alt="" fill unoptimized className="object-cover transition-transform duration-300 hover:scale-105" />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center pb-10 text-6xl font-bold text-white/90 uppercase">
              {profile.fullName.charAt(0)}
            </span>
          )}
          <span className="absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-3 pt-8 pb-2.5 text-white">
            <span className="flex items-center gap-1 text-base font-bold">
              <span className="truncate [unicode-bidi:plaintext]">{profile.fullName}</span>
              {profile.verified && <BadgeCheck className="size-4 shrink-0 text-white" aria-label={t("verified")} />}
            </span>
            <span className="flex gap-0.5" role="img" aria-label={t("rating", { rating: profile.rating })}>
              {Array.from({ length: 5 }, (_, index) => (
                <Image key={index} src="/images/star.svg" alt="" width={14} height={14} className={index < stars ? "" : "opacity-40 grayscale"} />
              ))}
            </span>
          </span>
        </Link>
        {profile.jobTitle && (
          <span className="pointer-events-none absolute end-3 top-3 max-w-[60%] truncate rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {profile.jobTitle}
          </span>
        )}
        <FavoriteButton kind="profile" id={profile.id} ownerId={profile.userId} className="absolute start-3 top-3" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-3">
        <div className="mt-auto grid grid-cols-2 gap-2 [&>*]:min-w-0">
          <HireButton userId={profile.userId} signedIn={signedIn} />
          <Link
            href={`/users/${profile.userId}?tab=portfolio`}
            className={`${buttonClasses({ variant: "outline", size: "sm" })} w-full`}
          >
            <span className="truncate text-gradient-brand">{t("portfolio")}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
