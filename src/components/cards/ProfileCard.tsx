import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { ProfileCard as Profile } from "@/lib/api/types";
import { FavoriteButton } from "./FavoriteButton";
import { HireButton } from "./HireButton";

/** Card of a freelancer or influencer: photo (or initial), name, role and stars, linking to the public profile. */
export function ProfileCard({ profile, signedIn }: { profile: Profile; signedIn: boolean }) {
  const t = useTranslations("Home");
  const stars = Math.round(profile.rating);

  return (
    <article className="relative flex w-[212px] shrink-0 in-[.card-grid]:w-auto snap-start flex-col overflow-hidden rounded-xl bg-surface shadow-card dark:border dark:border-border">
      <div className="relative flex aspect-square w-full flex-col justify-end bg-gradient-brand">
        {profile.avatarUrl ? (
          <Image src={profile.avatarUrl} alt="" fill unoptimized className="object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center pb-10 text-7xl font-bold text-white/90 uppercase">
            {profile.fullName.charAt(0)}
          </span>
        )}
        <div className="relative bg-nav/65 px-4 py-2 text-white backdrop-blur-[4.5px]">
          <p className="truncate text-base font-bold tracking-[-0.176px]">{profile.fullName}</p>
          <div className="flex" role="img" aria-label={t("rating", { rating: profile.rating })}>
            {Array.from({ length: 5 }, (_, index) => (
              <Image
                key={index}
                src="/images/star.svg"
                alt=""
                width={12}
                height={12}
                className={index < stars ? "" : "opacity-30 grayscale"}
              />
            ))}
          </div>
        </div>
        <FavoriteButton kind="profile" id={profile.id} className="absolute start-3 top-3" />
        {profile.jobTitle && (
          <span className="absolute end-0 top-3 max-w-[calc(100%-3.5rem)] truncate rounded-s-xl bg-nav/65 px-4 py-1.5 text-base leading-none font-medium tracking-[-0.176px] text-white backdrop-blur-[4.5px]">
            {profile.jobTitle}
          </span>
        )}
      </div>
      <div className="flex gap-2 px-3 pt-7 pb-4">
        <HireButton userId={profile.userId} signedIn={signedIn} />
        <Link
          href={`/users/${profile.userId}?tab=portfolio`}
          className="flex h-[37px] flex-1 items-center justify-center rounded-md border border-brand bg-surface text-sm font-medium whitespace-nowrap text-brand capitalize hover:opacity-85"
        >
          {t("portfolio")}
        </Link>
      </div>
    </article>
  );
}
