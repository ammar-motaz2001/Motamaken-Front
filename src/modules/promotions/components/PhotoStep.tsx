"use client";

import { Camera, ImagePlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { UserAvatar } from "@/components/ui/UserAvatar";

const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp"];

type PhotoStepProps = { name: string; currentUrl: string | null; onCurrent: () => void; onFile: (file: Blob) => void };

/** Choose the photo for a featured profile: keep the current one, upload or drop a file, or take one with the camera. */
export function PhotoStep({ name, currentUrl, onCurrent, onFile }: PhotoStepProps) {
  const t = useTranslations("Promotions.photo");
  const input = useRef<HTMLInputElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => () => stream?.getTracks().forEach((track) => track.stop()), [stream]);

  useEffect(() => {
    if (video.current && stream) video.current.srcObject = stream;
  }, [stream]);

  const accept = (file: File | undefined) => {
    if (!file) return;
    if (!TYPES.includes(file.type)) return setError(t("errors.type"));
    if (file.size > MAX_BYTES) return setError(t("errors.size"));
    setError(null);
    onFile(file);
  };

  const drop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);
    accept(event.dataTransfer.files[0]);
  };

  const openCamera = async () => {
    try {
      setStream(await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } }));
      setError(null);
    } catch {
      setError(t("errors.camera"));
    }
  };

  const capture = () => {
    const source = video.current;
    if (!source) return;
    const canvas = document.createElement("canvas");
    canvas.width = source.videoWidth;
    canvas.height = source.videoHeight;
    canvas.getContext("2d")?.drawImage(source, 0, 0);
    canvas.toBlob((blob) => blob && onFile(blob), "image/jpeg", 0.92);
    stream?.getTracks().forEach((track) => track.stop());
    setStream(null);
  };

  const box = "flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border p-4 text-center text-sm";
  const action = "rounded-md border border-brand px-4 py-1.5 text-xs font-medium text-brand hover:bg-brand-soft";

  if (stream) {
    return (
      <div className="flex w-full flex-col items-center gap-3">
        <video ref={video} autoPlay playsInline muted className="aspect-video w-full max-w-md rounded-xl bg-black object-cover" />
        <div className="flex gap-3">
          <button type="button" className={action} onClick={() => (stream.getTracks().forEach((track) => track.stop()), setStream(null))}>
            {t("cancel")}
          </button>
          <button type="button" className={`${action} bg-brand text-white hover:bg-brand`} onClick={capture}>
            {t("capture")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <div className={`grid w-full gap-3 ${currentUrl ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
        {currentUrl && (
          <div className={box}>
            <span>{t("current")}</span>
            <UserAvatar name={name} src={currentUrl} size={64} />
            <button type="button" className={action} onClick={onCurrent}>
              {t("selectCurrent")}
            </button>
          </div>
        )}
        <div
          className={`${box} ${dragging ? "border-brand bg-brand-soft" : ""}`}
          onDragOver={(event) => (event.preventDefault(), setDragging(true))}
          onDragLeave={() => setDragging(false)}
          onDrop={drop}
        >
          <ImagePlus className="size-5 text-muted" aria-hidden />
          <span>{t("drop")}</span>
          <span className="text-xs text-placeholder">{t("formats")}</span>
          <button type="button" className={action} onClick={() => input.current?.click()}>
            {t("upload")}
          </button>
          <input ref={input} type="file" accept={TYPES.join(",")} className="sr-only" onChange={(event) => accept(event.target.files?.[0])} />
        </div>
        <div className={box}>
          <Camera className="size-5 text-muted" aria-hidden />
          <span>{t("camera")}</span>
          <button type="button" className={action} onClick={openCamera}>
            {t("takePhoto")}
          </button>
        </div>
      </div>
      {error && (
        <p role="alert" className="text-center text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
