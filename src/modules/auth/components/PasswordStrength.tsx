import { useTranslations } from "next-intl";
import { passwordScore } from "../lib/validation";

export function PasswordStrength({ password }: { password: string }) {
  const t = useTranslations("Validation");
  if (!password) return null;
  const score = passwordScore(password);

  return (
    <>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={score}
        className="relative h-[7px] w-full overflow-hidden rounded-3xl bg-border"
      >
        <div
          className="absolute inset-0 bg-gradient-strength transition-[clip-path] duration-300 rtl:scale-x-[-1]"
          style={{ clipPath: `inset(0 ${100 - score * 25}% 0 0 round 24px)` }}
        />
      </div>
      {score < 4 && (
        <p className="rounded-[5px] bg-danger-soft px-4 py-2.5 text-center text-base leading-4 text-danger sm:px-[68px]">
          {t("passwordWeak")}
        </p>
      )}
    </>
  );
}
