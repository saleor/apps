/**
 * Pure helpers for the GDPR Removal flow's post-removal verification step.
 *
 * After the mutations run, the flow re-scans the store by the customer's
 * original email and feeds the counts here. Because the orders are scrambled
 * (their `userEmail` is overwritten), a successfully-anonymized order no longer
 * matches the original email - so "0 orders remain linked to this email" is the
 * success signal for anonymization, even though the order rows still exist.
 */

export type RemovalScope = {
  /**
   * Whether checkout deletion was attempted at all. `checkoutDelete` requires
   * Saleor >= 3.23; below that the checkouts line is reported as skipped rather
   * than failed, so an old store does not show a false red mark.
   */
  checkoutsApplicable: boolean;
  /** Whether there was a customer account to delete (always true via this flow). */
  hadCustomerAccount: boolean;
};

export type VerificationCounts = {
  /** Orders still matching the original email after re-scan. */
  remainingOrders: number;
  /** Checkouts still matching the original email after re-scan. */
  remainingCheckouts: number;
  /** Gift cards still matching the original email after re-scan. */
  remainingGiftCards: number;
  /** Whether `user(id:)` still resolves the account after re-scan. */
  customerStillExists: boolean;
};

export type VerificationStatus = "ok" | "failed" | "skipped";

export type VerificationLine = {
  type: "orders" | "checkouts" | "giftCards" | "customer";
  status: VerificationStatus;
  label: string;
};

/**
 * Turns the re-scan counts into a per-type pass/fail summary. Read-only: there
 * is no retry, so a mismatch just surfaces what is left behind for the operator
 * to re-scan (the flow is idempotent).
 */
export const buildVerificationSummary = (
  counts: VerificationCounts,
  scope: RemovalScope,
): VerificationLine[] => {
  const lines: VerificationLine[] = [];

  lines.push({
    type: "orders",
    status: counts.remainingOrders === 0 ? "ok" : "failed",
    label:
      counts.remainingOrders === 0
        ? "Orders anonymized — none remain linked to this email"
        : `${counts.remainingOrders} order(s) still linked to this email`,
  });

  if (scope.checkoutsApplicable) {
    lines.push({
      type: "checkouts",
      status: counts.remainingCheckouts === 0 ? "ok" : "failed",
      label:
        counts.remainingCheckouts === 0
          ? "Checkouts deleted"
          : `${counts.remainingCheckouts} checkout(s) still present`,
    });
  } else {
    lines.push({
      type: "checkouts",
      status: "skipped",
      label: "Checkout deletion requires Saleor 3.23+ — skipped",
    });
  }

  lines.push({
    type: "giftCards",
    status: counts.remainingGiftCards === 0 ? "ok" : "failed",
    label:
      counts.remainingGiftCards === 0
        ? "Gift cards deleted"
        : `${counts.remainingGiftCards} gift card(s) still present`,
  });

  if (scope.hadCustomerAccount) {
    lines.push({
      type: "customer",
      status: counts.customerStillExists ? "failed" : "ok",
      label: counts.customerStillExists
        ? "Customer account still exists"
        : "Customer account deleted",
    });
  }

  return lines;
};

/**
 * True when every applicable check passed (skipped lines do not count as
 * failures). Drives the green/red header on the result screen.
 */
export const isRemovalFullyVerified = (lines: ReadonlyArray<VerificationLine>) =>
  lines.every((line) => line.status !== "failed");
