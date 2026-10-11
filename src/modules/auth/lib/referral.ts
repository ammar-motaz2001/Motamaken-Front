const KEY = "motamakin_ref";
const DAYS = 30;

/**
 * Remembers the invite code from ?ref= for 30 days, so an invited visitor who signs up later still counts.
 */
export function rememberReferral(code: string | undefined) {
  try {
    if (code) localStorage.setItem(KEY, JSON.stringify({ code, until: Date.now() + DAYS * 864e5 }));
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null") as { code: string; until: number } | null;
    return saved && saved.until > Date.now() ? saved.code : undefined;
  } catch {
    return code;
  }
}

export function shouldRecordVisit(code: string) {
  try {
    const key = `${KEY}_visit_${code}`;
    if (sessionStorage.getItem(key)) return false;
    sessionStorage.setItem(key, "1");
    return true;
  } catch {
    return true;
  }
}
