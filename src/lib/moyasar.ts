import { api } from "@/lib/api/client";
import type { Deposit, PaymentMethod } from "@/lib/api/types";
import { parseExpiry, type CardForm } from "@/modules/settings/lib/card";

/** The publishable key of the Moyasar mode in use; set by PaymentsProvider from the site settings. */
let publishableKey: string | null = process.env.NEXT_PUBLIC_MOYASAR_PUBLISHABLE_KEY ?? null;

/** Called by PaymentsProvider with the key of the mode the admins chose (test or live). */
export function setMoyasarKey(key: string | null) {
  publishableKey = key;
}

export const RETURN_MESSAGE = "mutamakin:payment-return";

/** A card waiting for its one-time bank check when the check had to run in this tab (popup blocked). */
export const PENDING_CARD_KEY = "mutamakin:pending-card";

/** The page the customer paid from, so the result page can send them back to it. */
export const RETURN_TO_KEY = "mutamakin:payment-return-to";

/** Leaves for the bank page in this tab, remembering where to come back to. */
function redirectToGateway(url: string) {
  try {
    sessionStorage.setItem(RETURN_TO_KEY, window.location.pathname + window.location.search);
  } catch {}
  window.location.assign(url);
}

type ReturnTarget = { depositId: number } | { card: true };

/** Thrown when Moyasar rejects the card details; `fields` uses the card form's names (number, expiry, cvc, holderName). */
export class CardError extends Error {
  constructor(
    message: string,
    readonly fields: Partial<Record<keyof CardForm, string>> = {},
  ) {
    super(message);
  }
}

/**
 * Sends the card straight from the browser to Moyasar with the publishable key and returns a token. The card number
 * never touches our servers; the API only ever sees the token.
 *
 * - `saveOnly` (one payment): usable at once; every payment with it goes through 3-D Secure.
 * - otherwise (a card to keep): the customer confirms it once at `verificationUrl`; it then stays usable until the card
 *   expires and later payments usually need no bank page.
 */
async function tokenizeCard(card: CardForm, saveOnly = true): Promise<{ id: string; verificationUrl: string | null }> {
  const { expMonth, expYear } = parseExpiry(card.expiry);
  const response = await fetch("https://api.moyasar.com/v1/tokens", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      publishable_api_key: publishableKey,
      name: card.holderName.trim(),
      number: card.number.replace(/\D/g, ""),
      cvc: card.cvc,
      month: String(expMonth).padStart(2, "0"),
      year: String(expYear),
      save_only: saveOnly,
      callback_url: `${window.location.origin}/payments/return?card=1`,
    }),
  }).catch(() => null);

  const data = await response?.json().catch(() => null);
  if (response?.ok && typeof data?.id === "string") return { id: data.id, verificationUrl: saveOnly ? null : (data.verification_url ?? null) };

  const errors = (data?.errors ?? {}) as Record<string, unknown>;
  const fields: CardError["fields"] = {};
  if (errors.number) fields.number = "number";
  if (errors.cvc) fields.cvc = "cvc";
  if (errors.month || errors.year) fields.expiry = "expiry";
  if (errors.name) fields.holderName = "holderName";
  throw new CardError(typeof data?.message === "string" ? data.message : "", fields);
}

/** Stores a verified Moyasar token on the account (the API reads the card details from Moyasar). */
export function storeCardToken(token: string, makeDefault = false) {
  return api<{ data: PaymentMethod }>("/me/payment-methods", { method: "POST", body: { type: "card", token, makeDefault } });
}

/**
 * Saves a card on the account: tokenises it, has the customer confirm it once with their bank (in `popup`), then stores
 * it. If the popup was blocked the bank check runs in this tab and the return page finishes the saving.
 */
export async function saveTokenizedCard(card: CardForm, popup: Window | null, makeDefault = false) {
  try {
    const { id, verificationUrl } = await tokenizeCard(card, false);
    if (verificationUrl) {
      if (!popup || popup.closed) {
        sessionStorage.setItem(PENDING_CARD_KEY, JSON.stringify({ token: id, makeDefault }));
        redirectToGateway(verificationUrl);
        return new Promise<never>(() => undefined);
      }
      popup.location.href = verificationUrl;
      await waitForReturn(popup, { card: true });
    }
    return await storeCardToken(id, makeDefault);
  } finally {
    popup?.close();
  }
}

type CardDepositOptions = {
  amount: number;
  currency: string;
  /** A saved card, or a new card typed into the form. */
  savedCardId?: number;
  card?: CardForm;
  saveCard?: boolean;
  /** Paying for something (exact price): the API waives the top-up minimum. */
  forPurchase?: boolean;
  /** A window for the bank page; null sends this tab there and back to the result page. */
  popup: Window | null;
};

/**
 * Tops the wallet up by card through Moyasar, including 3-D Secure, and resolves with the settled deposit
 * (`succeeded` or `failed`). If the 3-D Secure window was blocked the page is redirected and the promise never resolves.
 */
export async function cardDeposit({ amount, currency, savedCardId, card, saveCard, forPurchase, popup: initialPopup }: CardDepositOptions): Promise<Deposit> {
  let popup = initialPopup;
  try {
    let source: { paymentMethodId: number } | { cardToken: string };
    if (savedCardId) source = { paymentMethodId: savedCardId };
    else if (saveCard) {
      // The bank check uses the window; a confirmed card is normally charged without another bank page.
      const saved = await saveTokenizedCard(card!, popup);
      source = { paymentMethodId: saved.data.id };
      popup = null;
    } else source = { cardToken: (await tokenizeCard(card!)).id };

    const { data } = await api<{ data: Deposit }>("/wallet/deposits", { method: "POST", body: { amount, currency, method: "card", ...(forPurchase && { purpose: "purchase" }), ...source } });
    if (data.status !== "pending" || !data.checkoutUrl) {
      popup?.close();
      return data;
    }

    if (!popup || popup.closed) {
      redirectToGateway(data.checkoutUrl);
      return new Promise<Deposit>(() => undefined);
    }

    popup.location.href = data.checkoutUrl;
    await waitForReturn(popup, { depositId: data.id });
    return (await api<{ data: Deposit }>(`/wallet/deposits/${data.id}/refresh`, { method: "POST" })).data;
  } catch (error) {
    popup?.close();
    throw error;
  }
}

/** Resolves when the return page reports back, or when the customer closes the 3-D Secure window. */
function waitForReturn(popup: Window, target: ReturnTarget) {
  return new Promise<void>((resolve) => {
    const done = () => {
      window.removeEventListener("message", onMessage);
      window.clearInterval(timer);
      resolve();
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.data?.type !== RETURN_MESSAGE) return;
      if ("card" in target ? event.data.card === true : event.data.depositId === target.depositId) done();
    };
    window.addEventListener("message", onMessage);
    const timer = window.setInterval(() => popup.closed && done(), 700);
  });
}
