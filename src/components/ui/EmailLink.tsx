"use client";

import { useSyncExternalStore, type ReactNode } from "react";

const subscribe = () => () => undefined;

/**
 * An email address with its mailto link, kept out of the server HTML: Cloudflare's email obfuscation rewrites any
 * address it finds there, which breaks React's hydration and loads a script our CSP blocks. The address is split into
 * pieces on the server and becomes a link once the page runs in the browser.
 */
export function EmailLink({ email, className, children }: { email: string; className?: string; children?: ReactNode }) {
  const inBrowser = useSyncExternalStore(subscribe, () => true, () => false);
  const [user, domain] = email.split("@");
  const text = (
    <>
      {children}
      <span dir="ltr">
        <span>{user}</span>
        <span>@</span>
        <span>{domain}</span>
      </span>
    </>
  );

  return inBrowser ? (
    <a href={`mailto:${email}`} className={className}>
      {text}
    </a>
  ) : (
    <span className={className}>{text}</span>
  );
}
