import { z } from "zod";

import {
  hasPublishableKeyPrefix,
  hasRestrictedKeyPrefix,
  keysShareEnvironment,
  MIXED_KEY_ENVIRONMENTS_MESSAGE,
  PUBLISHABLE_KEY_FORMAT_MESSAGE,
  RESTRICTED_KEY_FORMAT_MESSAGE,
} from "@/modules/app-config/trpc-handlers/stripe-key-input-schemas";

/**
 * Client-side shape of the edit form. Unlike the tRPC input it keeps raw strings, because an empty
 * restricted key means "keep the saved one" and the field cannot be prefilled with a secret.
 * The server validates the same rules again on submit.
 */
export const editStripeConfigFormSchema = z
  .object({
    name: z.string().min(1, "Configuration name is required."),
    publishableKey: z.string().refine(hasPublishableKeyPrefix, PUBLISHABLE_KEY_FORMAT_MESSAGE),
    restrictedKey: z
      .string()
      .refine(
        (value) => value === "" || hasRestrictedKeyPrefix(value),
        RESTRICTED_KEY_FORMAT_MESSAGE,
      ),
  })
  .refine(
    ({ publishableKey, restrictedKey }) =>
      restrictedKey === "" || keysShareEnvironment({ publishableKey, restrictedKey }),
    {
      message: MIXED_KEY_ENVIRONMENTS_MESSAGE,
      path: ["restrictedKey"],
    },
  );

export type EditStripeConfigFormShape = z.infer<typeof editStripeConfigFormSchema>;
