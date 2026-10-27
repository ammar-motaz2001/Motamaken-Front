"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuthGate } from "@/components/providers/AuthGateProvider";
import { api } from "@/lib/api/client";
import type { FavoriteIds } from "@/lib/api/types";

type Kind = "project" | "profile";

type FavoritesState = {
  signedIn: boolean;
  isSaved: (kind: Kind, id: number) => boolean;
  toggle: (kind: Kind, id: number) => Promise<void>;
};

const FavoritesContext = createContext<FavoritesState>({ signedIn: false, isSaved: () => false, toggle: async () => undefined });

const key = (kind: Kind, id: number) => `${kind}:${id}`;

/** Hearts a guest pressed, kept on this device until they have an account. */
const GUEST_KEY = "mutamakin:guest-favorites";

/** Hearts a guest saved on this device; an empty list when storage is blocked or broken. */
function readGuest(): string[] {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

/** Stores the guest's hearts on this device (removes the key when empty). */
function writeGuest(items: Set<string>) {
  try {
    if (items.size) localStorage.setItem(GUEST_KEY, JSON.stringify([...items]));
    else localStorage.removeItem(GUEST_KEY);
  } catch {
    // Storage blocked: the hearts still work for this visit.
  }
}

/**
 * What the user saved with the heart, shared by every card on the page. Only signed-in users can save; hearts a guest
 * saved on this device with an older version are added to the account when they log in.
 */
export function FavoritesProvider({ children }: { signedIn?: boolean; children: ReactNode }) {
  const { signedIn } = useAuthGate();
  const [saved, setSaved] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!signedIn) {
      // Restoring after mount: the server render has no access to the browser's storage.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSaved(new Set(readGuest()));
      return;
    }
    const pending = readGuest();
    Promise.allSettled(
      pending.map((item) => {
        const [type, id] = item.split(":");
        return api("/favorites", { method: "POST", body: { type, id: Number(id) } });
      }),
    )
      .then(() => {
        writeGuest(new Set());
        return api<FavoriteIds>("/me/favorites/ids");
      })
      .then(({ projects, profiles }) => setSaved(new Set([...projects.map((id) => key("project", id)), ...profiles.map((id) => key("profile", id))])))
      .catch(() => undefined);
  }, [signedIn]);

  const isSaved = useCallback((kind: Kind, id: number) => saved.has(key(kind, id)), [saved]);

  const toggle = useCallback(
    async (kind: Kind, id: number) => {
      const wasSaved = saved.has(key(kind, id));
      const flip = (on: boolean) =>
        setSaved((current) => {
          const next = new Set(current);
          if (on) next.add(key(kind, id));
          else next.delete(key(kind, id));
          return next;
        });

      // Saving needs an account (the heart asks guests to sign in first). Show the change at once and undo it if the
      // server refuses.
      flip(!wasSaved);
      try {
        await (wasSaved ? api(`/favorites/${kind}/${id}`, { method: "DELETE" }) : api("/favorites", { method: "POST", body: { type: kind, id } }));
      } catch {
        flip(wasSaved);
      }
    },
    [saved],
  );

  const value = useMemo(() => ({ signedIn, isSaved, toggle }), [signedIn, isSaved, toggle]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

/** Reads the saved-items state and the heart toggle from the nearest FavoritesProvider. */
export const useFavorites = () => useContext(FavoritesContext);
