import { useTranslations } from "next-intl";
import { LogoLoader } from "@/components/ui/LogoLoader";

/** Shown while any page loads; the header and footer stay in place. */
export default function Loading() {
  const t = useTranslations("Auth");
  return <LogoLoader label={t("loadingPage")} />;
}
