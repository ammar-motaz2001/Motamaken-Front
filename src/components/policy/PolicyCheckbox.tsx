"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Markdown } from "@/components/ui/Markdown";
import { Modal } from "@/components/ui/Modal";
import { api } from "@/lib/api/client";
import type { SitePage } from "@/lib/api/types";

type PolicyCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  invalid?: boolean;
  /** The label; call `link` around the words that open the policy, e.g. `t.rich("agree", { link })`. */
  children: (link: (chunks: ReactNode) => ReactNode) => ReactNode;
  /** The info page to read (admins edit it under Admin → Info pages). */
  slug?: string;
};

/**
 * "I agree to the … privacy policy". The box is ticked by reading: the link (or the box itself) opens the policy, and
 * "I agree" unlocks once it was scrolled to the end. Unticking stays a single click.
 */
export function PolicyCheckbox({ checked, onChange, invalid, children, slug = "privacy-policy" }: PolicyCheckboxProps) {
  const [open, setOpen] = useState(false);

  const link = (chunks: ReactNode) => (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        setOpen(true);
      }}
      className="inline-block border-b border-brand-border font-bold"
    >
      {chunks}
    </button>
  );

  return (
    <>
      <Checkbox checked={checked} invalid={invalid} onChange={(event) => (event.target.checked ? setOpen(true) : onChange(false))}>
        {children(link)}
      </Checkbox>
      {open && (
        <PolicyDialog
          slug={slug}
          onClose={() => setOpen(false)}
          onAgree={() => {
            onChange(true);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}

/**
 * Shows a policy from GET /pages/{slug} in a dialog; the agree button unlocks once it has been scrolled to the end
 * (a short one counts as read at once).
 */
function PolicyDialog({ slug, onClose, onAgree }: { slug: string; onClose: () => void; onAgree: () => void }) {
  const t = useTranslations("Policy");
  const box = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState<SitePage | null>(null);
  const [failed, setFailed] = useState(false);
  const [readToEnd, setReadToEnd] = useState(false);

  useEffect(() => {
    api<{ data: SitePage }>(`/pages/${slug}`)
      .then(({ data }) => setPage(data))
      .catch(() => setFailed(true));
  }, [slug]);

  const check = () => {
    const element = box.current;
    if (element && element.scrollTop + element.clientHeight >= element.scrollHeight - 12) setReadToEnd(true);
  };

  // A short policy fits without scrolling: it counts as read once shown.
  useEffect(() => {
    if (page) requestAnimationFrame(check);
  }, [page]);

  return (
    <Modal open onClose={onClose} showClose title={page?.title ?? t("title")}>
      <div className="flex w-full flex-col gap-4 text-start">
        <div
          ref={box}
          onScroll={check}
          tabIndex={0}
          className="max-h-[55vh] min-h-40 overflow-y-auto rounded-lg border border-border bg-surface-muted/40 p-4 text-sm"
        >
          {page ? (
            <Markdown source={page.body} />
          ) : failed ? (
            <p className="text-danger">{t("failed")}</p>
          ) : (
            <span className="mx-auto block size-8 animate-spin rounded-full border-4 border-brand/30 border-t-brand" role="status" />
          )}
        </div>
        <p className={`text-xs ${readToEnd ? "text-brand" : "text-orange"}`} aria-live="polite">
          {readToEnd ? t("ready") : t("scrollHint")}
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" font="button" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button variant="solid" font="button" disabled={!readToEnd || !page} onClick={onAgree}>
            {t("agree")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
