export const OUTBOUND_REQUEST_TIMEOUT_MS = 20_000;

/**
 * Drop-in `fetch` (it rejects like `fetch` does, so urql can use it) that gives up on stalled
 * requests and still honours the caller's abort signal.
 */
export const fetchWithTimeout = async (
  input: RequestInfo | URL,
  init: RequestInit,
  { service, timeoutMs = OUTBOUND_REQUEST_TIMEOUT_MS }: { service: string; timeoutMs?: number },
) => {
  const controller = new AbortController();
  const callerSignal = init.signal;
  let timedOut = false;
  const cancelFromCaller = () => controller.abort(callerSignal?.reason);

  if (callerSignal?.aborted) cancelFromCaller();
  else callerSignal?.addEventListener("abort", cancelFromCaller, { once: true });

  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (timedOut) {
      throw new Error(`${service} request timed out after ${timeoutMs / 1000} seconds.`, {
        cause: error,
      });
    }

    throw error;
  } finally {
    clearTimeout(timeout);
    callerSignal?.removeEventListener("abort", cancelFromCaller);
  }
};
