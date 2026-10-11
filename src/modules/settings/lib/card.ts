export type CardForm = { holderName: string; number: string; expiry: string; cvc: string };

export const EMPTY_CARD: CardForm = { holderName: "", number: "", expiry: "", cvc: "" };

export const formatCardNumber = (value: string) =>
  value
    .replace(/\D/g, "")
    .slice(0, 19)
    .replace(/(\d{4})(?=\d)/g, "$1 ");

export const formatExpiry = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

function passesLuhn(digits: string) {
  let sum = 0;
  [...digits].reverse().forEach((char, index) => {
    const digit = Number(char) * (index % 2 ? 2 : 1);
    sum += digit > 9 ? digit - 9 : digit;
  });
  return sum % 10 === 0;
}

export function parseExpiry(expiry: string) {
  const [month, year] = expiry.split("/").map(Number);
  return { expMonth: month, expYear: year ? 2000 + year : NaN };
}

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

export function toCardPayload(card: CardForm) {
  return { type: "card", holderName: card.holderName.trim(), number: card.number.replace(/\D/g, ""), ...parseExpiry(card.expiry), cvc: card.cvc };
}
