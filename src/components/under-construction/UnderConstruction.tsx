import { useTranslations } from "next-intl";
import { FaPersonDigging } from "react-icons/fa6";
import { Button } from "@/components/ui/Button";

export function UnderConstruction() {
  const t = useTranslations("UnderConstruction");

  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-20 text-center">
      <span className="flex size-24 items-center justify-center rounded-full bg-orange/10 text-orange">
        <FaPersonDigging className="size-12" />
      </span>
      <h1 className="bg-gradient-brand bg-clip-text text-5xl leading-tight font-bold text-transparent uppercase sm:text-7xl">
        {t("title")}
      </h1>
      <p className="max-w-xl text-lg text-muted sm:text-xl">{t("message")}</p>
      <Button href="/" width={231}>
        {t("backHome")}
      </Button>
    </section>
  );
}
