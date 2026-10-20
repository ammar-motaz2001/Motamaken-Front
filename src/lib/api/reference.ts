import { cache } from "react";
import { apiGetOrNull } from "./server";
import type { Category, Country, Currency, PublicSiteSettings, Summary } from "./types";

export const getCategories = cache(async () => (await apiGetOrNull<{ data: Category[] }>("/categories"))?.data ?? []);

export const getCurrencies = cache(async () => (await apiGetOrNull<Currency[]>("/currencies")) ?? []);

export const getCountries = cache(async () => (await apiGetOrNull<{ data: Country[] }>("/countries"))?.data ?? []);

export const getSummary = cache(async () => apiGetOrNull<Summary>("/me/summary"));

/** What the admins set under Site settings (contact details, links, maintenance, upload limits, payment methods). */
export const getSiteSettings = cache(async () => (await apiGetOrNull<{ data: PublicSiteSettings }>("/site-settings"))?.data ?? null);
