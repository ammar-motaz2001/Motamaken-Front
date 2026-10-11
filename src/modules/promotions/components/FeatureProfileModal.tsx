"use client";

import { UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api/client";
import type { ApiError } from "@/lib/api/errors";
import type { Profile, User } from "@/lib/api/types";
import { PayModal } from "@/modules/payments";
import { CropStep } from "./CropStep";
import { PackagesStep } from "./PackagesStep";
import { PhotoStep } from "./PhotoStep";
import type { Promotion, PromotionPackage } from "./types";

type Step = "loading" | "noProfile" | "photo" | "crop" | "packages" | "pay";

export function FeatureProfileModal({ open, onClose, user, currency }: { open: boolean; onClose: () => void; user: User; currency: string }) {
  const t = useTranslations("Promotions");
  const router = useRouter();
  const [step, setStep] = useState<Step>("loading");
  const [file, setFile] = useState<Blob | null>(null);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chosen, setChosen] = useState<PromotionPackage | null>(null);

  useEffect(() => {
    if (!open) return;
    api<{ data: Profile | null }>("/me/profile")
      .then(({ data }) => setStep(data ? "photo" : "noProfile"))
      .catch(() => setStep("noProfile"));
  }, [open]);

  const close = () => {
    setStep("loading");
    setFile(null);
    setChosen(null);
    setError(null);
    onClose();
  };

  const upload = async (blob: Blob) => {
    setUploading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("avatar", blob, "avatar.jpg");
      const { data } = await api<{ data: User }>("/me/avatar", { method: "POST", body });
      setAvatarUrl(data.avatarUrl);
      router.refresh();
      setStep("packages");
    } catch (caught) {
      setError((caught as ApiError).fields.avatar ?? (caught as ApiError).message ?? t("photo.errors.upload"));
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  if (step === "pay" && chosen) {
    return (
      <PayModal
        open
        onClose={close}
        amount={chosen.price}
        currency={chosen.currency}
        feedbackContext="promotion"
        rows={[
          { label: t("summary.package"), value: t(`packages.names.${chosen.code}`) },
          { label: t("summary.quantity"), value: 1 },
        ]}
        pay={async () => {
          const { data } = await api<{ data: Promotion }>("/promotions", {
            method: "POST",
            body: { kind: "profile", package: chosen.code, currency: chosen.currency },
          });
          router.refresh();
          return data.id;
        }}
        success={{
          message: t("profileSuccess"),
          actions: () => (
            <>
              <Button variant="outline" font="button" href="/profile">
                {t("myProfile")}
              </Button>
              <Button variant="solid" font="button" href="/">
                {t("homepage")}
              </Button>
            </>
          ),
        }}
        errorActions={() => (
          <>
            <Button variant="outlineOrange" font="button" href="/profile">
              {t("myProfile")}
            </Button>
            <Button variant="orange" font="button" href="/">
              {t("homepage")}
            </Button>
          </>
        )}
      />
    );
  }

  const title = (
    <span className="flex flex-col gap-1 text-start">
      {step === "crop" ? t("photo.cropTitle") : t("profile.title")}
      {step !== "crop" && <span className="text-sm font-normal text-muted">{t("profile.subtitle")}</span>}
    </span>
  );

  return (
    <Modal open onClose={close} showClose title={title}>
      {step === "loading" && <span className="size-8 animate-spin rounded-full border-2 border-brand/30 border-t-brand" role="status" />}
      {step === "noProfile" && (
        <div className="flex flex-col items-center gap-3">
          <UserRound className="size-14 text-placeholder" strokeWidth={1.2} aria-hidden />
          <p className="max-w-md text-sm">{t("profile.needsProfile")}</p>
          <Button variant="solid" font="button" pill href="/profile">
            {t("profile.addProfile")}
          </Button>
        </div>
      )}
      {step === "photo" && (
        <PhotoStep name={user.fullName} currentUrl={avatarUrl} onCurrent={() => setStep("packages")} onFile={(blob) => (setFile(blob), setStep("crop"))} />
      )}
      {step === "crop" && file && <CropStep file={file} busy={uploading} onCrop={upload} />}
      {step === "packages" && (
        <PackagesStep
          currency={currency}
          intro={t("profile.intro")}
          onChoose={(item) => (setChosen(item), setStep("pay"))}
        />
      )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </Modal>
  );
}
