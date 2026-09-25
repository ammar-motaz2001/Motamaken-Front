import Image from "next/image";
import { useTranslations } from "next-intl";

const PROVIDERS = [
  { id: "google", label: "Google", icon: "/images/google.svg", height: 24 },
  { id: "apple", label: "Apple", icon: "/images/apple.svg", height: 24 },
  { id: "x", label: "X", icon: "/images/x.svg", height: 24.0786 },
  { id: "facebook", label: "Facebook", icon: "/images/facebook.svg", height: 24 },
];

export function SocialAuth() {
  const t = useTranslations("Auth");

  return (
    <div className="mx-auto flex w-full max-w-[425px] flex-col items-center gap-[15px]">
      <div className="flex w-full max-w-[336px] items-center gap-4">
        <span className="h-px flex-1 bg-subtle" />
        <span className="text-base leading-[21px] whitespace-nowrap text-subtle">{t("orSignupUsing")}</span>
        <span className="h-px flex-1 bg-subtle" />
      </div>
      <div className="flex w-full gap-2.5">
        {PROVIDERS.map((provider) => (
          <a
            key={provider.id}
            href={`${process.env.NEXT_PUBLIC_API_URL ?? ""}/auth/oauth/${provider.id}`}
            aria-label={t("continueWith", { provider: provider.label })}
            className="flex h-[55px] flex-1 items-center justify-center rounded-md bg-surface shadow-social transition-transform hover:-translate-y-px dark:border dark:border-border"
          >
            <Image src={provider.icon} alt="" width={24} height={provider.height} className="dark:invert" />
          </a>
        ))}
      </div>
    </div>
  );
}
