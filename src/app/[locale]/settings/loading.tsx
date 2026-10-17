import { useTranslations } from "next-intl";
import { LogoLoader } from "@/components/ui/LogoLoader";

export default function Loading() {
  const t = useTranslations("Auth");
  return <LogoLoader label={t("loadingPage")} size={136} />;
}
