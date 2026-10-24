"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { ADMIN_LOGIN_PATH } from "@/lib/session";
import { LogoutButton } from "./LogoutButton";

/**
 * Top-bar links: "My account" and sign out when signed in, otherwise sign-up and sign-in links (none on the staff
 * sign-in page, which offers no way to create an account).
 */
export function AccountLinks({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations("Header");
  const pathname = usePathname();
  if (!signedIn && pathname === ADMIN_LOGIN_PATH) return null;

  return (
    <div className="flex h-[35px] items-center gap-2">
      {signedIn ? (
        <>
          <Link href="/settings/profile" className="text-base font-bold text-brand hover:opacity-85">
            {t("myAccount")}
          </Link>
          <span className="text-base font-medium">·</span>
          <LogoutButton />
        </>
      ) : (
        <>
          <Link href="/signup" className="text-base font-bold text-brand uppercase hover:opacity-85">
            {t("joinUs")}
          </Link>
          <span className="text-base font-medium">{t("or")}</span>
          <Link href="/login" className="text-base font-bold text-brand uppercase hover:opacity-85">
            {t("login")}
          </Link>
        </>
      )}
    </div>
  );
}
