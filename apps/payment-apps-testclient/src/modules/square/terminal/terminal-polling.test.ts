import { afterEach, describe, expect, it, vi } from "vitest";

import { scheduleTerminalPolling } from "./terminal-polling";

describe("Terminal polling recovery", () => {
  afterEach(() => vi.useRealTimers());

  it("retries a failed status request and resets the delay after recovery", async () => {
    vi.useFakeTimers();
    const poll = vi.fn().mockResolvedValueOnce(false).mockResolvedValue(true);
    const stop = scheduleTerminalPolling(poll);

    await vi.advanceTimersByTimeAsync(2500);
    expect(poll).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(4999);
    expect(poll).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(poll).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(2500);
    expect(poll).toHaveBeenCalledTimes(3);
    stop();
    await vi.advanceTimersByTimeAsync(60000);
    expect(poll).toHaveBeenCalledTimes(3);
  });

  it("caps the retry delay and handles rejected requests", async () => {
    vi.useFakeTimers();
    const poll = vi.fn().mockRejectedValue(new Error("offline"));
    const stop = scheduleTerminalPolling(poll);

    for (const delay of [2500, 5000, 10000, 20000, 30000, 30000]) {
      const count = poll.mock.calls.length;

      await vi.advanceTimersByTimeAsync(delay - 1);
      expect(poll).toHaveBeenCalledTimes(count);
      await vi.advanceTimersByTimeAsync(1);
      expect(poll).toHaveBeenCalledTimes(count + 1);
    }
    stop();
  });

  it("does not schedule again if stopped during an in-flight request", async () => {
    vi.useFakeTimers();
    let finish!: (value: boolean) => void;
    const poll = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          finish = resolve;
        }),
    );
    const stop = scheduleTerminalPolling(poll);

    await vi.advanceTimersByTimeAsync(2500);
    await vi.advanceTimersByTimeAsync(60000);
    expect(poll).toHaveBeenCalledTimes(1);
    stop();
    finish(false);
    await vi.advanceTimersByTimeAsync(60000);
    expect(poll).toHaveBeenCalledTimes(1);
  });
});
