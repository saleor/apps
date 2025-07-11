/**
 * TODO Move to one of shared packages
 */
export function racePromise<T>({
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
    new Promise<never>((res, rej) => {
      timer = setTimeout(() => {
        console.error("Promise timed out, rejecting with error:", error);
        rej(error);
      }, timeout);
    }),
    promise.catch((error) => {
      console.error("Promise rejected with error:", error);
      throw error; // Re-throw the error to be caught by the finally block
    }),
    promise.finally(() => {
      console.log("Promise resolved or rejected, clearing timer");
      if (timer) {
        clearTimeout(timer);
      }
    }),
  ]);
}
