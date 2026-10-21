import type { ReactNode } from "react";

type ErrorStateProps = { code: "404" | "500" | "403"; title: string; message: string; children: ReactNode };

const TONES = { "404": "text-orange", "500": "text-danger", "403": "text-orange" } as const;

/** Big error code (404, 403, 500) with a title, message and the action buttons the caller passes. */
export function ErrorState({ code, title, message, children }: ErrorStateProps) {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 py-20 text-center">
      <span aria-hidden className={`text-8xl leading-none font-bold sm:text-9xl ${TONES[code]}`}>
        {code}
      </span>
      <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
      <p className="max-w-lg text-base text-muted">{message}</p>
      <div className="flex flex-wrap justify-center gap-3">{children}</div>
    </section>
  );
}
