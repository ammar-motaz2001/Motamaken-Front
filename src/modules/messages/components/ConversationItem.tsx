import { useLocale, useTranslations } from "next-intl";
import { UserAvatar } from "@/components/ui/UserAvatar";
import type { Conversation } from "@/lib/api/types";
import { timeAgo } from "@/lib/format";
import { conversationAvatar, conversationName } from "../lib/conversation";

type ConversationItemProps = {
  conversation: Conversation;
  selected: boolean;
  onSelect: () => void;
};

/** One row of the inbox: avatar, name, last message preview, time and unread count. */
export function ConversationItem({ conversation, selected, onSelect }: ConversationItemProps) {
  const t = useTranslations("Messages");
  const locale = useLocale();
  const last = conversation.lastMessage;
  const name = conversationName(conversation);
  const preview = last
    ? `${last.isMine ? `${t("you")}: ` : ""}${last.preview ?? t(`preview.${last.type}`)}`
    : t("noMessagesYet");

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected}
        className={`relative flex w-full items-start gap-3 border-b-[0.5px] border-[#e5e5e5] px-4 py-2 text-start sm:px-[25px] dark:border-border ${
          selected ? "bg-selected" : "hover:bg-surface-muted"
        }`}
      >
        <span className="relative">
          <UserAvatar name={name} src={conversationAvatar(conversation)} size={62} online={conversation.participant?.isOnline} />
          {conversation.unreadCount > 0 && (
            <span className="absolute -start-1 top-0 flex size-5 items-center justify-center rounded-full bg-danger text-xs font-bold text-white">
              +{conversation.unreadCount > 9 ? 9 : conversation.unreadCount}
            </span>
          )}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-base font-medium tracking-[-0.5px]">{name}</span>
          <span dir="auto" className={`truncate text-start text-base ${conversation.unreadCount > 0 ? "font-bold" : ""}`}>{preview}</span>
          <span className="text-end text-xs font-medium text-foreground/70">{timeAgo(conversation.updatedAt, locale)}</span>
        </span>
      </button>
    </li>
  );
}
