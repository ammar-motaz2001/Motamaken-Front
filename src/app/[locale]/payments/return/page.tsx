import { getTranslations, setRequestLocale } from "next-intl/server";
import { PaymentReturn } from "@/modules/wallet";

/** Browser title of the payment result screen. */
export async function generateMetadata({ params }: PageProps<"/[locale]/payments/return">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Wallet.return" });
  return { title: `${t("title")} | Mutamakin`, robots: { index: false } };
}

/** Where Moyasar sends the customer after 3-D Secure: a payment (`?deposit=&id=&status=`) or a card check (`?card=1&status=`). */
export default async function PaymentReturnPage({ params, searchParams }: PageProps<"/[locale]/payments/return">) {
  setRequestLocale((await params).locale);
  const query = await searchParams;
  const deposit = Number(query.deposit);

  return (
    <div className="page-container flex justify-center py-16">
      <PaymentReturn depositId={Number.isInteger(deposit) && deposit > 0 ? deposit : null} card={query.card === "1"} />
    </div>
  );
}
