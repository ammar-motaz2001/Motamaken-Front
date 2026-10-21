"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/** Light/dark theme through a class on <html>, light by default, without colour transitions on change. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
