"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useDismiss } from "@/components/ui/useDismiss";
import { formatDuration } from "@/lib/format";

const EMOJIS = ["😀", "😂", "😊", "😍", "🤔", "😎", "😢", "🙏", "👍", "👍🏼", "👏", "🙌🏻", "🔥", "🎉", "✅", "❤️", "💯", "🤝", "👌", "😅"];
const ACCEPTED_FILES = ".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar";
const MAX_FILE_BYTES = 20 * 1024 * 1024;

type ComposerProps = {
  sending: boolean;
  onSendText: (body: string) => Promise<boolean>;
  onSendFile: (form: FormData) => Promise<boolean>;
  onError: (message: string) => void;
};

/** Voice recording with the browser's MediaRecorder: start, stop to send, or cancel, with a running seconds counter. */
function useRecorder(onDone: (blob: Blob, seconds: number) => void) {
  const recorder = useRef<MediaRecorder | null>(null);
  const startedAt = useRef(0);
  const discard = useRef(false);
  const [seconds, setSeconds] = useState<number | null>(null);
  const active = seconds !== null;

  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setSeconds(Math.floor((Date.now() - startedAt.current) / 1000)), 500);
    return () => clearInterval(timer);
  }, [active]);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const chunks: Blob[] = [];
    // AAC in MP4 plays in every browser (Safari cannot play WebM); fall back to the browser's default.
    const mimeType = ["audio/mp4;codecs=mp4a.40.2", "audio/mp4", "audio/webm;codecs=opus"].find((type) => MediaRecorder.isTypeSupported(type));
    const media = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    media.ondataavailable = (event) => chunks.push(event.data);
    media.onstop = () => {
      stream.getTracks().forEach((track) => track.stop());
      const length = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
      setSeconds(null);
      if (!discard.current) onDone(new Blob(chunks, { type: media.mimeType }), length);
    };
    discard.current = false;
    startedAt.current = Date.now();
    recorder.current = media;
    media.start();
    setSeconds(0);
  };

  const stop = (cancel = false) => {
    discard.current = cancel;
    recorder.current?.stop();
  };

  return { seconds, start, stop };
}

/** Message box: text with emoji picker, file attachments and voice recording. */
export function Composer({ sending, onSendText, onSendFile, onError }: ComposerProps) {
  const t = useTranslations("Messages");
  const fileInput = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const textInput = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const closeEmoji = useCallback(() => setEmojiOpen(false), []);
  useDismiss(emojiOpen, emojiRef, closeEmoji);

  // A voice note is being sent: no new recording until it is done (the mic stays off meanwhile).
  const [uploading, setUploading] = useState(false);
  const recorder = useRecorder(async (blob, seconds) => {
    const extension = blob.type.includes("mp4") ? "m4a" : "webm";
    const form = new FormData();
    form.append("type", "voice");
    form.append("duration", String(seconds));
    form.append("file", new File([blob], `voice.${extension}`, { type: blob.type }));
    setUploading(true);
    try {
      await onSendFile(form);
    } finally {
      setUploading(false);
    }
  });
  const recording = recorder.seconds !== null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (recording) return recorder.stop();
    const body = text.trim();
    if (!body || sending) return;
    if (await onSendText(body)) setText("");
  };

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) return onError(t("fileTooLarge"));
    const form = new FormData();
    form.append("file", file);
    if (text.trim()) form.append("body", text.trim());
    if (await onSendFile(form)) setText("");
  };

  const record = () => recorder.start().catch(() => onError(t("micDenied")));

  return (
    <form onSubmit={submit} className="flex items-center gap-3 rounded-full bg-composer px-3 py-[11px]">
      {recording ? (
        <>
          <button type="button" onClick={() => recorder.stop(true)} aria-label={t("cancelRecording")} className="text-danger">
            <Trash2 className="size-5" />
          </button>
          <span className="flex flex-1 items-center gap-2 text-base">
            <span className="size-2.5 animate-pulse rounded-full bg-danger" aria-hidden />
            {t("recording")} {formatDuration(recorder.seconds ?? 0)}
          </span>
        </>
      ) : (
        <>
          <button type="button" onClick={() => fileInput.current?.click()} aria-label={t("attach")} className="shrink-0">
            <Image src="/images/attachment.svg" alt="" width={24} height={24} className="rotate-180 dark:invert" />
          </button>
          <input
            ref={fileInput}
            type="file"
            accept={ACCEPTED_FILES}
            className="hidden"
            onChange={(event) => {
              pickFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <input
            ref={textInput}
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder={t("reply")}
            aria-label={t("reply")}
            maxLength={5000}
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-bubble-meta"
          />
          <div ref={emojiRef} className="relative shrink-0">
            <button type="button" onClick={() => setEmojiOpen((value) => !value)} aria-label={t("emoji")} className="flex">
              <Image src="/images/emoji.svg" alt="" width={23} height={23} className="dark:invert" />
            </button>
            {emojiOpen && (
              <div className="absolute end-0 bottom-full z-30 mb-3 grid w-64 grid-cols-5 gap-1 rounded-xl border border-border bg-surface p-2 shadow-card">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setText((value) => value + emoji);
                      textInput.current?.focus();
                    }}
                    className="rounded-md p-1 text-2xl hover:bg-surface-muted"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" onClick={record} disabled={sending || uploading} aria-label={t("record")} className="shrink-0 disabled:opacity-40">
            <Image src="/images/mic.svg" alt="" width={24} height={24} className="dark:invert" />
          </button>
        </>
      )}
      <button
        type="submit"
        disabled={sending || uploading || (!recording && !text.trim())}
        aria-label={t("send")}
        className="flex size-12 shrink-0 items-center justify-center rounded-full bg-orange disabled:opacity-60"
      >
        {sending || uploading ? (
          <span className="size-5 animate-spin rounded-full border-2 border-white/50 border-t-white" role="status" />
        ) : (
          <Image src="/images/send-arrow.svg" alt="" width={20} height={20} className="rtl:-scale-x-100" />
        )}
      </button>
    </form>
  );
}
