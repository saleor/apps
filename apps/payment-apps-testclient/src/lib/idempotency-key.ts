export const getIdempotencyKey = () => {
  const existingIdempotencyKey = localStorage.getItem("idempotencyKey");

  if (existingIdempotencyKey) {
    return existingIdempotencyKey;
  }

  const newKey = window.crypto.randomUUID();

  localStorage.setItem("idempotencyKey", newKey);

  return newKey;
};

export const clearIdempotencyKey = () => {
  localStorage.removeItem("idempotencyKey");
};
