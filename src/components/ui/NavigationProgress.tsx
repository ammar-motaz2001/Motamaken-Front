"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

/** Same page and query (only a #section or nothing changes): no page load to show. */
function samePage(url: URL) {
  return url.pathname === window.location.pathname && url.search === window.location.search;
}

function Bar() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [progress, setProgress] = useState<number | null>(null);
  const timer = useRef<number | undefined>(undefined);

  // A click on an internal link starts the bar at once, then it creeps towards 90% until the new page arrives.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || samePage(url)) return;

      window.clearInterval(timer.current);
      setProgress(8);
      timer.current = window.setInterval(() => setProgress((value) => (value === null ? null : value + (90 - value) * 0.08)), 200);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // The new page is here: fill the bar and fade it out.
  useEffect(() => {
    window.clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reacting to the route change is the point here
    setProgress((value) => (value === null ? null : 100));
    const hide = window.setTimeout(() => setProgress(null), 350);
    return () => window.clearTimeout(hide);
  }, [pathname, search]);

  if (progress === null) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]">
      <div
        className="h-full bg-gradient-to-r from-brand to-brand-light shadow-[0_0_8px_var(--color-brand)] transition-[width,opacity] duration-300 ease-out rtl:ms-auto"
        style={{ width: `${progress}%`, opacity: progress >= 100 ? 0 : 1 }}
      />
    </div>
  );
}

/** Thin brand-coloured bar at the top of the page while the next page loads, so every click answers at once. */
export function NavigationProgress() {
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  );
}
