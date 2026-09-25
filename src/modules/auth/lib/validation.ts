import { isValidPhoneNumber } from "react-phone-number-input";

export type ValidationKey =
  | "emailRequired"
  | "emailInvalid"
  | "phoneRequired"
  | "phoneInvalid"
  | "usernameRequired"
  | "usernameInvalid"
  | "nameInvalid"
  | "passwordRequired"
  | "passwordWeak"
  | "confirmRequired"
  | "passwordMismatch"
  | "termsRequired";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_PATTERN = /^[\p{L}.]+( [\p{L}.]+)*$/u;
const NAME_PATTERN = /^[\p{L} ]+$/u;

export function passwordScore(password: string) {
  if (!password) return 0;
  return [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
}

export function validateEmail(value: string): ValidationKey | undefined {
  if (!value.trim()) return "emailRequired";
  if (!EMAIL_PATTERN.test(value.trim())) return "emailInvalid";
}

export function validatePhone(value: string): ValidationKey | undefined {
  if (!value) return "phoneRequired";
  if (!isValidPhoneNumber(value)) return "phoneInvalid";
}

export function validateUsername(value: string): ValidationKey | undefined {
  if (!value.trim()) return "usernameRequired";
  if (!USERNAME_PATTERN.test(value.trim())) return "usernameInvalid";
}

export function validateName(value: string): ValidationKey | undefined {
  if (value.trim() && !NAME_PATTERN.test(value.trim())) return "nameInvalid";
}

export function validatePassword(value: string): ValidationKey | undefined {
  if (!value) return "passwordRequired";
  if (passwordScore(value) < 4) return "passwordWeak";
}

export function validatePasswordConfirmation(password: string, confirmation: string): ValidationKey | undefined {
  if (!confirmation) return "confirmRequired";
  if (password !== confirmation) return "passwordMismatch";
}

export function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}
