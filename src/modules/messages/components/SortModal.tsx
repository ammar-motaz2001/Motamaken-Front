"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export const SORTS = ["oldest", "newest", "unread"] as const;
export type Sort = (typeof SORTS)[number];

type SortModalProps = {
  open: boolean;
  value: Sort;
  onClose: () => void;
  onApply: (sort: Sort) => void;
};

export function SortModal({ open, value, onClose, onApply }: SortModalProps) {
  const t = useTranslations("Messages");
  const [choice, setChoice] = useState(value);

  return (
    <Modal open={open} onClose={onClose} title={t("sortTitle")} showClose>
      <fieldset className="flex w-full max-w-[420px] flex-col gap-2 text-start">
        <legend className="sr-only">{t("sortTitle")}</legend>
        {SORTS.map((sort) => (
          <label
            key={sort}
            className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-2.5 text-sm ${
              choice === sort ? "border-brand" : "border-border"
            }`}
          >
            {t(`sort.${sort}`)}
            <input
              type="radio"
              name="sort"
              value={sort}
              checked={choice === sort}
              onChange={() => setChoice(sort)}
              className="size-4 accent-brand"
            />
          </label>
        ))}
      </fieldset>
      <Button variant="outline" width={140} onClick={() => onApply(choice)}>
        {t("sortApply")}
      </Button>
    </Modal>
  );
}
