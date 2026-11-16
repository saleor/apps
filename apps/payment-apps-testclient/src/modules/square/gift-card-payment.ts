import { type SquareTokenResult } from "./web-payments-sdk";

export type GiftCardAuthorizationState = {
  remainingAmount: number;
  currency: string;
  expiresAt: string;
  cardLast4?: string;
};

export const GIFT_CARD_AUTHORIZATION_DURATION_MS = 30 * 60 * 1_000;

export const parseGiftCardAuthorizationState = (
  value: string | null,
): GiftCardAuthorizationState | null => {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<GiftCardAuthorizationState>;

    if (
      typeof parsed.remainingAmount !== "number" ||
      !Number.isFinite(parsed.remainingAmount) ||
      parsed.remainingAmount <= 0 ||
      typeof parsed.currency !== "string" ||
      !parsed.currency ||
      typeof parsed.expiresAt !== "string" ||
      !Number.isFinite(Date.parse(parsed.expiresAt)) ||
      (parsed.cardLast4 != null && typeof parsed.cardLast4 !== "string")
    ) {
      return null;
    }

    return {
      remainingAmount: parsed.remainingAmount,
      currency: parsed.currency,
      expiresAt: parsed.expiresAt,
      ...(parsed.cardLast4 ? { cardLast4: parsed.cardLast4 } : {}),
    };
  } catch {
    return null;
  }
};

export const isGiftCardAuthorizationLive = ({
  authorization,
  authorizeStatus,
  chargeStatus,
  checkoutTotal,
  now = Date.now(),
}: {
  authorization: GiftCardAuthorizationState;
  authorizeStatus: string;
  chargeStatus: string;
  checkoutTotal: { amount: number; currency: string };
  now?: number;
}) =>
  Date.parse(authorization.expiresAt) > now &&
  authorizeStatus === "PARTIAL" &&
  chargeStatus === "NONE" &&
  authorization.remainingAmount < checkoutTotal.amount &&
  checkoutTotal.currency === authorization.currency;

export const getRemainingGiftCardAmount = ({
  amountDue,
  chargedAmount,
  currency,
}: {
  amountDue: number;
  chargedAmount: number;
  currency: string;
}) => {
  const fractionDigits = new Intl.NumberFormat("en", {
    style: "currency",
    currency,
  }).resolvedOptions().maximumFractionDigits;

  return Number((amountDue - chargedAmount).toFixed(fractionDigits));
};

export const createSandboxGiftCardTokenResult = (sourceId: string): SquareTokenResult => {
  const token = sourceId.trim();

  if (!token) {
    return {
      status: "ERROR",
      errors: [{ message: "Enter a Square Sandbox gift card ID." }],
    };
  }

  return { status: "OK", token };
};
