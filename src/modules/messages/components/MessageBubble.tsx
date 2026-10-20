import Image from "next/image";
import { Ban, FileText } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { UserAvatar } from "@/components/ui/UserAvatar";
import type { Message } from "@/lib/api/types";
import { formatTime } from "@/lib/format";
import { ReportButton } from "@/modules/reports/components/ReportButton";
import { VoiceMessage } from "./VoiceMessage";

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function Attachment({ message }: { message: Message }) {
  const file = message.attachment;
  if (!file) return null;

  if (message.type === "voice") return <VoiceMessage url={file.url} duration={message.duration ?? 0} />;

  if (file.mime.startsWith("image/")) {
    return (
      <a href={file.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg">
        <Image src={file.url} alt={file.name} width={240} height={180} unoptimized className="max-h-60 w-auto object-cover" />
      </a>
    );
  }

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noreferrer"
      className={`flex items-center gap-2 rounded-lg px-3 py-2 ${message.isMine ? "bg-white/15" : "bg-surface"}`}
    >
      <FileText className="size-5 shrink-0" />
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium">{file.name}</span>
        <span className="text-xs opacity-70">{formatSize(file.size)}</span>
      </span>
    </a>
  );
}

/** A message a moderator cleared after a report. */
function Removed() {
  const t = useTranslations("Messages");
  return (
    <p className="flex items-center gap-1.5 text-sm italic opacity-70">
      <Ban className="size-4" aria-hidden /> {t("removed")}
    </p>
  );
}

export function MessageBubble({ message, showSender }: { message: Message; showSender: boolean }) {
  const t = useTranslations("Messages");
  const locale = useLocale();
  const time = formatTime(message.createdAt, locale);
  const isVoice = message.type === "voice" && !message.removed;

  if (message.isMine) {
    return (
      <div className="flex flex-col items-end gap-[5px]">
        <div
          className={`flex max-w-[min(420px,85%)] flex-col gap-2 rounded-xl rounded-se-none px-[15px] py-2.5 text-base leading-6 break-words whitespace-pre-wrap ${
            isVoice ? "bg-brand-soft" : "bg-brand text-white"
          }`}
        >
          {message.removed ? (
            <Removed />
          ) : (
            <>
              <Attachment message={message} />
              {message.body && <p dir="auto">{message.body}</p>}
            </>
          )}
        </div>
        <span className="flex items-center gap-1 text-sm text-bubble-meta">
          {message.status === "read" ? (
            <Image src="/images/read-double.svg" alt="" width={13.5} height={8} />
          ) : (
            <Image src="/images/read-sent.svg" alt="" width={9} height={8} className="opacity-60 dark:invert" />
          )}
          {time}
        </span>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-2.5">
      {showSender && message.sender ? (
        <UserAvatar name={message.sender.fullName} src={message.sender.avatarUrl} size={40} />
      ) : (
        <span className="w-10 shrink-0" aria-hidden />
      )}
      <div className="flex max-w-[min(420px,80%)] flex-col gap-[5px]">
        {showSender && message.sender && <p className="text-base font-medium">{message.sender.fullName}</p>}
        <div
          className={`flex flex-col gap-2 text-base leading-6 break-words whitespace-pre-wrap ${
            isVoice ? "" : "rounded-xl rounded-ss-none bg-brand-soft px-[15px] py-2.5"
          }`}
        >
          {message.removed ? (
            <Removed />
          ) : (
            <>
              <Attachment message={message} />
              {message.body && <p dir="auto">{message.body}</p>}
            </>
          )}
        </div>
        <span className="flex items-center justify-end gap-3 text-sm text-bubble-meta">
          {!message.removed && (
            <span className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <ReportButton targetType="message" targetId={message.id} label={t("report")} />
            </span>
          )}
          {time}
        </span>
      </div>
    </div>
  );
}
