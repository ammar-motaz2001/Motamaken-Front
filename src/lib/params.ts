type SearchParams = Record<string, string | string[] | undefined>;

/** Takes only the listed query parameters that hold a non-empty text value, trimmed. */
export function pickParams<K extends string>(params: SearchParams, keys: readonly K[]) {
  const picked: Partial<Record<K, string>> = {};
  keys.forEach((key) => {
    const value = params[key];
    if (typeof value === "string" && value.trim()) picked[key] = value.trim();
  });
  return picked;
}

/** Builds "?a=1&b=2" from the values that are set, or an empty string when none are. */
export function toQuery(values: Record<string, string | undefined>) {
  const params = new URLSearchParams(Object.entries(values).filter((entry): entry is [string, string] => Boolean(entry[1])));
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** The `page` query parameter when it is a whole number above 1, else undefined (the first page). */
export function pageParam(params: SearchParams) {
  const page = Number(params.page);
  return Number.isInteger(page) && page > 1 ? String(page) : undefined;
}
