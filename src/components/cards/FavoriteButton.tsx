"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAuthGate } from "@/components/providers/AuthGateProvider";
import { useFavorites } from "@/components/providers/FavoritesProvider";

/** Heart that saves or unsaves a project or profile; guests are asked to sign in first, then it is saved. */
export function FavoriteButton({ kind, id, ownerId, className = "" }: { kind: "project" | "profile"; id: number; ownerId?: number; className?: string }) {
  const t = useTranslations("Favorites");
  const { isSaved, toggle, viewerId } = useFavorites();
  const { signedIn, requireAuth } = useAuthGate();
  const saved = isSaved(kind, id);
  // Nobody saves their own project or profile.
  if (ownerId !== undefined && ownerId === viewerId) return null;

  const press = async () => {
    if (!signedIn && !(await requireAuth(t("signUpReason")))) return;
    await toggle(kind, id);
  };

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? t("remove") : t("save")}
      title={saved ? t("remove") : t("save")}
      onClick={press}
      className={`flex size-8 items-center justify-center rounded-full bg-surface/90 shadow-card transition hover:scale-110 hover:bg-brand-soft ${className}`}
    >
      <Heart className={`size-4 ${saved ? "fill-danger text-danger" : "text-muted"}`} />
    </button>
  );
}
