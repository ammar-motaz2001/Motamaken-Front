import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: "as-needed",
  // Remembers the chosen language; sent over HTTPS only.
  localeCookie: { secure: process.env.NODE_ENV === "production" },
});

export type Locale = (typeof routing.locales)[number];
