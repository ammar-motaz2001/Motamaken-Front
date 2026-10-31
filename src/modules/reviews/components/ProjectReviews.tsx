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

type ProjectReviewsProps = { projectId: number; initial: { data: Review[]; canReview: boolean; canReply?: boolean }; otherName: string | null };

/**
 * Reviews of a completed project: the client rates the freelancer once with stars and a comment
 * (POST /projects/{id}/reviews), and the freelancer answers it with a text reply (POST /reviews/{id}/reply).
 */
export function ProjectReviews({ projectId, initial, otherName }: ProjectReviewsProps) {
  const t = useTranslations("Reviews");
  const format = useFormatter();
  const [state, setState] = useState(initial);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  if (!state.canReview && !state.data.length) return null;

  const submit = async () => {
    if (!rating) return setError(t("ratingRequired"));
    setBusy(true);
    setError(null);
    try {
      const { data } = await api<{ data: Review }>(`/projects/${projectId}/reviews`, { method: "POST", body: { rating, comment: comment.trim() || null } });
      setState({ ...state, data: [...state.data, data], canReview: false });
    } catch (caught) {
      setError((caught as ApiError).message || t("failed"));
    } finally {
      setBusy(false);
    }
  };

  const sendReply = async (reviewId: number) => {
    if (reply.trim().length < 2) return setError(t("replyRequired"));
    setBusy(true);
    setError(null);
    try {
      const { data } = await api<{ data: Review }>(`/reviews/${reviewId}/reply`, { method: "POST", body: { reply: reply.trim() } });
      setState({ ...state, data: state.data.map((review) => (review.id === data.id ? data : review)), canReply: false });
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
                {review.reply && <ReviewReply text={review.reply} />}
                {state.canReply && !review.reply && (
                  <div className="mt-2 flex flex-col gap-2">
                    <TextArea label={t("reply")} placeholder={t("replyPlaceholder")} rows={2} maxLength={2000} value={reply} onChange={(event) => setReply(event.target.value)} />
                    {error && <p className="text-sm text-danger">{error}</p>}
                    <Button variant="solid" font="button" loading={busy} onClick={() => sendReply(review.id)} className="self-end">
                      {t("sendReply")}
                    </Button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** The freelancer's answer under a review. */
export function ReviewReply({ text }: { text: string }) {
  const t = useTranslations("Reviews");
  return (
    <div className="mt-1 rounded-lg border-s-2 border-brand bg-surface-muted px-3 py-2">
      <p className="text-xs font-semibold text-muted">{t("replyLabel")}</p>
      <p className="whitespace-pre-line">{text}</p>
    </div>
  );
}
