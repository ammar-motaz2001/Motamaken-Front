import type { AppNotification } from "@/lib/api/types";

export const NOTIFICATION_GROUPS = ["messages", "proposals", "projects", "payments", "disputes", "account", "rewards"] as const;

export type NotificationGroup = (typeof NOTIFICATION_GROUPS)[number];

export function notificationHref(notification: AppNotification) {
  const context = notification.context ?? {};
  if (notification.conversationId) return `/messages?c=${notification.conversationId}`;
  if (context.disputeId) return `/disputes/${context.disputeId}`;
  if (notification.projectId) return `/projects/${notification.projectId}`;
  if (notification.type.startsWith("team")) return "/teams";
  if (/^(deposit|withdrawal)\./.test(notification.type)) return "/settings/wallet";
  if (notification.type.startsWith("promotion")) return "/premium";
  if (notification.type.startsWith("kyc")) return "/settings/verification";
  if (notification.type.startsWith("draw.")) return "/gifts";
  if (notification.type.startsWith("medal.")) return "/settings/medals";
  if (notification.type.startsWith("points.")) return "/settings/points";
  if (notification.type.startsWith("affiliate.")) return "/settings/invite";
  return null;
}
