import type { Conversation, Message } from "@/lib/api/types";

export const POLL_MESSAGES_MS = 4000;
export const POLL_CONVERSATIONS_MS = 15000;

/** Name to show for a conversation: the other person's, else the group title. */
export function conversationName(conversation: Conversation) {
  return conversation.participant?.fullName ?? conversation.title ?? "";
}

/** Photo to show for a conversation: the other person's, or null. */
export function conversationAvatar(conversation: Conversation) {
  return conversation.participant?.avatarUrl ?? null;
}

/** Adds new or updated messages to the list without duplicates, in sending order. */
export function mergeMessages(current: Message[], incoming: Message[]) {
  const byId = new Map(current.map((message) => [message.id, message]));
  incoming.forEach((message) => byId.set(message.id, message));
  return [...byId.values()].sort((a, b) => a.id - b.id);
}
