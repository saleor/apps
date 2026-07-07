/**
 * Public metadata flag written to every order after it has been successfully
 * anonymized. The bulk scan skips orders that already carry it, which makes
 * re-runs idempotent (failed orders stay unflagged and are retried next run).
 */
export const ANONYMIZED_METADATA_KEY = "saleor-anonymized";
export const ANONYMIZED_METADATA_VALUE = "true";

export const isOrderAnonymized = (metadata: ReadonlyArray<{ key: string; value: string }>) =>
  metadata.some(
    (item) => item.key === ANONYMIZED_METADATA_KEY && item.value === ANONYMIZED_METADATA_VALUE,
  );

/**
 * Splits items into consecutive batches of `size`. Bulk operations process one
 * batch concurrently, so `size` is the effective concurrency limit.
 *
 * `size` must be a positive integer - a value of 0 or less would never advance
 * the loop and hang the UI, so it is rejected explicitly.
 */
export const chunkArray = <TItem>(items: readonly TItem[], size: number): TItem[][] => {
  if (!Number.isInteger(size) || size < 1) {
    throw new Error(`chunkArray: size must be a positive integer, received ${size}`);
  }

  const chunks: TItem[][] = [];

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }

  return chunks;
};
