/**
 * Saleor has no exact server-side filter on a checkout's own email column: the
 * `customer` filter matches via the linked user (missing guest checkouts) and
 * `search` is fuzzy full-text. So the by-email flow matches on the checkout
 * `email` field client-side. Matching is case-insensitive (mirroring how Saleor
 * compares emails) and covers both guest and registered checkouts.
 */
export const checkoutMatchesEmail = (checkout: { email?: string | null }, email: string) => {
  const normalized = email.trim().toLowerCase();

  if (!normalized) {
    return false;
  }

  return checkout.email?.toLowerCase() === normalized;
};
