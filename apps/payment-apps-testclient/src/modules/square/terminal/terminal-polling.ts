/*
 * One request at a time, with a capped backoff after failures. Cleanup prevents
 * a request that finishes after unmount from scheduling another timer.
 */
export function scheduleTerminalPolling(poll: () => Promise<boolean>) {
  let stopped = false;
  let failures = 0;
  let timer: ReturnType<typeof setTimeout>;

  function schedule() {
    timer = setTimeout(
      async () => {
        let succeeded = false;

        try {
          succeeded = await poll();
        } catch {
          // A transient request failure must not stop status recovery.
        }
        failures = succeeded ? 0 : Math.min(failures + 1, 4);
        if (!stopped) schedule();
      },
      Math.min(2500 * 2 ** failures, 30000),
    );
  }

  schedule();

  return () => {
    stopped = true;
    clearTimeout(timer);
  };
}
