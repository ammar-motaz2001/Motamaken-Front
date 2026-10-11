export type PromotionPackage = {
  code: string;
  days: number;
  reach: { min: number; max: number };
  price: number;
  currency: string;
};

export type Promotion = {
  id: number;
  kind: "profile" | "project";
  package: string | null;
  days: number;
  price: number;
  currency: string;
  pointsAwarded: number;
  endsAt: string;
  isActive: boolean;
};
