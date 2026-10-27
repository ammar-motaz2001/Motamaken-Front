"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/** Light/dark theme through a class on <html>, light by default, without colour transitions on change; its inline script carries the page's CSP nonce. */
export function ThemeProvider({ nonce, children }: { nonce?: string; children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" disableTransitionOnChange nonce={nonce}>
      {children}
    </NextThemesProvider>
  );
}
