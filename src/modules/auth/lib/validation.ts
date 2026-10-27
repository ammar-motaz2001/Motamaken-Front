import { isValidPhoneNumber } from "react-phone-number-input";

export type ValidationKey =
  | "emailRequired"
  | "emailInvalid"
  | "phoneRequired"
  | "phoneInvalid"
  | "usernameRequired"
  | "usernameInvalid"
  | "nameRequired"
  | "nameInvalid"
  | "passwordRequired"
  | "passwordWeak"
  | "confirmRequired"
  | "passwordMismatch"
  | "termsRequired";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const USERNAME_PATTERN = /^[\p{L}\p{N}._]+( [\p{L}\p{N}._]+)*$/u;
const NAME_PATTERN = /^[\p{L} ]+$/u;

/** Password strength from 0 to 4: length 8+, mixed case, a digit and a symbol each add one. */
export function passwordScore(password: string) {
  if (!password) return 0;
  return [
    password.length >= 8,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length;
}

/** Error key for an empty or badly formed email, or undefined when it is fine. */
export function validateEmail(value: string): ValidationKey | undefined {
  if (!value.trim()) return "emailRequired";
  if (!EMAIL_PATTERN.test(value.trim())) return "emailInvalid";
}

/** Error key for an empty or invalid international phone number, or undefined when it is fine. */
export function validatePhone(value: string): ValidationKey | undefined {
  if (!value) return "phoneRequired";
  if (!isValidPhoneNumber(value)) return "phoneInvalid";
}

/** Error key for an empty username or one with characters that are not allowed. */
export function validateUsername(value: string): ValidationKey | undefined {
  if (!value.trim()) return "usernameRequired";
  if (!USERNAME_PATTERN.test(value.trim())) return "usernameInvalid";
}

/** Error key when a name has characters that are not allowed; an empty name is fine. */
export function validateName(value: string): ValidationKey | undefined {
  if (!value.trim()) return "nameRequired";
  if (!NAME_PATTERN.test(value.trim())) return "nameInvalid";
}

/** Error key for an empty password or one weaker than all four strength rules. */
export function validatePassword(value: string): ValidationKey | undefined {
  if (!value) return "passwordRequired";
  if (passwordScore(value) < 4) return "passwordWeak";
}

/** Error key when the confirmation is empty or differs from the password. */
export function validatePasswordConfirmation(password: string, confirmation: string): ValidationKey | undefined {
  if (!confirmation) return "confirmRequired";
  if (password !== confirmation) return "passwordMismatch";
}

/** True when any field in an error map has a message. */
export function hasErrors(errors: Record<string, string | undefined>) {
  return Object.values(errors).some(Boolean);
}
