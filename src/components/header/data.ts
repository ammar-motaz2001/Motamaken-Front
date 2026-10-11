import { getCategories, getCountries, getCurrencies, getSummary } from "@/lib/api/reference";
import type { Category, Country, Currency, Summary } from "@/lib/api/types";

export type HeaderData = {
  summary: Summary | null;
  currencies: Currency[];
  countries: Country[];
  categories: Category[];
};

export async function getHeaderData(signedIn: boolean): Promise<HeaderData> {
  const [summary, currencies, countries, categories] = await Promise.all([
    signedIn ? getSummary() : null,
    getCurrencies(),
    getCountries(),
    getCategories(),
  ]);

  return { summary, currencies, countries, categories };
}
