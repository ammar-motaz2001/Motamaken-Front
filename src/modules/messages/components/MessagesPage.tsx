"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { Conversation, Paginated } from "@/lib/api/types";
import { POLL_CONVERSATIONS_MS } from "../lib/conversation";
import { ChatPanel } from "./ChatPanel";
import { ConversationItem } from "./ConversationItem";
import { EmptyInbox } from "./EmptyInbox";
import { SortModal, type Sort } from "./SortModal";

const SEARCH_DELAY_MS = 350;

type MessagesPageProps = {
  initial: Conversation[] | null;
  initialSelected: number | null;
};

/**
 * Inbox: conversation list with search and sort beside the open chat (one at a time on phones). Re-reads
 * GET /conversations on a timer while the tab is visible.
 */
export function MessagesPage({ initial, initialSelected }: MessagesPageProps) {
  const t = useTranslations("Messages");
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[] | null>(initial);
  const [selectedId, setSelectedId] = useState<number | null>(initialSelected ?? initial?.[0]?.id ?? null);
  const [showChatOnMobile, setShowChatOnMobile] = useState(initialSelected !== null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [failed, setFailed] = useState(initial === null);

  const reload = useCallback(async () => {
    const params = new URLSearchParams({ sort });
    if (query.trim()) params.set("q", query.trim());
    try {
      const result = await api<Paginated<Conversation>>(`/conversations?${params}`);
      setConversations(result.data);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [query, sort]);

  useEffect(() => {
    const timer = setTimeout(reload, SEARCH_DELAY_MS);
    const poll = setInterval(() => !document.hidden && reload(), POLL_CONVERSATIONS_MS);
    return () => {
      clearTimeout(timer);
      clearInterval(poll);
    };
  }, [reload]);

  const selected = conversations?.find((conversation) => conversation.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedId || selected || !conversations) return;
    api<{ data: Conversation }>(`/conversations/${selectedId}`)
      .then(({ data }) => setConversations((current) => (current?.some((item) => item.id === data.id) ? current : [data, ...(current ?? [])])))
      .catch(() => setSelectedId(null));
  }, [selectedId, selected, conversations]);

  const select = (id: number) => {
    setSelectedId(id);
    setShowChatOnMobile(true);
    setConversations((current) => current?.map((item) => (item.id === id ? { ...item, unreadCount: 0 } : item)) ?? null);
    window.history.replaceState(null, "", `?c=${id}`);
  };

  const onRead = useCallback(() => router.refresh(), [router]);

  const isEmpty = conversations?.length === 0 && !query.trim();

  return (
    <section className="page-container flex flex-col pb-8">
      <h1 className="pt-8 pb-4 text-[28.8px] leading-9 font-bold text-orange uppercase">{t("title")}</h1>

      <div className="flex flex-col gap-4 rounded-xl bg-surface px-2 pt-4 pb-6 shadow-card sm:px-4 dark:border dark:border-border">
        <h2 className="px-2 text-xl leading-[21px] font-bold text-heading sm:px-[30px]">{t("allMessages")}</h2>

        {isEmpty ? (
          <EmptyInbox />
        ) : (
          <div className="flex gap-3 px-0 sm:px-[30px]">
            <div className={`w-full shrink-0 flex-col md:flex md:w-[299px] ${showChatOnMobile ? "hidden" : "flex"}`}>
              <div className="flex items-center">
                <label className="flex h-12 flex-1 items-center justify-between gap-2 rounded-[5px] border border-border bg-surface px-2.5">
                  <input
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("search")}
                    aria-label={t("search")}
                    className="min-w-0 flex-1 bg-transparent text-base outline-none"
                  />
                  <Image src="/images/search-outline.svg" alt="" width={20} height={20} />
                </label>
                <button type="button" onClick={() => setSortOpen(true)} aria-label={t("sortTitle")} className="py-3 ps-2.5">
                  <Image src="/images/sort.svg" alt="" width={24} height={24} className="dark:invert" />
                </button>
              </div>

              {failed && <p className="py-6 text-center text-sm text-danger">{t("loadFailed")}</p>}
              {conversations?.length === 0 && <p className="py-6 text-center text-sm text-muted">{t("noResults")}</p>}
              <ul className="max-h-[640px] overflow-y-auto">
                {conversations?.map((conversation) => (
                  <ConversationItem
                    key={conversation.id}
                    conversation={conversation}
                    selected={conversation.id === selectedId}
                    onSelect={() => select(conversation.id)}
                  />
                ))}
              </ul>
            </div>

            <div className={`min-w-0 flex-1 md:flex ${showChatOnMobile ? "flex" : "hidden"}`}>
              {selected ? (
                <ChatPanel
                  key={selected.id}
                  conversation={selected}
                  onBack={() => setShowChatOnMobile(false)}
                  onActivity={reload}
                  onRead={onRead}
                />
              ) : (
                <p className="m-auto py-20 text-muted">{t("pickConversation")}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <SortModal
        open={sortOpen}
        value={sort}
        onClose={() => setSortOpen(false)}
        onApply={(value) => {
          setSort(value);
          setSortOpen(false);
        }}
      />
    </section>
  );
}
