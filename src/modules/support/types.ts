type SupportPerson = { id: number; fullName: string; avatarUrl: string | null; username?: string | null };

type SupportMessage = {
  id: number;
  isStaff: boolean;
  author: SupportPerson | null;
  body: string | null;
  attachment: { name: string; mime: string; size: number; url: string } | null;
  createdAt: string;
};

export type SupportTicket = {
  id: number;
  subject: string;
  category: "account" | "payments" | "projects" | "technical" | "other";
  status: "open" | "answered" | "closed";
  user: SupportPerson | null;
  assignedTo: SupportPerson | null;
  lastMessageAt: string | null;
  createdAt: string;
  messages: SupportMessage[] | null;
};

export const SUPPORT_CATEGORIES = ["account", "payments", "projects", "technical", "other"] as const;
