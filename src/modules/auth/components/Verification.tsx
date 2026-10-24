"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ADMIN_LOGIN_PATH, afterLoginPath } from "@/lib/session";
import { rememberWelcome } from "@/lib/welcome";
import { createSession } from "../actions";
import { authService } from "../services/auth.service";
import type { AuthMethod } from "../types";
import { OtpForm } from "./OtpForm";
import { WelcomeModal } from "./WelcomeModal";

type VerificationProps = { method: AuthMethod; target: string };

/** Sign-up code step: once the code is right it shows the welcome dialog, then sends the user to sign in. */
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

/**
 * Sign-in code step (one-time or two-factor): saves the session, queues the welcome greeting and goes to `next`. From the
 * staff sign-in, an account that is not staff is signed back out and returned there with a message.
 */
export function LoginVerification({
  method,
  target,
  next,
  twoFactor,
  staff = false,
}: VerificationProps & { next?: string; twoFactor?: { method: string; hint: string }; staff?: boolean }) {
  const t = useTranslations("Otp");
  const router = useRouter();

  return (
    <OtpForm
      purpose="login"
      method={method}
      target={target}
      subtitle={twoFactor ? t(twoFactor.method === "phone" ? "twoFactorPhone" : "twoFactorEmail", { hint: twoFactor.hint }) : undefined}
      onVerified={async (result) => {
        const user = (result as { user?: { fullName?: string; username?: string; isAdmin?: boolean } }).user;
        if (staff && !user?.isAdmin) {
          void authService.revoke(result.accessToken ?? "");
          router.replace({ pathname: ADMIN_LOGIN_PATH, query: { method, denied: "1" } });
          return;
        }
        await createSession(result.accessToken ?? "");
        rememberWelcome(user?.fullName ?? user?.username ?? "");
        router.replace(afterLoginPath(next, user?.isAdmin));
      }}
    />
  );
}

/** Password-reset code step: a right code opens the new-password form with the token it returns. */
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
