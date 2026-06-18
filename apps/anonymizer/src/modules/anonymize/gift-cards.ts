type GiftCardEmails = {
  createdByEmail?: string | null;
  usedByEmail?: string | null;
  events?: ReadonlyArray<{ email?: string | null }> | null;
};

type Balance = { amount: number; currency: string };

/**
 * A gift card holds a customer's PII in three places: `createdByEmail`
 * (bought/issued), `usedByEmail` (redeemed), and gift card events - notably the
 * "send to customer" recipient email, which Saleor stores only on a
 * SENT_TO_CUSTOMER/RESENT event (`event.email`), never on the card itself.
 * Saleor offers no server-side filter for any of these, so the by-email flow
 * matches all three client-side over every gift card. Matching is
 * case-insensitive, mirroring how Saleor compares emails.
 */
export const giftCardMatchesEmail = (card: GiftCardEmails, email: string) => {
  const normalized = email.trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  return (
    card.createdByEmail?.toLowerCase() === normalized ||
    card.usedByEmail?.toLowerCase() === normalized ||
    (card.events?.some((event) => event.email?.toLowerCase() === normalized) ?? false)
  );
};

/**
 * Sums gift card balances per currency. A store can hold gift cards in several
 * currencies, so the "balance at risk" shown before deletion cannot collapse to
 * a single figure - it is reported per currency, sorted by currency code for a
 * stable display.
 */
export const aggregateBalancesByCurrency = (
  cards: ReadonlyArray<{ currentBalance: Balance }>,
): Balance[] => {
  const totals = new Map<string, number>();

  for (const { currentBalance } of cards) {
    totals.set(
      currentBalance.currency,
      (totals.get(currentBalance.currency) ?? 0) + currentBalance.amount,
    );
  }

  return [...totals.entries()]
    .map(([currency, amount]) => ({ currency, amount }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
};

/**
 * Formats per-currency totals for display, e.g. "1250.00 USD, 300.00 EUR".
 * Returns an empty string when there is no balance to show.
 */
export const formatBalances = (balances: ReadonlyArray<Balance>) =>
  balances.map(({ amount, currency }) => `${amount.toFixed(2)} ${currency}`).join(", ");
