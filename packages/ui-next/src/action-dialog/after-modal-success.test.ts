import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { afterModalSuccess, MODAL_SUCCESS_TOAST_DELAY_MS } from "./after-modal-success";

describe("afterModalSuccess", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("closes immediately and notifies after the modal exit has started", () => {
    const close = vi.fn();
    const notify = vi.fn();

    afterModalSuccess({ close, notify });

    expect(close).toHaveBeenCalledTimes(1);
    expect(notify).not.toHaveBeenCalled();

    vi.advanceTimersByTime(MODAL_SUCCESS_TOAST_DELAY_MS - 1);
    expect(notify).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(notify).toHaveBeenCalledTimes(1);
  });

  it("can delay the toast when the dialog is already leaving", () => {
    const notify = vi.fn();

    afterModalSuccess({ notify });

    expect(notify).not.toHaveBeenCalled();
    vi.advanceTimersByTime(MODAL_SUCCESS_TOAST_DELAY_MS);
    expect(notify).toHaveBeenCalledTimes(1);
  });
});
