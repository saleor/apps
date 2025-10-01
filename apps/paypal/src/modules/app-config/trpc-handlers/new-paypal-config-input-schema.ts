import { z } from "zod";

import {
  createPayPalClientId,
  PayPalClientId,
} from "@/modules/paypal/paypal-publishable-key";
import {
  createPayPalClientSecret,
  PayPalClientSecret,
} from "@/modules/paypal/paypal-restricted-key";

export const newPayPalConfigInputSchema = z
  .object({
    name: z.string().min(1),
    clientId: z.string().transform((value, ctx): PayPalClientId => {
      const validPrefix = value.startsWith("sandbox_") || value.startsWith("live_");

      if (!validPrefix) {
        ctx.addIssue({
          message: "Invalid Publishable Key format. Must start with 'sandbox_' or 'live_'.",
          code: z.ZodIssueCode.custom,
          /**
           * Fatal flag is needed to avoid executing "refine" later.
           * So only if keys validation succeeds, refine is executed, otherwise it's aborted earlier.
           *
           * Without this flag, refine doesn't receive values anymore and it fails internally to validate
           */
          fatal: true,
        });

        return z.NEVER;
      }

      return createPayPalClientId(value).match(
        (parsed) => parsed,
        () => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid Publishable Key format",
            fatal: true,
          });

          return z.NEVER;
        },
      );
    }),
    clientSecret: z.string().transform((value, ctx): PayPalClientSecret => {
      const validPrefix = value.startsWith("sandbox_") || value.startsWith("live_");

      if (!validPrefix) {
        ctx.addIssue({
          message: "Invalid Restricted Key format. Must start with 'sandbox_' or 'live_'.",
          code: z.ZodIssueCode.custom,
          fatal: true,
        });

        return z.NEVER;
      }

      return createPayPalClientSecret(value).match(
        (parsed) => parsed,
        () => {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid Restricted Key format",
            fatal: true,
          });

          return z.NEVER;
        },
      );
    }),
  })
  .refine(
    (values) => {
      const isPkTest = values.clientId.startsWith("sandbox");
      const isPkLive = values.clientId.startsWith("live");
      const isRkTest = values.clientSecret.startsWith("sandbox");
      const isRkLive = values.clientSecret.startsWith("live");

      const isBothTest = isRkTest && isPkTest;
      const isBothLive = isRkLive && isPkLive;

      const isBothTestOrLive = isBothTest || isBothLive;

      return isBothTestOrLive;
    },
    {
      message: "Both Publishable and Restricted Keys must be live or test",
    },
  );

export type NewPayPalConfigInput = z.infer<typeof newPayPalConfigInputSchema>;
