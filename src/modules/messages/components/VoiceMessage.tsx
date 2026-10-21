"use client";

import Image from "next/image";
import { Pause } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { formatDuration } from "@/lib/format";

/** Play/pause control for a voice message with its elapsed and total time. */
export function VoiceMessage({ url, duration }: { url: string; duration: number }) {
  const t = useTranslations("Messages");
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const toggle = () => {
    const element = audio.current;
    if (!element) return;
    if (element.paused) element.play().catch(() => setPlaying(false));
    else element.pause();
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? t("pause") : t("play")}
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-orange text-white"
      >
        {playing ? (
          <Pause className="size-4 fill-white" />
        ) : (
          <Image src="/images/play.svg" alt="" width={14} height={16} className="ms-0.5 rotate-90" />
        )}
      </button>
      <Image src="/images/waveform.svg" alt="" width={76} height={44} className={playing ? "animate-pulse" : ""} />
      <span className="text-sm font-medium tabular-nums">{formatDuration(playing ? elapsed : duration)}</span>
      <audio
        ref={audio}
        src={url}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setElapsed(0);
        }}
        onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime)}
      />
    </div>
  );
}
