import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { NewTicketForm } from "@/modules/support";

export async function generateMetadata({ params }: PageProps<"/[locale]/support/new">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Support" });
  return { title: `${t("new")} | Mutamakin`, robots: { index: false } };
}

export default async function NewSupportTicket({ params }: PageProps<"/[locale]/support/new">) {
  setRequestLocale((await params).locale);
  const t = await getTranslations("Support");

  return (
    <div className="page-container flex max-w-3xl flex-col gap-6 py-10">
      <div>
        <Link href="/support" className="text-sm text-link hover:underline">
          {t("back")}
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{t("new")}</h1>
        <p className="text-sm text-muted">{t("newHint")}</p>
      </div>
      <div className="rounded-xl border border-border bg-surface p-5">
        <NewTicketForm />
      </div>
    </div>
  );
}
