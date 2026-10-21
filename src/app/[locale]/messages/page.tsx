import { getTranslations, setRequestLocale } from "next-intl/server";
import { apiGetOrNull } from "@/lib/api/server";
import type { Conversation, Paginated } from "@/lib/api/types";
import { MessagesPage } from "@/modules/messages";

/** Browser title of the inbox. */
export async function generateMetadata({ params }: PageProps<"/[locale]/messages">) {
  const t = await getTranslations({ locale: (await params).locale, namespace: "Metadata" });
  return { title: t("messages") };
}

/** Inbox: conversations from GET /conversations; `?c=` opens one conversation straight away. */
export default async function Messages({ params, searchParams }: PageProps<"/[locale]/messages">) {
  setRequestLocale((await params).locale);
  const { c } = await searchParams;
  const selected = typeof c === "string" && /^\d+$/.test(c) ? Number(c) : null;
  const conversations = await apiGetOrNull<Paginated<Conversation>>("/conversations");

  return <MessagesPage initial={conversations?.data ?? null} initialSelected={selected} />;
}
