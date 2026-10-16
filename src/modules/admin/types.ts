import type { UserBrief } from "@/lib/api/types";

export type Meta = { current_page: number; last_page: number; per_page: number; total: number };

export type List<T> = { data: T[]; meta: Meta };

export type Overview = {
  users: { total: number; verified: number; newThisWeek: number; suspended: number };
  projects: Record<string, number>;
  money: { currency: string; inWallets: number; inEscrow: number; revenue: number; pendingWithdrawals: number }[];
  queues: {
    pendingWithdrawals: number;
    pendingKyc: number;
    openDisputes: number;
    openReports: number;
    newContactMessages: number;
  };
  series: { date: string; users: number; projects: number }[];
};

export type AdminUser = {
  id: number;
  fullName: string;
  username: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
  isVerified: boolean;
  kycStatus: "none" | "pending" | "approved" | "rejected";
  points: number;
  suspendedAt: string | null;
  suspensionReason: string | null;
  lastSeenAt: string | null;
  createdAt: string;
  stats?: { projects: number; offers: number; openDisputes: number };
};

export type WalletBalance = { currency: string; available: number; inEscrow: number; incoming: number; pendingWithdrawals: number };

export type AdminProject = {
  id: number;
  type: "project" | "influencer_request";
  title: string;
  excerpt: string;
  budget: { min: number; max: number; currency: string };
  status: string;
  proposalsCount?: number;
  isFeatured?: boolean;
  category: { id: number; name: string } | null;
  owner: UserBrief;
  createdAt: string;
};

export type AdminWithdrawal = {
  id: number;
  amount: number;
  fee: number;
  currency: string;
  method: string;
  destination: string;
  status: "pending" | "paid" | "rejected" | "cancelled";
  payoutReference: string | null;
  rejectReason: string | null;
  user: UserBrief;
  createdAt: string;
  reviewedAt: string | null;
};

export type KycSubmission = {
  id: number;
  status: "pending" | "approved" | "rejected";
  documentType: string;
  documentNumber: string;
  fullName: string;
  dateOfBirth: string;
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
  user?: UserBrief;
  documentNumberFull?: string;
  files?: { front: string | null; back: string | null; selfie: string | null };
};

export type AdminReport = {
  id: number;
  targetType: "user" | "project" | "portfolio" | "review";
  targetId: number;
  target: { title: string; path: string | null } | null;
  reason: string;
  details: string | null;
  status: "open" | "actioned" | "dismissed";
  resolutionNote: string | null;
  reporter: { id: number; fullName: string; avatarUrl: string | null } | null;
  createdAt: string;
  reviewedAt: string | null;
};

export type AdminFeedback = {
  id: number;
  context: string;
  referenceId: number | null;
  rating: "up" | "down";
  comment: string | null;
  user: { id: number; fullName: string; avatarUrl: string | null } | null;
  createdAt: string;
};

export type ContactMessage = {
  id: number;
  userId: number | null;
  name: string;
  email: string;
  topic: string;
  subject: string;
  message: string;
  status: "new" | "handled";
  adminNote: string | null;
  createdAt: string;
  handledAt: string | null;
};

export type AdminPage = {
  slug: string;
  section: "about" | "help" | "legal";
  titleEn: string;
  titleAr: string;
  bodyEn: string;
  bodyAr: string;
  isPublished: boolean;
  sortOrder: number;
  updatedAt: string | null;
};

export type AdminCategory = {
  id: number;
  type: "project" | "influencer";
  slug: string;
  nameEn: string;
  nameAr: string;
  icon: string | null;
  sortOrder: number;
  projects: number;
};

export type AdminPlan = {
  id: number;
  code: string;
  audience: "client" | "freelancer";
  name: string;
  price: number;
  currency: string;
  isFree: boolean;
  isPopular: boolean;
  isActive?: boolean;
  perks: string[];
  features: Record<string, number | boolean | null> | [];
  subscribers: number;
};

export type AdminDraw = {
  id: number;
  title_en: string;
  title_ar: string;
  ticket_cost: number;
  max_tickets_per_user: number | null;
  starts_at: string;
  draw_at: string;
  status: "open" | "drawn" | "cancelled";
  prizes: { rank: number; name_en: string; name_ar: string; kind: "cash" | "item"; value: number | null; currency: string | null }[];
  drawn_at: string | null;
  entries_count: number;
  entries_sum_tickets: number | null;
};

export type SiteSettings = {
  siteFeePercent: number;
  depositMin: number;
  depositMax: number;
  withdrawalMin: number;
  withdrawalFee: number;
  withdrawalRequiresKyc: boolean;
};

export type LedgerTransaction = {
  id: number;
  type: string;
  description: string | null;
  reference: { type: string; id: number } | null;
  entries: { account: { id: number; type: string; currency: string; userId: number | null }; amount: number; balanceAfter: number }[];
  createdAt: string;
};

export type TrialBalance = { currency: string; balanced: boolean; accounts: { type: string; accounts: number; balance: number }[] }[];

export type AffiliateOverview = {
  totals: { referrers: number; referredUsers: number; qualifiedReferrals: number; visits: number; commissions: { currency: string; amount: number }[] };
  topReferrers: { userId: number; fullName: string | null; tier: string | null; qualifiedReferrals: number; earned: number; currency: string }[];
  recent: { id: number; referrer: string; referred: string; ratePercent: number; amount: number; currency: string; createdAt: string }[];
};
