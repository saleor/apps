/**
 * `checkoutDelete` was added in Saleor 3.23, so every checkout-deletion feature
 * is gated on the connected store reporting at least this version. The rest of
 * the app works on 3.22, so this gate is applied at runtime (per store) instead
 * of bumping the manifest's `requiredSaleorVersion`.
 */
export const MIN_CHECKOUT_DELETION_VERSION = { major: 3, minor: 23 } as const;

/**
 * Parses the `Shop.version` string (e.g. "3.23.0") into its numeric major and
 * minor parts. Returns null when the value is missing or cannot be parsed, so
 * the caller can fail closed and treat the feature as unsupported.
 */
export const parseSaleorVersion = (version: string | null | undefined) => {
  if (!version) {
    return null;
  }

  const match = /^(\d+)\.(\d+)/.exec(version.trim());

  if (!match) {
    return null;
  }

  return { major: Number(match[1]), minor: Number(match[2]) };
};

/**
 * Whether the connected Saleor supports `checkoutDelete` (>= 3.23). Unknown or
 * unrecognized versions are treated as unsupported.
 */
export const supportsCheckoutDeletion = (version: string | null | undefined) => {
  const parsed = parseSaleorVersion(version);

  if (!parsed) {
    return false;
  }

  if (parsed.major !== MIN_CHECKOUT_DELETION_VERSION.major) {
    return parsed.major > MIN_CHECKOUT_DELETION_VERSION.major;
  }

  return parsed.minor >= MIN_CHECKOUT_DELETION_VERSION.minor;
};
