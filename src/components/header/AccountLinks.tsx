import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LogoutButton } from "./LogoutButton";

export function AccountLinks({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations("Header");

  return (
    <div className="flex h-[35px] items-center gap-2">
      {signedIn ? (
        <>
          <Link href="/account" className="text-base font-bold text-brand hover:opacity-85">
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
