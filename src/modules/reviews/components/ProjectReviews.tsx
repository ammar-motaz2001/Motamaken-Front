"use client";

import { Star } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Stars } from "@/components/ui/Stars";
import { panelClasses } from "@/components/ui/styles";
import { TextArea } from "@/components/ui/TextArea";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { Review } from "@/lib/api/types";

type ProjectReviewsProps = { projectId: number; initial: { data: Review[]; canReview: boolean }; otherName: string | null };

export function ProjectReviews({ projectId, initial, otherName }: ProjectReviewsProps) {
  const t = useTranslations("Reviews");
  const format = useFormatter();
  const [state, setState] = useState(initial);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!state.canReview && !state.data.length) return null;

  const submit = async () => {
    if (!rating) return setError(t("ratingRequired"));
    setBusy(true);
    setError(null);
    try {
      const { data } = await api<{ data: Review }>(`/projects/${projectId}/reviews`, { method: "POST", body: { rating, comment: comment.trim() || null } });
      setState({ data: [...state.data, data], canReview: false });
    } catch (caught) {
      setError((caught as ApiError).message || t("failed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`${panelClasses} flex flex-col gap-4`}>
      <h2 className="text-lg font-bold">{t("title")}</h2>

      {state.canReview && (
        <div className="flex flex-col gap-3 rounded-xl border border-brand/40 bg-brand-soft/40 p-4">
          <p className="text-sm font-medium">{t("prompt", { name: otherName ?? "" })}</p>
          <div role="radiogroup" aria-label={t("yourRating")} className="flex gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={rating === value}
                aria-label={t("stars", { count: value })}
                onMouseEnter={() => setHover(value)}
                onClick={() => (setRating(value), setError(null))}
              >
                <Star className={`size-7 ${value <= (hover || rating) ? "fill-[#f5b301] text-[#f5b301]" : "text-border"}`} />
              </button>
            ))}
          </div>
          <TextArea label={t("comment")} placeholder={t("commentPlaceholder")} rows={3} maxLength={2000} value={comment} onChange={(event) => setComment(event.target.value)} />
          {error && <p className="text-sm text-danger">{error}</p>}
          <Button variant="solid" font="button" loading={busy} onClick={submit} className="self-end">
            {t("submit")}
          </Button>
        </div>
      )}

      {state.data.length > 0 && (
        <ul className="flex flex-col divide-y divide-border">
          {state.data.map((review) => (
            <li key={review.id} className="flex gap-3 py-3 text-sm">
              <UserAvatar name={review.reviewer?.fullName ?? "?"} src={review.reviewer?.avatarUrl ?? null} size={36} />
              <div className="flex flex-col gap-1">
                <span className="flex flex-wrap items-center gap-2">
                  <Link href={`/users/${review.reviewer?.id}`} className="font-bold hover:text-brand">
                    {review.reviewer?.fullName}
                  </Link>
                  <Stars rating={review.rating} label={t("stars", { count: review.rating })} />
                  <span className="text-xs text-muted">{format.dateTime(new Date(review.createdAt), { dateStyle: "medium" })}</span>
                </span>
                {review.comment && <p className="whitespace-pre-line">{review.comment}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
