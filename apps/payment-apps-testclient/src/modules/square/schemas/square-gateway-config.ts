import { z } from "zod";

const SquarePaymentMethodSchema = z.enum([
  "card",
  "gift-card",
  "apple-pay",
  "cash-app-pay",
  "afterpay-clearpay",
  "saved-card",
]);

const methodsRequiringCountryCode = new Set(["apple-pay", "cash-app-pay", "afterpay-clearpay"]);

export const SquareGatewayConfigSchema = z
  .object({
    square: z.object({
      environment: z.enum(["sandbox", "production"]),
      applicationId: z.string().min(1),
      locationId: z.string().min(1),
      countryCode: z.string().length(2).optional(),
    }),
    captureMode: z.literal("CHARGE"),
    methods: z.array(SquarePaymentMethodSchema),
  })
  .superRefine((config, context) => {
    const requiresCountryCode = config.methods.some((method) =>
      methodsRequiringCountryCode.has(method),
    );

    if (requiresCountryCode && !config.square.countryCode) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Square wallet methods require a location country code.",
        path: ["square", "countryCode"],
      });
    }
  });

export type SquareGatewayConfig = z.infer<typeof SquareGatewayConfigSchema>;
