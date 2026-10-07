/**
 * Why this app should no longer be used, in one plain string.
 *
 * Single source for both places it surfaces: the manifest (read by Saleor at install) and the
 * `appSelfUpdate` mutation (which backfills installations that predate the field). Saleor
 * truncates past 2048 characters — this is far below that.
 *
 * Plain text with no markup: Saleor stores it verbatim and the Dashboard chooses the rendering.
 */
export const DEPRECATION_REASON =
  "SMTP has been replaced by the Customer Emails app, which sends order, account, and " +
  "fulfillment emails through your own SMTP server. This app still works, but will not receive " +
  "new features. Email templates are not carried over — set the new app up alongside this one, " +
  "then uninstall this one.";
