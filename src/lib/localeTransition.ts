/**
 * A soft cover for switching language: the page fades under a brand screen, changes language and direction (the
 * layout flips sides) out of sight, then the cover fades away. Built outside React on <html>, so it stays put while
 * the whole app re-renders in the new language.
 */
const COPY = { ar: "جارٍ التبديل إلى العربية", en: "Switching to English" } as const;
const FADE_IN = 220;
const FADE_OUT = 380;

function cover(next: keyof typeof COPY) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const el = document.createElement("div");
  el.setAttribute("aria-live", "polite");
  el.setAttribute("dir", next === "ar" ? "rtl" : "ltr");
  Object.assign(el.style, {
    position: "fixed",
    inset: "0",
    zIndex: "2147483000",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "18px",
    background: "var(--background)",
    opacity: "0",
    transition: reduce ? "none" : `opacity ${FADE_IN}ms cubic-bezier(0.4, 0, 0.2, 1)`,
    fontFamily: "var(--font-sans)",
  } satisfies Partial<CSSStyleDeclaration>);
  el.innerHTML = `
    <img src="/images/logo.png" alt="" width="158" height="42" style="height:42px;width:auto;animation:locale-pulse 1.4s ease-in-out infinite" />
    <span style="font-size:15px;font-weight:500;color:var(--muted);letter-spacing:-0.1px">${COPY[next]}</span>
    <span style="width:120px;height:3px;border-radius:9999px;background:color-mix(in srgb,var(--color-brand) 15%,transparent);overflow:hidden">
      <span style="display:block;height:100%;width:40%;border-radius:inherit;background:linear-gradient(90deg,var(--color-brand),var(--color-brand-light));animation:locale-slide 1s cubic-bezier(0.4,0,0.2,1) infinite"></span>
    </span>`;
  document.documentElement.appendChild(el);
  requestAnimationFrame(() => (el.style.opacity = "1"));
  return { el, reduce };
}

/**
 * Covers the page, runs `navigate` (the switch to `next`) once the cover is opaque, and lifts the cover when the page
 * reports the new language (`<html lang>`), or after a few seconds whatever happens.
 */
export function switchLocaleSmoothly(next: "ar" | "en", navigate: () => void) {
  if (document.documentElement.lang === next) return;
  const { el, reduce } = cover(next);

  const lift = () => {
    window.clearInterval(watch);
    window.clearTimeout(giveUp);
    el.style.transition = reduce ? "none" : `opacity ${FADE_OUT}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    // Two frames: the new page has painted in its new direction before it is revealed.
    requestAnimationFrame(() => requestAnimationFrame(() => (el.style.opacity = "0")));
    window.setTimeout(() => el.remove(), reduce ? 0 : FADE_OUT + 40);
  };

  let watch = 0;
  const giveUp = window.setTimeout(lift, 8000);
  window.setTimeout(
    () => {
      navigate();
      watch = window.setInterval(() => document.documentElement.lang === next && window.setTimeout(lift, 120), 60);
    },
    reduce ? 0 : FADE_IN,
  );
}
