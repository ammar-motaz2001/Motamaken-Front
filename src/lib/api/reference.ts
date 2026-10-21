import { cache } from "react";
import { apiGetOrNull, apiGetPublic } from "./server";
import type { Category, Country, Currency, PublicSiteSettings, Summary } from "./types";

/** All categories from GET /categories, cached for a minute; empty when the API fails. */
export const getCategories = cache(async () => (await apiGetPublic<{ data: Category[] }>("/categories"))?.data ?? []);

/** Supported currencies from GET /currencies, cached for a minute; empty when the API fails. */
export const getCurrencies = cache(async () => (await apiGetPublic<Currency[]>("/currencies")) ?? []);

/** All countries from GET /countries, cached for a minute; empty when the API fails. */
export const getCountries = cache(async () => (await apiGetPublic<{ data: Country[] }>("/countries"))?.data ?? []);

/** The signed-in user's summary (account, wallet, counters) from GET /me/summary, once per request; null for guests. */
export const getSummary = cache(async () => apiGetOrNull<Summary>("/me/summary"));

/** What the admins set under Site settings (contact details, links, maintenance, upload limits, payment methods); changes show within a minute. */
export const getSiteSettings = cache(async () => (await apiGetPublic<{ data: PublicSiteSettings }>("/site-settings"))?.data ?? null);
