/**
 * Creates a promise that races between the provided promise and a timeout.
 *
 * This utility helps prevent promises from hanging indefinitely by adding
 * a timeout constraint. If the original promise doesn't resolve within
 * the specified timeout, the race will reject with the provided error.
 *
 * @example
 * ```ts
 * try {
 *   const result = await race({
 *     promise: fetch('https://api.example.com'),
 *     timeout: 5000, // 5 seconds
 *     error: new Error('API request timed out')
 *   });
 *   // Handle success
 * } catch (error) {
 *   // Handle timeout or other errors
 * }
 * ```
 *
 * @throws {Error} The provided error if the timeout is reached
 * @throws Any error that the original promise might reject with
 */
export function race<T>({
  promise,
  timeout,
  error,
}: {
  promise: Promise<T>;
  timeout: number;
  error: Error;
}): Promise<T> {
  let timer: NodeJS.Timeout | null = null;

  return Promise.race([
    new Promise<never>((_res, rej) => {
      timer = setTimeout(() => {
        rej(error);
      }, timeout);
    }),
    promise.finally(() => {
      if (timer) {
        clearTimeout(timer);
      }
    }),
  ]);
}
