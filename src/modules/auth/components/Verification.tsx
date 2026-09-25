"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { AFTER_LOGIN_PATH } from "@/lib/session";
import { createSession } from "../actions";
import type { AuthMethod } from "../types";
import { OtpForm } from "./OtpForm";
import { WelcomeModal } from "./WelcomeModal";

type VerificationProps = { method: AuthMethod; target: string };

export function SignupVerification({ method, target }: VerificationProps) {
  const router = useRouter();
  const [done, setDone] = useState(false);

  return (
    <>
      <OtpForm purpose="signup" method={method} target={target} onVerified={() => setDone(true)} />
      <WelcomeModal open={done} onContinue={() => router.push({ pathname: "/login", query: { method } })} />
    </>
  );
}

export function LoginVerification({ method, target, next }: VerificationProps & { next?: string }) {
  const router = useRouter();

  return (
    <OtpForm
      purpose="login"
      method={method}
      target={target}
      onVerified={async ({ accessToken }) => {
        await createSession(accessToken ?? "");
        router.replace(next ?? AFTER_LOGIN_PATH);
      }}
    />
  );
}

export function ResetVerification({ method, target }: VerificationProps) {
  const t = useTranslations("Otp");
  const router = useRouter();

  return (
    <OtpForm
      purpose="reset"
      method={method}
      target={target}
      subtitle={method === "phone" ? t("subtitleWhatsapp") : undefined}
      onVerified={({ token }) => router.push({ pathname: "/reset-password", query: { token: token ?? "" } })}
    />
  );
}
