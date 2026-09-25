"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useRouter } from "@/i18n/navigation";
import type { AuthMethod } from "../types";
import { OtpForm } from "./OtpForm";
import { SuccessTitle } from "./SuccessTitle";
import { modalTextClasses } from "./styles";

type VerificationProps = { method: AuthMethod; target: string };

export function SignupVerification({ method, target }: VerificationProps) {
  const t = useTranslations("Signup");
  const ta = useTranslations("Auth");
  const router = useRouter();
  const [done, setDone] = useState(false);
  const goToLogin = () => router.push({ pathname: "/login", query: { method } });

  return (
    <>
      <OtpForm purpose="signup" method={method} target={target} onVerified={() => setDone(true)} />
      <Modal open={done} onClose={goToLogin} title={<SuccessTitle />}>
        <p className={modalTextClasses}>{t("created")}</p>
        <Button font="button" width={235} onClick={goToLogin}>
          {ta("goToLogin")}
        </Button>
      </Modal>
    </>
  );
}

export function ResetVerification({ method, target }: VerificationProps) {
  const router = useRouter();

  return (
    <OtpForm
      purpose="reset"
      method={method}
      target={target}
      onVerified={(token) => router.push({ pathname: "/reset-password", query: { token: token ?? "" } })}
    />
  );
}
