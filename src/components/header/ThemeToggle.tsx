"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { FiSun } from "react-icons/fi";
import { useSyncExternalStore } from "react";
import { savePreference } from "./preferences";

const subscribe = () => () => {};

export function ThemeToggle({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations("Header");
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={t("toggleTheme")}
      aria-pressed={isDark}
      onClick={() => {
        const theme = isDark ? "light" : "dark";
        setTheme(theme);
        savePreference(signedIn, { theme });
      }}
      className="flex size-5 items-center justify-center"
    >
      {isDark ? (
        <FiSun className="size-5 text-orange-light" />
      ) : (
        <Image src="/images/moon.svg" alt="" width={20} height={20} />
      )}
    </button>
  );
}
