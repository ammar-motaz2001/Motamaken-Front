"use client";

import { ArrowLeft, MessagesSquare } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { Conversation, Message } from "@/lib/api/types";
import { conversationAvatar, conversationName, mergeMessages, POLL_MESSAGES_MS } from "../lib/conversation";
import { Composer } from "./Composer";
import { MessageBubble } from "./MessageBubble";

type MessagesResponse = { data: Message[]; meta: { hasMore: boolean } };

type ChatPanelProps = {
  conversation: Conversation;
  onBack: () => void;
  onActivity: () => void;
  onRead: (conversationId: number) => void;
};

/**
 * Open conversation: loads GET /conversations/{id}/messages, polls for new ones, loads older ones on scroll up,
 * marks it read and sends text, files and voice.
 */
export function ChatPanel({ conversation, onBack, onActivity, onRead }: ChatPanelProps) {
  const t = useTranslations("Messages");
  const scroller = useRef<HTMLDivElement>(null);
  const keepScroll = useRef<number | null>(null);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialUnread = useRef(conversation.unreadCount);
  const base = `/conversations/${conversation.id}`;
  const lastId = messages?.at(-1)?.id;
  const loaded = messages !== null;

  const markRead = useCallback(async () => {
    await api(`${base}/read`, { method: "POST" }).catch(() => undefined);
    onRead(conversation.id);
  }, [base, onRead, conversation.id]);

  useEffect(() => {
    let cancelled = false;
    api<MessagesResponse>(`${base}/messages`)
      .then((result) => {
        if (cancelled) return;
        setMessages(result.data);
        setHasMore(result.meta.hasMore);
      })
      .catch(() => !cancelled && setError(t("loadFailed")));
    if (initialUnread.current > 0) markRead();
    return () => {
      cancelled = true;
    };
  }, [base, markRead, t]);

  useEffect(() => {
    if (!loaded) return;
    const timer = setInterval(async () => {
      if (document.hidden) return;
      const result = await api<MessagesResponse>(`${base}/messages?after=${lastId ?? 0}`).catch(() => null);
      if (!result?.data.length) return;
      setMessages((current) => mergeMessages(current ?? [], result.data));
      onActivity();
      if (result.data.some((message) => !message.isMine)) markRead();
    }, POLL_MESSAGES_MS);
    return () => clearInterval(timer);
  }, [base, lastId, loaded, markRead, onActivity]);

  useLayoutEffect(() => {
    const element = scroller.current;
    if (!element) return;
    if (keepScroll.current !== null) {
      element.scrollTop = element.scrollHeight - keepScroll.current;
      keepScroll.current = null;
    } else {
      element.scrollTop = element.scrollHeight;
    }
  }, [messages]);

  const loadOlder = async () => {
    const first = messages?.[0];
    if (!first) return;
    setLoadingOlder(true);
    const result = await api<MessagesResponse>(`${base}/messages?before=${first.id}`).catch(() => null);
    setLoadingOlder(false);
    if (!result) return;
    keepScroll.current = (scroller.current?.scrollHeight ?? 0) - (scroller.current?.scrollTop ?? 0);
    setMessages((current) => mergeMessages(current ?? [], result.data));
    setHasMore(result.meta.hasMore);
  };

  const send = async (body: Record<string, unknown> | FormData) => {
    setSending(true);
    setError(null);
    try {
      const { data } = await api<{ data: Message }>(`${base}/messages`, { method: "POST", body });
      setMessages((current) => mergeMessages(current ?? [], [data]));
      onActivity();
      return true;
    } catch (caught) {
      setError((caught as ApiError).message || t("sendFailed"));
      return false;
    } finally {
      setSending(false);
    }
  };

  const name = conversationName(conversation);
  const isGroup = conversation.type === "group";
  const online = conversation.participant?.isOnline ?? false;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-3 md:border-s-[0.5px] md:border-[#e5e5e5] md:ps-3 md:pt-2 dark:md:border-border">
      <div className="flex items-start gap-3">
        <button type="button" onClick={onBack} aria-label={t("back")} className="mt-3 md:hidden">
          <ArrowLeft className="size-5 rtl:-scale-x-100" />
        </button>
        {!isGroup && conversation.participant ? (
          <Link href={`/users/${conversation.participant.id}`} aria-label={name} className="shrink-0 rounded-full hover:opacity-90">
            <UserAvatar name={name} src={conversationAvatar(conversation)} size={55} online={online} />
          </Link>
        ) : (
          <UserAvatar name={name} src={conversationAvatar(conversation)} size={55} online={online} />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {!isGroup && conversation.participant ? (
            <Link href={`/users/${conversation.participant.id}`} className="truncate text-base font-medium tracking-[-0.5px] hover:text-brand">
              {name}
            </Link>
          ) : (
            <p className="truncate text-base font-medium tracking-[-0.5px]">{name}</p>
          )}
          <p className="truncate text-base text-muted">
            {conversation.project ? (
              <Link href={`/projects/${conversation.project.id}`} className="hover:text-brand">
                {conversation.project.title}
              </Link>
            ) : isGroup ? (
              t("members", { count: conversation.participants?.length ?? 0 })
            ) : online ? (
              t("online")
            ) : (
              t("offline")
            )}
          </p>
        </div>
      </div>

      <div ref={scroller} className="flex min-h-[320px] flex-1 flex-col gap-3 overflow-y-auto pe-1 md:max-h-[560px]">
        {hasMore && (
          <button
            type="button"
            onClick={loadOlder}
            disabled={loadingOlder}
            className="self-center rounded-full border border-border px-4 py-1 text-sm text-muted hover:bg-surface-muted disabled:opacity-60"
          >
            {loadingOlder ? t("loading") : t("loadOlder")}
          </button>
        )}
        {messages === null && !error && <p className="m-auto text-sm text-muted">{t("loading")}</p>}
        {messages?.length === 0 && (
          <div className="m-auto flex max-w-xs flex-col items-center gap-3 px-4 text-center">
            <span className="flex size-16 items-center justify-center rounded-2xl bg-brand-soft text-brand ring-1 ring-brand/15" aria-hidden>
              <MessagesSquare className="size-7" strokeWidth={1.75} />
            </span>
            <p className="text-base font-bold text-heading">{t("startChatTitle", { name })}</p>
            <p className="text-sm leading-relaxed text-muted">{t("startChat")}</p>
          </div>
        )}
        {messages?.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            showSender={message.senderId !== messages[index - 1]?.senderId}
          />
        ))}
      </div>

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <Composer
        sending={sending}
        onSendText={(body) => send({ body })}
        onSendFile={(form) => send(form)}
        onError={setError}
      />
    </div>
  );
}
