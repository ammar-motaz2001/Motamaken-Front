"use client";

import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFavorites } from "@/components/providers/FavoritesProvider";

/** Heart that saves or unsaves a project or profile through the shared favourites state (guests save on this device). */
export function FavoriteButton({ kind, id, className = "" }: { kind: "project" | "profile"; id: number; className?: string }) {
  const t = useTranslations("Favorites");
  const { isSaved, toggle } = useFavorites();
  const saved = isSaved(kind, id);

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? t("remove") : t("save")}
      title={saved ? t("remove") : t("save")}
      onClick={() => toggle(kind, id)}
      className={`flex size-8 items-center justify-center rounded-full bg-surface/90 shadow-card transition-transform hover:scale-110 ${className}`}
    >
      <Heart className={`size-4 ${saved ? "fill-danger text-danger" : "text-muted"}`} />
    </button>
  );
}
