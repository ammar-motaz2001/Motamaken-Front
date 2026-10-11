type SearchParams = Record<string, string | string[] | undefined>;

export function pickParams<K extends string>(params: SearchParams, keys: readonly K[]) {
  const picked: Partial<Record<K, string>> = {};
  keys.forEach((key) => {
    const value = params[key];
    if (typeof value === "string" && value.trim()) picked[key] = value.trim();
  });
  return picked;
}

export function toQuery(values: Record<string, string | undefined>) {
  const params = new URLSearchParams(Object.entries(values).filter((entry): entry is [string, string] => Boolean(entry[1])));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function pageParam(params: SearchParams) {
  const page = Number(params.page);
  return Number.isInteger(page) && page > 1 ? String(page) : undefined;
}
