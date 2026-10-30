"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "./Button";
import { Modal } from "./Modal";

type Request = { message: string; resolve: (ok: boolean) => void };

let show: ((request: Request) => void) | null = null;

/**
 * The site's own "Are you sure?" window, in place of the browser's `window.confirm`: resolves true on Confirm, false on
 * Cancel, Escape or a click outside. Needs <ConfirmHost /> on the page (it is in the root layout).
 */
export function confirmDialog(message: string): Promise<boolean> {
  return new Promise((resolve) => (show ? show({ message, resolve }) : resolve(window.confirm(message))));
}

/** Renders the window opened by {@link confirmDialog}. */
export function ConfirmHost() {
  const t = useTranslations("Common");
  const [request, setRequest] = useState<Request | null>(null);

  useEffect(() => {
    show = (next) => setRequest((current) => (current?.resolve(false), next));
    return () => {
      show = null;
    };
  }, []);

  const answer = (ok: boolean) => {
    request?.resolve(ok);
    setRequest(null);
  };

  return (
    <Modal open={request !== null} onClose={() => answer(false)}>
      <div className="flex w-[min(420px,calc(100vw-48px))] flex-col gap-6 p-2 text-center">
        <p className="text-base font-medium whitespace-pre-line text-heading">{request?.message}</p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" font="button" onClick={() => answer(false)}>
            {t("cancel")}
          </Button>
          <Button variant="solid" font="button" onClick={() => answer(true)} autoFocus>
            {t("confirm")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
