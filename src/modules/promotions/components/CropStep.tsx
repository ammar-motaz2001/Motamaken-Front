"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Button } from "@/components/ui/Button";

const VIEW = 280;
const OUTPUT = 512;

/** Square crop of a chosen photo with drag and zoom; returns the cropped image. */
export function CropStep({ file, busy, onCrop }: { file: Blob; busy: boolean; onCrop: (blob: Blob) => void }) {
  const t = useTranslations("Promotions.photo");
  const [url, setUrl] = useState("");
  const [natural, setNatural] = useState({ width: 1, height: 1 });
  const [zoom, setZoom] = useState(1);
  const [rawOffset, setOffset] = useState({ x: 0, y: 0 });
  const image = useRef<HTMLImageElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = () => setUrl(String(reader.result));
    reader.readAsDataURL(file);
    return () => reader.abort();
  }, [file]);

  const base = VIEW / Math.min(natural.width, natural.height);
  const scale = base * zoom;
  const width = natural.width * scale;
  const height = natural.height * scale;
  const clamp = (value: { x: number; y: number }) => ({
    x: Math.min(0, Math.max(VIEW - width, value.x)),
    y: Math.min(0, Math.max(VIEW - height, value.y)),
  });

  const offset = clamp(rawOffset);

  const onLoad = () => {
    const img = image.current;
    if (!img) return;
    const size = { width: img.naturalWidth, height: img.naturalHeight };
    const fit = VIEW / Math.min(size.width, size.height);
    setNatural(size);
    setOffset({ x: (VIEW - size.width * fit) / 2, y: (VIEW - size.height * fit) / 2 });
  };

  const move = (event: PointerEvent) => {
    if (!drag.current) return;
    setOffset(clamp({ x: event.clientX - drag.current.x, y: event.clientY - drag.current.y }));
  };

  const crop = () => {
    const img = image.current;
    if (!img) return;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT;
    canvas.height = OUTPUT;
    const side = VIEW / scale;
    canvas.getContext("2d")?.drawImage(img, -offset.x / scale, -offset.y / scale, side, side, 0, 0, OUTPUT, OUTPUT);
    canvas.toBlob((blob) => blob && onCrop(blob), "image/jpeg", 0.9);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative cursor-grab touch-none overflow-hidden rounded-lg bg-surface-muted active:cursor-grabbing"
        style={{ width: VIEW, height: VIEW }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { x: event.clientX - offset.x, y: event.clientY - offset.y };
        }}
        onPointerMove={move}
        onPointerUp={() => (drag.current = null)}
      >
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            ref={image}
            src={url}
            alt=""
            draggable={false}
            onLoad={onLoad}
            className="absolute max-w-none select-none"
            style={{ width, height, left: offset.x, top: offset.y }}
          />
        )}
        <div className="pointer-events-none absolute inset-3 rounded-full border-2 border-orange shadow-[0_0_0_999px_rgba(0,0,0,0.35)]" />
      </div>
      <label className="flex w-full max-w-[280px] items-center gap-3 text-xs text-muted">
        {t("zoom")}
        <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} className="flex-1 accent-brand" />
      </label>
      <Button variant="primary" font="button" loading={busy} onClick={crop}>
        {t("crop")}
      </Button>
    </div>
  );
}
