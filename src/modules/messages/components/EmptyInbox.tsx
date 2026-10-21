import { Files } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";

/** Shown when the user has no conversations yet, with a link to browse projects. */
export function EmptyInbox() {
  const t = useTranslations("Messages");

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-20 text-center">
      <span className="flex size-24 items-center justify-center rounded-full bg-surface-muted text-subtle">
        <Files className="size-12 stroke-1" />
      </span>
      <p className="max-w-[300px] text-sm">{t("emptyInbox")}</p>
      <Button href="/projects" pill className="min-h-[38px] px-6 py-2 text-sm">
        {t("browseProjects")}
      </Button>
    </div>
  );
}
