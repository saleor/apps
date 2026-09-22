/**
 * Overlay fade on macaw / Radix dialogs is about 150ms. Waiting just past the start means the
 * toast belongs to the page that changed, not the dialog that is still covering it.
 */
export const MODAL_SUCCESS_TOAST_DELAY_MS = 200;

/**
 * Start the dialog exit, then fire the success toast after a beat.
 *
 * Pass `close` when this call is what dismisses the dialog. Skip it when `ActionDialog` is
 * already leaving because `confirmButtonState` became `success`.
 *
 * Errors stay immediate — a fault belongs on the dialog that is still open.
 */
export const afterModalSuccess = ({
  close,
  notify,
}: {
  close?: () => void;
  notify: () => void;
}): void => {
  close?.();
  window.setTimeout(notify, MODAL_SUCCESS_TOAST_DELAY_MS);
};
