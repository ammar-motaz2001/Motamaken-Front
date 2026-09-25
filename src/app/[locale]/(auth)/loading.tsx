import { useTranslations } from "next-intl";

export default function AuthLoading() {
  const t = useTranslations("Auth");

  return (
    <div role="status" className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <span className="size-14 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
      <p className="text-base font-medium text-muted">{t("loadingPage")}</p>
    </div>
  );
}
