"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { TextArea } from "@/components/ui/TextArea";

type TextModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  label: string;
  placeholder?: string;
  submitLabel: string;
  cancelLabel: string;
  minLength?: number;
  required?: boolean;
  children?: ReactNode;
  onSubmit: (text: string) => Promise<string | null>;
};

export function TextModal({ open, onClose, title, label, placeholder, submitLabel, cancelLabel, minLength = 0, required, children, onSubmit }: TextModalProps) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const close = () => {
    setText("");
    setError(null);
    onClose();
  };

  const submit = async () => {
    if (required && text.trim().length < minLength) return setError(label);
    setBusy(true);
    const failure = await onSubmit(text.trim());
    setBusy(false);
    if (failure) setError(failure);
    else close();
  };

  return (
    <Modal open={open} onClose={close} showClose title={title}>
      <div className="flex w-full flex-col gap-4 text-start">
        {children}
        <TextArea
          label={label}
          required={required}
          placeholder={placeholder}
          rows={4}
          maxLength={3000}
          value={text}
          error={error ?? undefined}
          onChange={(event) => (setText(event.target.value), setError(null))}
        />
        <div className="flex justify-center gap-3">
          <Button variant="outline" font="button" onClick={close}>
            {cancelLabel}
          </Button>
          <Button variant="solid" font="button" loading={busy} onClick={submit}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
