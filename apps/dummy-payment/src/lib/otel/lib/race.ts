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
    new Promise<never>((res, rej) => {
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
