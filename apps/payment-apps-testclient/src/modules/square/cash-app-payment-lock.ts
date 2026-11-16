import { clearIdempotencyKey, getIdempotencyKey } from "../../lib/idempotency-key";

const CASH_APP_PAYMENT_LOCK_PREFIX = "cashAppPaymentLock";

const getCashAppPaymentLockStorageKey = (scope: string) =>
  `${CASH_APP_PAYMENT_LOCK_PREFIX}:${scope}`;

export const acquireCashAppPaymentLock = (scope: string) => {
  const idempotencyKey = getIdempotencyKey(scope);

  localStorage.setItem(getCashAppPaymentLockStorageKey(scope), "locked");

  return idempotencyKey;
};

export const hasCashAppPaymentLock = (scope: string) =>
  localStorage.getItem(getCashAppPaymentLockStorageKey(scope)) === "locked";

export const releaseCashAppPaymentLock = (scope: string) => {
  localStorage.removeItem(getCashAppPaymentLockStorageKey(scope));
  clearIdempotencyKey(scope);
};
