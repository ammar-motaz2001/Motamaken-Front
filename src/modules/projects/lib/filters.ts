export const FILTER_KEYS = ["q", "type", "category", "countryId", "cityId", "budgetMin", "budgetMax", "sort"] as const;
export type Filters = Partial<Record<(typeof FILTER_KEYS)[number], string>>;
