export const fetchWithRateLimit = async <A, R>(
  args: A[],
  fun: (arg: A) => Promise<R>,
  requestPerSecondLimit: number
) => {
  const delay = 1000 / requestPerSecondLimit;
  const results: Promise<R>[] = [];

  for (const arg of args) {
    const result = fun(arg);
    results.push(result);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  return await Promise.all(results);
};
