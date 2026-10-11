import type { Conversation, Message } from "@/lib/api/types";

export const POLL_MESSAGES_MS = 4000;
export const POLL_CONVERSATIONS_MS = 15000;

export function conversationName(conversation: Conversation) {
  return conversation.participant?.fullName ?? conversation.title ?? "";
}

export function conversationAvatar(conversation: Conversation) {
  return conversation.participant?.avatarUrl ?? null;
}

export function mergeMessages(current: Message[], incoming: Message[]) {
  const byId = new Map(current.map((message) => [message.id, message]));
  incoming.forEach((message) => byId.set(message.id, message));
  return [...byId.values()].sort((a, b) => a.id - b.id);
}
