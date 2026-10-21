export type CardForm = { holderName: string; number: string; expiry: string; cvc: string };

export const EMPTY_CARD: CardForm = { holderName: "", number: "", expiry: "", cvc: "" };

/** Keeps only digits (up to 19) and groups them in fours, as the card number is typed. */
export const formatCardNumber = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");

/** Formats typed digits as "MM/YY". */
export const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

/** Luhn checksum that every real card number passes. */
function passesLuhn(digits: string) {
  let sum = 0;
  [...digits].reverse().forEach((char, index) => {
    const digit = Number(char) * (index % 2 ? 2 : 1);
    sum += digit > 9 ? digit - 9 : digit;
  });
  return sum % 10 === 0;
}

/** Splits "MM/YY" into the month and the four-digit year (NaN when the year is missing). */
export function parseExpiry(expiry: string) {
  const [month, year] = expiry.split("/").map(Number);
  return { expMonth: month, expYear: year ? 2000 + year : NaN };
}

/** Checks the holder name, number (length and Luhn), expiry (not past) and CVC; returns the fields that fail. */
export function validateCard(card: CardForm) {
  const errors: Partial<Record<keyof CardForm, string>> = {};
  const digits = card.number.replace(/\D/g, "");
  const { expMonth, expYear } = parseExpiry(card.expiry);
  const now = new Date();

  if (!/^[\p{L}\s.'-]{2,100}$/u.test(card.holderName.trim())) errors.holderName = "holderName";
  if (digits.length < 13 || !passesLuhn(digits)) errors.number = "number";
  if (
    !expMonth ||
    expMonth > 12 ||
    !expYear ||
    expYear < now.getFullYear() ||
    (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)
  ) {
    errors.expiry = "expiry";
  }
  if (!/^\d{3,4}$/.test(card.cvc)) errors.cvc = "cvc";

  return errors;
}

/** Card form as the API expects it: trimmed name, digits only, month and year apart. */
export function toCardPayload(card: CardForm) {
  return { type: "card", holderName: card.holderName.trim(), number: card.number.replace(/\D/g, ""), ...parseExpiry(card.expiry), cvc: card.cvc };
}
