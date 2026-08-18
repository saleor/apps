import { type StripeEnv } from "@/modules/stripe/stripe-env";

export const stripeEnvFromKeyPrefix = (raw: string | undefined): StripeEnv | null => {
  const key = raw?.trim() ?? "";

  if (key.startsWith("pk_test_") || key.startsWith("rk_test_")) {
    return "TEST";
  }

  if (key.startsWith("pk_live_") || key.startsWith("rk_live_")) {
    return "LIVE";
  }

  return null;
};

/**
 * Live hint for the config form header. Empty or incomplete keys stay silent; mixed
 * test/live prefixes also stay silent so the pill does not pick a side before save.
 *
 * On edit, an empty restricted-key field means “keep the saved key”. Pass that key’s
 * environment as `keptRestrictedKeyEnv` so changing only the publishable key to the
 * other mode hides the pill instead of claiming a switch that save will reject.
 */
export const inferStripeEnvFromKeys = ({
  publishableKey,
  restrictedKey,
  keptRestrictedKeyEnv = null,
}: {
  publishableKey: string | undefined;
  restrictedKey: string | undefined;
  keptRestrictedKeyEnv?: StripeEnv | null;
}): StripeEnv | null => {
  const publishableEnv = stripeEnvFromKeyPrefix(publishableKey);
  const restrictedEnv = stripeEnvFromKeyPrefix(restrictedKey) ?? keptRestrictedKeyEnv;

  if (publishableEnv && restrictedEnv && publishableEnv !== restrictedEnv) {
    return null;
  }

  return publishableEnv ?? restrictedEnv;
};
