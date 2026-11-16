const IDEMPOTENCY_KEY_PREFIX = "idempotencyKey";

const getStorageKey = (scope?: string) =>
  scope ? `${IDEMPOTENCY_KEY_PREFIX}:${scope}` : IDEMPOTENCY_KEY_PREFIX;

export const getIdempotencyKey = (scope?: string) => {
  const storageKey = getStorageKey(scope);
  const existingIdempotencyKey = localStorage.getItem(storageKey);

  if (existingIdempotencyKey) {
    return existingIdempotencyKey;
  }

  const newKey = window.crypto.randomUUID();

  localStorage.setItem(storageKey, newKey);

  return newKey;
};

export const clearIdempotencyKey = (scope?: string) => {
  if (scope) {
    localStorage.removeItem(getStorageKey(scope));

    return;
  }

  localStorage.removeItem(IDEMPOTENCY_KEY_PREFIX);
};

export const clearCheckoutIdempotencyKeys = (envUrl: string, checkoutId: string) => {
  const prefix = `${IDEMPOTENCY_KEY_PREFIX}:${envUrl}:${checkoutId}:`;

  Object.keys(localStorage)
    .filter((key) => key.startsWith(prefix))
    .forEach((key) => localStorage.removeItem(key));
};
