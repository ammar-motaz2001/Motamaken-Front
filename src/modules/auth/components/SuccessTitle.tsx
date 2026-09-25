import Image from "next/image";
import { useTranslations } from "next-intl";

export function SuccessTitle() {
  const t = useTranslations("Auth");

  return (
    <>
      <Image src="/images/success-check.gif" alt="" width={21} height={20} unoptimized className="h-5 w-[21px] object-cover" />
      {t("signupSuccess")}
    </>
  );
}
