/**
 * Why this app should no longer be used, in one plain string.
 *
 * Single source for both places it is sent: the manifest (read by Saleor at install) and the
 * `appSelfUpdate` mutation (which backfills installations that predate the field). The Dashboard
 * renders it outside the app's iframe, so the app itself shows nothing. Saleor truncates past
 * 2048 characters — this is far below that.
 *
 * Plain text with no markup: Saleor stores it verbatim and the Dashboard chooses the rendering.
 */
export const DEPRECATION_REASON =
  "Product Feed has been replaced by the Google Merchant Center app, which generates feeds " +
  "asynchronously and handles much larger catalogs. This app still works, but will not receive " +
  "new features. Configuration is not carried over — set the new app up alongside this one, " +
  "then uninstall this one.";
