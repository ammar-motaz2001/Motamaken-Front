import { cache } from "react";
import { apiGetOrNull } from "./server";
import type { Category, Country, Currency, PublicSiteSettings, Summary } from "./types";

/** All categories from GET /categories, fetched once per request; empty when the API fails. */
export const getCategories = cache(async () => (await apiGetOrNull<{ data: Category[] }>("/categories"))?.data ?? []);

/** Supported currencies from GET /currencies, fetched once per request; empty when the API fails. */
export const getCurrencies = cache(async () => (await apiGetOrNull<Currency[]>("/currencies")) ?? []);

/** All countries from GET /countries, fetched once per request; empty when the API fails. */
export const getCountries = cache(async () => (await apiGetOrNull<{ data: Country[] }>("/countries"))?.data ?? []);

/** The signed-in user's summary (account, wallet, counters) from GET /me/summary, once per request; null for guests. */
export const getSummary = cache(async () => apiGetOrNull<Summary>("/me/summary"));

/** What the admins set under Site settings (contact details, links, maintenance, upload limits, payment methods). */
export const getSiteSettings = cache(async () => (await apiGetOrNull<{ data: PublicSiteSettings }>("/site-settings"))?.data ?? null);
