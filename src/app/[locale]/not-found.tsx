import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/error/ErrorState";
import { Button } from "@/components/ui/Button";

/** 404 screen for unknown addresses or missing records, with links home and to search. */
export default function NotFound() {
  const t = useTranslations("Errors");

  return (
    <ErrorState code="404" title={t("notFound.title")} message={t("notFound.message")}>
      <Button href="/" variant="solid" font="button">
        {t("home")}
      </Button>
      <Button href="/search" variant="outline" font="button">
        {t("search")}
      </Button>
    </ErrorState>
  );
}
