import { BaseError } from "@/lib/errors";

export const CreatePaymentIntentError = BaseError.subclass("CreatePaymentIntentError", {
  props: {
    internalName: "CreatePaymentIntentError" as const,
  },
});
