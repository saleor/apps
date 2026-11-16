import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchWithTimeout } from "./fetch-with-timeout";

describe("fetchWithTimeout", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("aborts a stalled provider request", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_input: RequestInfo | URL, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
          }),
      ),
    );

    const request = fetchWithTimeout(
      "https://example.com",
      {},
      { service: "Saleor", timeoutMs: 50 },
    );
    const result = request.catch((error: unknown) => error);

    await vi.advanceTimersByTimeAsync(50);
    expect(await result).toMatchObject({ message: "Saleor request timed out after 0.05 seconds." });
  });

  it("passes caller cancellation to fetch", async () => {
    const caller = new AbortController();

    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_input: RequestInfo | URL, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener("abort", () => reject(new Error("cancelled")));
          }),
      ),
    );

    const request = fetchWithTimeout(
      "https://example.com",
      { signal: caller.signal },
      { service: "Saleor" },
    );

    caller.abort();

    await expect(request).rejects.toThrow("cancelled");
  });
});
