import { cache } from "react";
import { apiGetOrNull } from "./server";
import type { Category, Country, Currency, Summary } from "./types";

export const getCategories = cache(async () => (await apiGetOrNull<{ data: Category[] }>("/categories"))?.data ?? []);

export const getCurrencies = cache(async () => (await apiGetOrNull<Currency[]>("/currencies")) ?? []);

export const getCountries = cache(async () => (await apiGetOrNull<{ data: Country[] }>("/countries"))?.data ?? []);

export const getSummary = cache(async () => apiGetOrNull<Summary>("/me/summary"));
