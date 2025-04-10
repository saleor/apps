import { BaseError } from "@/lib/errors";

export const StripeEventParsingError = BaseError.subclass("StripeEventParsingError", {
  props: {
    internalName: "StripeEventParsingError" as const,
  },
});
