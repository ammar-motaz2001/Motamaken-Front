"use client";

import type { ComponentProps, MouseEvent } from "react";
import { useAuthGate } from "@/components/providers/AuthGateProvider";
import { Link, useRouter } from "@/i18n/navigation";

type AuthLinkProps = Omit<ComponentProps<"a">, "href"> & { href: string; reason?: string };

/**
 * A link to a page that only makes sense with an account (wallet, settings, invite a friend...). Guests are not sent
 * away to the login page: the quick sign-up opens right here and, once done, they land where they clicked.
 */
export function AuthLink({ href, reason, onClick, children, ...rest }: AuthLinkProps) {
  const { signedIn, requireAuth } = useAuthGate();
  const router = useRouter();

  if (signedIn) {
    return (
      <Link href={href} onClick={onClick} {...rest}>
        {children}
      </Link>
    );
  }

  const open = async (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    // A new tab or window goes through the normal login page instead.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
    event.preventDefault();
    if (await requireAuth(reason)) router.push(href);
  };

  // The real link keeps the language prefix (/ar/...), as the app's own links do.
  return (
    <Link href={href} onClick={open} {...rest}>
      {children}
    </Link>
  );
}
