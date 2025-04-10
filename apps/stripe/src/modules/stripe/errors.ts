import { BaseError } from "@/lib/errors";

export const CreatePaymentIntentError = BaseError.subclass("CreatePaymentIntentError", {
  props: {
    internalName: "CreatePaymentIntentError" as const,
  },
});

export const StripeEventParsingError = BaseError.subclass("StripeEventParsingError", {
  props: {
    internalName: "StripeEventParsingError" as const,
  },
});
