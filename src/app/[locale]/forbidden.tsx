import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/error/ErrorState";
import { Button } from "@/components/ui/Button";

export default function Forbidden() {
  const t = useTranslations("Errors");

  return (
    <ErrorState code="403" title={t("forbidden.title")} message={t("forbidden.message")}>
      <Button href="/" variant="solid" font="button">
        {t("home")}
      </Button>
      <Button href="/contact" variant="outline" font="button">
        {t("support")}
      </Button>
    </ErrorState>
  );
}
